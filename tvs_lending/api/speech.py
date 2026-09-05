"""Local microphone transcription. No simulated transcripts or fabricated queries."""
import base64
import binascii
import io
from pathlib import Path
from threading import Lock
from fastapi import APIRouter, HTTPException
from .schemas import VoiceAssistantRequest

router = APIRouter()
_model = None
_lock = Lock()
MODEL_ROOT = Path(__file__).resolve().parents[2] / 'models_cache' / 'whisper'
LANGUAGES = {'ENGLISH':'en','HINDI':'hi','CHHATTISGARHI':'hi','TAMIL':'ta','TELUGU':'te','MARATHI':'mr','KANNADA':'kn','BENGALI':'bn'}

def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel('base', device='cpu', compute_type='int8', download_root=str(MODEL_ROOT), local_files_only=True)
    return _model

@router.post('/api/v1/assistant/stt/transcribe')
def transcribe(req: VoiceAssistantRequest):
    if not req.audio_base64 or len(req.audio_base64) > 8_000_000:
        raise HTTPException(400, 'Record a short question (up to 30 seconds).')
    try:
        audio = base64.b64decode(req.audio_base64, validate=True)
    except (ValueError, binascii.Error):
        raise HTTPException(400, 'Invalid audio recording.')
    if len(audio) < 100:
        raise HTTPException(422, 'No speech was recorded. Please try again.')
    if not _lock.acquire(blocking=False):
        raise HTTPException(429, 'Transcription is busy. Please try again shortly.')
    try:
        try:
            model = get_model()
        except Exception:
            raise HTTPException(503, 'Local speech recognition is not ready. You can type your question.')
        try:
            segments, _ = model.transcribe(io.BytesIO(audio), language=LANGUAGES.get(req.language, 'en'), beam_size=3, vad_filter=True, condition_on_previous_text=False)
            text = ' '.join(segment.text.strip() for segment in segments).strip()
        except Exception:
            raise HTTPException(422, 'This recording could not be decoded. Please record your question again.')
        if not text:
            raise HTTPException(422, 'No clear speech detected. Move closer to the microphone and try again.')
        return {'text': text[:4000], 'language': req.language, 'engine': 'faster-whisper-local', 'success': True}
    finally:
        _lock.release()
