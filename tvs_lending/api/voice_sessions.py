"""
Real-Time Conversational Voice Session WebSocket for TVS Krishi Saathi.
Implements Google Gemini Live WebSockets with bidirectional 16kHz PCM audio streaming,
24kHz spoken response playback, barge-in interruption handling, and grounded tool calling.
Falls back seamlessly to local transcription and vernacular RAG when offline.
"""

import os
import io
import json
import base64
import wave
import asyncio
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from tvs_lending.api.auth import get_user_by_token
from tvs_lending.assistant.krishi_saathi import KrishiSaathiAssistant
from tvs_lending.assistant.vernacular_prompts import SYSTEM_PROMPTS
from tvs_lending.assistant.tools import (
    GEMINI_LIVE_FUNCTION_DECLARATIONS,
    execute_tool,
)
from tvs_lending.assistant.voice_engine import VernacularVoiceEngine

logger = logging.getLogger("krishi_saathi_voice")
router = APIRouter(prefix="/assistant", tags=["Live Voice"])

_assistant = KrishiSaathiAssistant()
_voice_engine = VernacularVoiceEngine()


def _build_system_instruction(language: str, user_context: Dict[str, Any]) -> str:
    lang_upper = language.upper()
    base_prompt = SYSTEM_PROMPTS.get(lang_upper, SYSTEM_PROMPTS.get("HINDI", SYSTEM_PROMPTS["ENGLISH"]))
    
    app_id = user_context.get("application_id", "APP-2026-0042")
    user_name = user_context.get("name", "Farmer")
    
    instruction = (
        f"{base_prompt}\n\n"
        "VOICE PROTOCOL FOR GEOKISAAN KRISHI SAATHI (GEMINI LIVE):\n"
        "1. You are Krishi Saathi, a warm, respectful, practical farm-lending companion for GeoKisaan.\n"
        f"2. You are speaking with {user_name}. Default loan reference is {app_id}.\n"
        f"3. Speak naturally, warmly, and concisely in {language}. Keep spoken answers strictly to 2 or 3 short sentences, then ask one helpful question.\n"
        "4. GROUNDED REALITY & TOOLS: You have direct access to GeoKisaan databases and policies via tools:\n"
        "   - get_document_checklist: official required documentation for tractor/crop loans.\n"
        "   - get_authorized_application_status: check live sanction verdict, loan amount, and credit tier.\n"
        "   - get_authorized_repayment_schedule: explain Seasonally-Aligned Harvest EMI (lean maintenance vs harvest bullet).\n"
        "   - get_apmc_mandi_rates: real-time Chhattisgarh APMC mandi prices and MSP benchmarks.\n"
        "   - explain_crop_health: Sentinel-2 NDVI satellite vegetative health, CloudGap inpainting, and Bhuvan zoning.\n"
        "5. NEVER invent fictional loan balances, interest rates, or credit decisions. If unknown, invoke the relevant tool.\n"
        "6. If the user interrupts you, stop immediately and listen carefully to their correction.\n"
    )
    return instruction


@router.websocket("/live-voice")
async def saathi_live_voice_websocket(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    lang: Optional[str] = Query("HINDI"),
    application_id: Optional[str] = Query(None),
):
    """
    Bidirectional WebSocket endpoint for real-time conversational streaming dialogue.
    Connects to Google Gemini Live API when GEMINI_API_KEY is present;
    otherwise serves high-fidelity local streaming RAG + speech synthesis.
    """
    await websocket.accept()
    session_id = f"voice_session_{os.urandom(6).hex()}"
    active_language = lang or "HINDI"

    # Authenticate token if present
    user_context: Dict[str, Any] = {"language": active_language}
    if token:
        user = get_user_by_token(token)
        if user:
            user_context.update(user)
    if application_id:
        user_context["application_id"] = application_id

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # Try Gemini Live native audio if API key is provided
    if gemini_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            # Default model for real-time live native audio
            live_model = os.environ.get("GEMINI_LIVE_MODEL", "gemini-2.0-flash-exp")
            
            # Map prebuilt voice name by language
            voice_name = "Aoede" if active_language in ["ENGLISH", "TAMIL"] else "Porex"

            live_config = types.LiveConnectConfig(
                response_modalities=[types.Modality.AUDIO],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice_name)
                    )
                ),
                system_instruction=types.Content(
                    parts=[types.Part.from_text(text=_build_system_instruction(active_language, user_context))]
                ),
                tools=[{"function_declarations": GEMINI_LIVE_FUNCTION_DECLARATIONS}],
                input_audio_transcription=types.AudioTranscriptionConfig(),
                output_audio_transcription=types.AudioTranscriptionConfig(),
            )

            await websocket.send_json({
                "type": "ready",
                "provider": "gemini_live",
                "model": live_model,
                "session_id": session_id,
                "language": active_language,
            })

            async with client.aio.live.connect(model=live_model, config=live_config) as gemini_session:
                
                async def client_to_gemini():
                    try:
                        while True:
                            msg_text = await websocket.receive_text()
                            msg = json.loads(msg_text)
                            msg_type = msg.get("type")

                            if msg_type == "audio":
                                b64_data = msg.get("data")
                                if b64_data:
                                    pcm_chunk = base64.b64decode(b64_data)
                                    await gemini_session.send_realtime_input(
                                        audio=types.Blob(data=pcm_chunk, mime_type="audio/pcm;rate=16000")
                                    )
                            elif msg_type == "text":
                                user_text = msg.get("text", "")
                                if user_text:
                                    await gemini_session.send_realtime_input(text=user_text)
                            elif msg_type == "audio_stream_end":
                                await gemini_session.send_realtime_input(audio_stream_end=True)
                            elif msg_type == "interrupt":
                                # User tapped interrupt or spoke during playback
                                pass
                            elif msg_type == "ping":
                                await websocket.send_json({"type": "pong"})
                    except (WebSocketDisconnect, asyncio.CancelledError):
                        pass
                    except Exception as e:
                        logger.warning(f"Client to Gemini loop exited: {e}")

                async def gemini_to_client():
                    try:
                        async for response in gemini_session.receive():
                            # 1. Handle tool call
                            if response.tool_call:
                                function_responses = []
                                for fc in response.tool_call.function_calls:
                                    await websocket.send_json({
                                        "type": "tool_call",
                                        "name": fc.name,
                                        "status": "executing",
                                    })
                                    tool_res = execute_tool(fc.name, fc.args or {}, user_context)
                                    await websocket.send_json({
                                        "type": "tool_call",
                                        "name": fc.name,
                                        "status": "completed",
                                        "result": tool_res,
                                    })
                                    function_responses.append(
                                        types.FunctionResponse(
                                            id=fc.id,
                                            name=fc.name,
                                            response={"output": tool_res},
                                        )
                                    )
                                await gemini_session.send_tool_response(function_responses=function_responses)

                            # 2. Handle server content
                            server_content = response.server_content
                            if server_content:
                                # Interruption event
                                if getattr(server_content, "interrupted", False):
                                    await websocket.send_json({"type": "interrupted"})

                                # Audio model turn
                                if server_content.model_turn:
                                    for part in server_content.model_turn.parts:
                                        if part.inline_data and part.inline_data.data:
                                            audio_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                                            await websocket.send_json({
                                                "type": "audio",
                                                "data": audio_b64,
                                                "mime": "audio/pcm;rate=24000",
                                            })

                                # Transcriptions
                                if getattr(server_content, "input_transcription", None):
                                    text = server_content.input_transcription.text
                                    if text:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "role": "user",
                                            "text": text,
                                        })

                                if getattr(server_content, "output_transcription", None):
                                    text = server_content.output_transcription.text
                                    if text:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "role": "assistant",
                                            "text": text,
                                        })
                    except (WebSocketDisconnect, asyncio.CancelledError):
                        pass
                    except Exception as e:
                        logger.warning(f"Gemini to client loop exited: {e}")

                # Run both directions concurrently
                sender_task = asyncio.create_task(client_to_gemini())
                receiver_task = asyncio.create_task(gemini_to_client())
                done, pending = await asyncio.wait(
                    [sender_task, receiver_task],
                    return_when=asyncio.FIRST_COMPLETED,
                )
                for t in pending:
                    t.cancel()
                return

        except Exception as e:
            logger.error(f"Gemini Live connection failed or not available ({e}), falling back to local voice engine.")
            # Fall through to local fallback

    # -------------------------------------------------------------------------
    # LOCAL ROBUST VOICE FALLBACK
    # (Faster-Whisper STT + KrishiSaathi RAG + Local/Edge TTS)
    # -------------------------------------------------------------------------
    await websocket.send_json({
        "type": "ready",
        "provider": "local_fallback",
        "session_id": session_id,
        "language": active_language,
        "notice": "Operating on GeoKisaan high-resiliency local conversational engine.",
    })

    audio_pcm_buffer = bytearray()

    try:
        while True:
            msg_text = await websocket.receive_text()
            msg = json.loads(msg_text)
            msg_type = msg.get("type")

            if msg_type == "audio":
                b64_data = msg.get("data")
                if b64_data:
                    pcm_bytes = base64.b64decode(b64_data)
                    audio_pcm_buffer.extend(pcm_bytes)

            elif msg_type == "audio_stream_end" or msg_type == "speech_end":
                if len(audio_pcm_buffer) > 3200:  # > 0.1s audio
                    # Convert raw PCM 16kHz 16-bit mono into WAV container
                    wav_io = io.BytesIO()
                    with wave.open(wav_io, "wb") as wf:
                        wf.setnchannels(1)
                        wf.setsampwidth(2)
                        wf.setframerate(16000)
                        wf.writeframes(bytes(audio_pcm_buffer))
                    wav_io.seek(0)
                    wav_b64 = base64.b64encode(wav_io.read()).decode("utf-8")
                    audio_pcm_buffer.clear()

                    await websocket.send_json({"type": "state", "state": "thinking"})

                    # Transcribe
                    stt_res = _voice_engine.transcribe_audio(wav_b64, active_language)
                    transcript_text = stt_res.get("text", "").strip()

                    if transcript_text:
                        await websocket.send_json({
                            "type": "transcript",
                            "role": "user",
                            "text": transcript_text,
                        })

                        # Answer query with grounded RAG
                        rag_res = _assistant.answer_query(
                            user_message=transcript_text,
                            borrower_context=user_context,
                            language=active_language,
                            session_id=session_id,
                        )
                        reply_text = rag_res.get("response", "")

                        await websocket.send_json({
                            "type": "transcript",
                            "role": "assistant",
                            "text": reply_text,
                        })

                        # Synthesize speech
                        tts_res = _voice_engine.synthesize_speech(
                            text=reply_text,
                            language=active_language,
                        )

                        if tts_res.get("audio_base64"):
                            await websocket.send_json({
                                "type": "audio",
                                "data": tts_res["audio_base64"],
                                "mime": "audio/wav",
                            })
                    else:
                        await websocket.send_json({"type": "state", "state": "listening"})
                else:
                    audio_pcm_buffer.clear()

            elif msg_type == "text":
                user_text = msg.get("text", "").strip()
                if user_text:
                    await websocket.send_json({
                        "type": "transcript",
                        "role": "user",
                        "text": user_text,
                    })
                    await websocket.send_json({"type": "state", "state": "thinking"})

                    rag_res = _assistant.answer_query(
                        user_message=user_text,
                        borrower_context=user_context,
                        language=active_language,
                        session_id=session_id,
                    )
                    reply_text = rag_res.get("response", "")

                    await websocket.send_json({
                        "type": "transcript",
                        "role": "assistant",
                        "text": reply_text,
                    })

                    tts_res = _voice_engine.synthesize_speech(
                        text=reply_text,
                        language=active_language,
                    )
                    if tts_res.get("audio_base64"):
                        await websocket.send_json({
                            "type": "audio",
                            "data": tts_res["audio_base64"],
                            "mime": "audio/wav",
                        })

            elif msg_type == "interrupt":
                audio_pcm_buffer.clear()
                await websocket.send_json({"type": "interrupted"})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except (WebSocketDisconnect, asyncio.CancelledError):
        pass
    except Exception as e:
        logger.error(f"Error in local voice WebSocket: {e}")
