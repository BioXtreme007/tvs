import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckCheck,
  Sprout,
  Tractor,
  ShieldCheck,
  CloudRain,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  vernacularText?: string;
  sourceDoc?: string;
  time?: string;
  iconType?: 'sparkles' | 'file';
}

export const KrishiSaathiSection: React.FC = () => {
  const [language, setLanguage] = useState<'chhattisgarhi' | 'hindi' | 'english' | 'tamil'>('chhattisgarhi');
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Language-specific defaults and thread history
  const languagePresets = {
    chhattisgarhi: {
      placeholder: 'हार्वेस्ट EMI, लोन अप्रूवल, या PMFBY बीमा के बारे म पूछव...',
      quickPrompts: [
        { icon: Sprout, iconColor: 'text-amber-600', label: 'हार्वेस्ट EMI कइसे काम करथे?', query: 'हार्वेस्ट EMI कइसे काम करथे अउ बोआई बेरा कतका देना पड़ही?' },
        { icon: Tractor, iconColor: 'text-emerald-600', label: 'ट्रैक्टर लोन बर का-का कागज लगही?', query: 'ट्रैक्टर लोन बर कोन-कोन से दस्तावेज अउ कागज लगही?' },
        { icon: ShieldCheck, iconColor: 'text-blue-600', label: 'PMFBY फसल बीमा क्लेम कइसे करबो?', query: 'फसल नुकसान होए म PMFBY बीमा क्लेम कइसे करे जाथे?' },
        { icon: CloudRain, iconColor: 'text-purple-600', label: 'कम पानी गिरे म का किस्त रुक सकत हे?', query: 'सूखा परे या पानी कम गिरे म का किस्त आगे बढ़ सकत हे?' },
      ],
      initialMessages: [
        {
          id: 'cg-1',
          sender: 'assistant' as const,
          text: 'जय जोहार! मैं टीवीएस कृषि साथी हंव। तुंहर ट्रैक्टर लोन, फसल बीमा (PMFBY), अउ हार्वेस्ट किस्त (EMI) के बारे म सब जानकारी दे सकथंव।',
          vernacularText: 'TVS Credit कृषि ऋण नीति अउ उपग्रह जांच ले सत्यापित।',
          sourceDoc: 'TVS Credit Agri Policy Manual 2024 (Grounded RAG)',
          iconType: 'sparkles' as const,
        },
      ],
    },
    hindi: {
      placeholder: 'TVS Harvest EMI, लोन अप्रूवल, या PMFBY के बारे में पूछें...',
      quickPrompts: [
        { icon: Sprout, iconColor: 'text-amber-600', label: 'हार्वेस्ट EMI कैसे काम करती है?', query: 'हार्वेस्ट EMI कैसे काम करती है और बुवाई समय कितना देना पड़ता है?' },
        { icon: Tractor, iconColor: 'text-emerald-600', label: 'ट्रैक्टर लोन के लिए क्या दस्तावेज चाहिए?', query: 'ट्रैक्टर लोन के लिए कौन कौन से दस्तावेज लगते हैं?' },
        { icon: ShieldCheck, iconColor: 'text-blue-600', label: 'PMFBY फसल बीमा क्लेम कैसे करें?', query: 'फसल खराब होने पर PMFBY क्लेम कैसे रजिस्टर करें?' },
        { icon: CloudRain, iconColor: 'text-purple-600', label: 'कम बारिश होने पर क्या किस्त रुक सकती है?', query: 'सूखा पड़ने या कम बारिश होने पर क्या किस्त आगे बढ़ सकती है?' },
      ],
      initialMessages: [
        {
          id: 'hi-1',
          sender: 'assistant' as const,
          text: 'नमस्ते! मैं टीवीएस कृषि साथी हूँ। आपके ट्रैक्टर ऋण, पीएमएफबीवाई फसल बीमा, और मौसमी किस्त (EMI) के बारे में सब जानकारी दे सकता हूँ।',
          vernacularText: 'TVS Credit RAG ज्ञानकोष से सत्यापित कृषि ऋण सहायता।',
          sourceDoc: 'TVS Credit Agri Policy Manual 2024 (Grounded RAG)',
          iconType: 'sparkles' as const,
        },
      ],
    },
    english: {
      placeholder: 'Ask about TVS Harvest EMIs, loan approval, or PMFBY...',
      quickPrompts: [
        { icon: Sprout, iconColor: 'text-amber-600', label: 'How does Harvest EMI work?', query: 'How does Seasonally-Aligned Harvest EMI work during sowing?' },
        { icon: Tractor, iconColor: 'text-emerald-600', label: 'What documents are needed for loan?', query: 'What documents are required for a TVS tractor loan?' },
        { icon: ShieldCheck, iconColor: 'text-blue-600', label: 'How to claim PMFBY crop insurance?', query: 'How do I file a PMFBY crop insurance claim for damaged yield?' },
        { icon: CloudRain, iconColor: 'text-purple-600', label: 'Can EMI be deferred during drought?', query: 'Can EMI installments be deferred or restructured during monsoon drought?' },
      ],
      initialMessages: [
        {
          id: 'en-1',
          sender: 'assistant' as const,
          text: 'Welcome! I am TVS Krishi Saathi AI. I can assist you with your tractor loan sanction, PMFBY crop insurance claims, and Seasonally-Aligned Harvest EMIs.',
          vernacularText: 'Verified and grounded in TVS Credit Agricultural Lending & Sanction Guidelines.',
          sourceDoc: 'TVS Credit Agri Policy Manual 2024 (Grounded RAG)',
          iconType: 'sparkles' as const,
        },
      ],
    },
    tamil: {
      placeholder: 'TVS அறுவடை தவணை, கடன் ஒப்புதல், அல்லது PMFBY பற்றி கேளுங்கள்...',
      quickPrompts: [
        { icon: Sprout, iconColor: 'text-amber-600', label: 'அறுவடை EMI எவ்வாறு செயல்படுகிறது?', query: 'TVS அறுவடை சீசனல் EMI எவ்வாறு செயல்படுகிறது மற்றும் விதைப்பு காலத்தில் எவ்வளவு செலுத்த வேண்டும்?' },
        { icon: Tractor, iconColor: 'text-emerald-600', label: 'விவசாய கடனுக்கு தேவையான ஆவணங்கள்?', query: 'டிராக்டர் மற்றும் விவசாய கடனுக்கு என்னென்ன ஆவணங்கள் தேவை?' },
        { icon: ShieldCheck, iconColor: 'text-blue-600', label: 'PMFBY பயிர் காப்பீடு கோருவது எப்படி?', query: 'பயிர் சேதம் ஏற்பட்டால் PMFBY காப்பீடு இழப்பீடு கோருவது எப்படி?' },
        { icon: CloudRain, iconColor: 'text-purple-600', label: 'வறட்சி காலத்தில் EMI ஒத்திவைக்கப்படுமா?', query: 'மழைப்பொழிவு குறைவு அல்லது வறட்சி காலத்தில் தவணை ஒத்திவைப்பு கிடைக்குமா?' },
      ],
      initialMessages: [
        {
          id: 'ta-1',
          sender: 'assistant' as const,
          text: 'வணக்கம்! நான் TVS கிரிஷி சாதி. உங்கள் டிராக்டர் கடன் அனுமதி, PMFBY பயிர் காப்பீடு, மற்றும் சீசனல் அறுவடை EMI திட்டங்கள் குறித்த அனைத்து விவரங்களையும் வழங்க முடியும்.',
          vernacularText: 'TVS Credit RAG கொள்கை வழிகாட்டுதல்கள் மற்றும் செயற்கைக்கோள் சரிபார்ப்பு.',
          sourceDoc: 'TVS Credit Agri Policy Manual 2024 (Grounded RAG)',
          iconType: 'sparkles' as const,
        },
      ],
    },
  };

  const [messages, setMessages] = useState<ChatMessage[]>(languagePresets.chhattisgarhi.initialMessages);

  // Handle Language Change
  const handleLanguageChange = (newLang: 'chhattisgarhi' | 'hindi' | 'english' | 'tamil') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
    setLanguage(newLang);
    setMessages(languagePresets[newLang].initialMessages);
  };

  const currentPreset = languagePresets[language];

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
  };

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  const fallbackSpeechSynthesis = (text: string, _index: number) => {
    if (!('speechSynthesis' in window)) {
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'english' ? 'en-IN' : language === 'tamil' ? 'ta-IN' : 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeak = async (text: string, index: number) => {
    if (speakingIndex === index) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();
    setSpeakingIndex(index);

    let langCode = 'hi-IN';
    let voiceName = 'hi-IN-SwaraNeural';
    if (language === 'english') {
      langCode = 'en-IN';
      voiceName = 'en-IN-NeerjaNeural';
    } else if (language === 'tamil') {
      langCode = 'ta-IN';
      voiceName = 'ta-IN-PallaviNeural';
    } else if (language === 'chhattisgarhi') {
      langCode = 'hi-IN';
      voiceName = 'hi-IN-SwaraNeural';
    }

    try {
      const response = await fetch('/api/v1/assistant/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: langCode,
          voice: voiceName,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 100) {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setSpeakingIndex(null);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            fallbackSpeechSynthesis(text, index);
          };
          await audio.play();
          return;
        }
      }
      fallbackSpeechSynthesis(text, index);
    } catch {
      fallbackSpeechSynthesis(text, index);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    stopCurrentAudio();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: language.toUpperCase(),
          borrower_context: {
            applicant_name: 'Rajeshwar Sahu',
            district: 'Raipur',
            crop: 'Paddy',
            khasra_no: '142/1',
            loan_id: 'TVS-TR-2024-5510',
            agri_credit_score: 735,
            max_sanction_amount_inr: 550000,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: data.response || data.reply || 'Jaankari uplabdh hai.',
            vernacularText: data.vernacular_translation || undefined,
            sourceDoc: data.source || data.grounded_sources?.[0]?.source || 'TVS Credit RAG Knowledge Base',
            time: replyTime,
            iconType: 'sparkles',
          },
        ]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Local fallback
      let fallback = '';
      const lowerText = textToSend.toLowerCase();
      if (lowerText.includes('harvest') || lowerText.includes('buvai') || textToSend.includes('हार्वेस्ट') || textToSend.includes('किस्त') || textToSend.includes('कटाई') || textToSend.includes('அறுவடை') || textToSend.includes('தவணை')) {
        fallback =
          language === 'chhattisgarhi'
            ? 'भइया, TVS क्रेडिट के हार्वेस्ट EMI म बोआई के बेरा खाली ₹1,500 के नानचुन किस्त देना पड़ही। जब धान मंडी म बिकाही, तब नवंबर-दिसंबर म बड़का किस्त भरे बर लगही। अइसन म डिफाल्ट के कोनो डर नई रहय!'
            : language === 'hindi'
            ? 'टीवीएस क्रेडिट हार्वेस्ट ईएमआई में बुवाई के दौरान केवल ₹1,500 रखरखाव किस्त लगती है। मंडी में फसल बिकने पर ही मुख्य किस्त देनी होती है।'
            : language === 'tamil'
            ? 'TVS சீசனல் அறுவடை EMI திட்டத்தில், பயிர் வளரும் காலங்களில் (ஜூன்-அக்டோபர்) மாதத்திற்கு சுமார் ₹1,500 மட்டுமே பராமரிப்பு தவணை. முக்கிய தவணை (~₹55,000) நவம்பர்-டிசம்பர் அறுவடை மண்டி விற்பனைக்கு பிறகே செலுத்தப்படும்.'
            : 'Under TVS Seasonally-Aligned Harvest EMIs, during lean crop-growing months (June–October), you pay a nominal maintenance installment of only ~₹1,500/month. Your primary bullet installment (~₹55,000) is scheduled during November–December after mandi sales.';
      } else if (lowerText.includes('tractor') || lowerText.includes('dastawez') || textToSend.includes('दस्तावेज') || textToSend.includes('कागज') || lowerText.includes('document') || textToSend.includes('ஆவணம்')) {
        fallback =
          language === 'chhattisgarhi'
            ? 'ट्रैक्टर लोन बर खाली 4 ठन कागज लगथे: आधार कार्ड, खसरा खतौनी / भुइयां रिकॉर्ड, 6 महिना के बैंक पासबुक, अउ ट्रैक्टर डीलर के कोटेशन। सैटेलाइट जांच ले 10 मिनट म लोन पास हो जाही!'
            : language === 'hindi'
            ? 'ट्रैक्टर लोन के लिए आधार कार्ड, खसरा 7/12, 6 महीने का बैंक स्टेटमेंट और डीलर कोटेशन आवश्यक हैं। सैटेलाइट जांच से 10 मिनट में सत्यापन होता है।'
            : language === 'tamil'
            ? 'TVS விவசாய கடனுக்கு 4 எளிய ஆவணங்கள் மட்டுமே தேவை: ஆதார் & பான் கார்டு, நில உரிமை பட்டா / சிட்டா, 6 மாத வங்கி அறிக்கை, மற்றும் டீலர் விலைப்பட்டியல். செயற்கைக்கோள் சரிபார்ப்பால் நேரடி ஆய்வு தாமதமில்லை.'
            : 'Applying for a TVS Tractor Loan requires 4 simple documents: Aadhaar card, Khasra 7/12 land records, 6-month bank statement, and dealer quotation. Satellite verification eliminates on-site delays.';
      } else if (lowerText.includes('pmfby') || lowerText.includes('bima') || textToSend.includes('बीमा') || textToSend.includes('क्लेम') || lowerText.includes('claim') || textToSend.includes('காப்பீடு')) {
        fallback =
          language === 'chhattisgarhi'
            ? 'अगर कीट प्रकोप या बेमौसम बारिश ले फसल खराब हो जाथे, त TVS क्रेडिट सिस्टम 72 घंटा के भीतर PMFBY क्लेम दर्ज कराए बर मदद करथे। सैटेलाइट NDVI रिपोर्ट ले क्लेम जल्दी पास हो जाथे।'
            : language === 'hindi'
            ? 'फसल क्षति होने पर आप 72 घंटे के भीतर PMFBY टोल-फ्री 1800-180-1551 या टीवीएस रिलेशनशिप मैनेजर द्वारा क्लेम दर्ज करा सकते हैं। हमारी सैटेलाइट NDVI रिपोर्ट क्लेम निपटारे में त्वरित मदद करती है।'
            : language === 'tamil'
            ? 'பயிர் சேதம் ஏற்பட்டால் 72 மணி நேரத்திற்குள் PMFBY இலவச உதவி எண் 1800-180-1551 அல்லது TVS கடன் அதிகாரி மூலம் காப்பீட்டுக் கோரிக்கையை பதிவு செய்யலாம்.'
            : 'In case of crop loss, TVS Credit helps you lodge a PMFBY insurance claim within 72 hours. Our Sentinel-2 satellite NDVI data serves as verified evidence for accelerated insurance disbursement.';
      } else if (lowerText.includes('drought') || textToSend.includes('सूखा') || textToSend.includes('बारिश') || textToSend.includes('पानी') || lowerText.includes('rain') || textToSend.includes('வறட்சி')) {
        fallback =
          language === 'chhattisgarhi'
            ? 'अगर कम पानी गिरे या सूखा परे ले फसल कमजोर हो जाथे, त टीवीएस क्रेडिट के ईडब्ल्यूएस तंत्र अपने आप तुंहर किस्त ला 60 दिन बर आगे बढ़ा देथे। कोनो पेनल्टी नई लगही।'
            : language === 'hindi'
            ? 'यदि कम बारिश या सूखे के कारण फसल तनाव में आती है, तो टीवीएस क्रेडिट का EWS सिस्टम स्वतः 60-दिन की ईएमआई राहत और पुनर्गठन सुविधा प्रदान करता है।'
            : language === 'tamil'
            ? 'மழைப்பொழிவு பற்றாக்குறை அல்லது வறட்சி ஏற்பட்டால், TVS கிரெடிட்டின் EWS அமைப்பு தானாகவே 60 நாட்கள் EMI ஒத்திவைப்பு மற்றும் மறுசீரமைப்பு சலுகையை வழங்குகிறது.'
            : 'If drought or low rainfall impacts your yield, TVS Credit Early Warning System automatically activates a 60-day EMI restructuring and moratorium buffer.';
      } else {
        fallback =
          language === 'chhattisgarhi'
            ? 'जय जोहार संगवारी! तुंहर ₹550,000 के लोन आवेदन टीवीएस सैटेलाइट तंत्र ले सुरक्षित हे। रायपुर खसरा 142/1 म खेत के हरियाली बहुत बढ़िया हे!'
            : language === 'hindi'
            ? 'नमस्ते राजेश जी! आपका ₹5,50,000 का ऋण आवेदन टीवीएस क्रेडिट सैटेलाइट जांच द्वारा सत्यापित है। रायपुर खसरा 142/1 में फसल स्वास्थ्य उत्तम है।'
            : language === 'tamil'
            ? 'வணக்கம் ராஜேஷ்! TVS செயற்கைக்கோள் ஆய்வு மூலம் உங்கள் ₹5,50,000 கடன் அனுமதி பாதுகாப்பானது. ராய்ப்பூர் புல எண் 142/1-ல் நிலத்தின் பசுமை குறியீடு (NDVI: 0.68) சிறப்பான நிலையில் உள்ளது.'
            : 'Hello Rajesh! Your ₹550,000 tractor loan application is validated via Sentinel-2 orbital telemetry. Plot 142/1 in Raipur shows healthy crop vigor (NDVI: 0.68).';
      }

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: fallback,
          sourceDoc: 'TVS Credit RAG Knowledge Base',
          time: replyTime,
          iconType: 'sparkles',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'english' ? 'en-IN' : language === 'tamil' ? 'ta-IN' : 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <section id="krishi-saathi" className="relative w-full pt-8 pb-14 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-xs font-semibold mb-2.5">
            <Sparkles size={13} className="text-[#0B2545]" />
            <span>Vernacular Multilingual Voice AI</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            TVS Krishi Saathi Voice Assistant
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
            Grounded RAG conversational assistant answering rural farmers in their native tongue: Hindi, Chhattisgarhi, Tamil, and English.
          </p>
        </div>

        {/* Clean White Card Interface on Off-White Canvas */}
        <div className="max-w-[880px] mx-auto bg-white rounded-[28px] border border-slate-200/80 shadow-xl shadow-slate-900/5 p-5 sm:p-7 flex flex-col">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
            {/* Left: KS Logo + Brand Heading + Online Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs shrink-0">
                KS
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0B2545] tracking-tight">
                  TVS Krishi Saathi AI
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-emerald-600">Online</span>
                </div>
              </div>
            </div>

            {/* Right: Elegant Segmented Language Switcher */}
            <div className="inline-flex items-center p-1 bg-[#F1F3F5] rounded-full border border-slate-200/60">
              <button
                onClick={() => handleLanguageChange('chhattisgarhi')}
                className={`text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'chhattisgarhi'
                    ? 'bg-white text-[#5B32E5] border border-[#5B32E5]/50 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                छत्तीसगढ़ी
              </button>
              <button
                onClick={() => handleLanguageChange('hindi')}
                className={`text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'hindi'
                    ? 'bg-white text-[#5B32E5] border border-[#5B32E5]/50 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => handleLanguageChange('tamil')}
                className={`text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'tamil'
                    ? 'bg-white text-[#5B32E5] border border-[#5B32E5]/50 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => handleLanguageChange('english')}
                className={`text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                  language === 'english'
                    ? 'bg-white text-[#5B32E5] border border-[#5B32E5]/50 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* CHATGPT-STYLE VOICE VISUALIZER BANNER WHEN PLAYING */}
          {speakingIndex !== null && (
            <div className="mt-3 px-4 py-2.5 bg-gradient-to-r from-[#0B2545] via-[#1E3A8A] to-[#0B2545] rounded-2xl text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <span className="absolute w-6 h-6 rounded-full bg-emerald-400/40 animate-ping" />
                  <span className="absolute w-4 h-4 rounded-full bg-teal-400/50 animate-pulse" />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-emerald-300 shadow" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-5 bg-teal-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.25s]" />
                  <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.1s]" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-white flex items-center gap-1.5">
                  TVS Voice Speaking ({language === 'tamil' ? 'Pallavi Neural' : language === 'english' ? 'Neerja Neural' : 'Swara Neural'})
                </span>
              </div>
              <button
                onClick={stopCurrentAudio}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-colors cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="flex flex-col gap-5 my-4 min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
            {messages.map((msg, i) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id || i} className="ml-auto flex flex-col items-end max-w-[80%]">
                    {/* User Dark Navy Bubble */}
                    <div className="bg-[#0B2545] text-white rounded-2xl rounded-tr-xs px-5 py-3.5 text-sm font-normal shadow-2xs leading-relaxed">
                      <p>{msg.text}</p>
                    </div>

                    {/* Timestamp & Double Checkmark */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 justify-end font-medium">
                      <span>{msg.time || '10:15 AM'}</span>
                      <CheckCheck size={13} className="text-sky-500" />
                    </div>
                  </div>
                );
              }

              // Assistant Message
              const isSpeakingThis = speakingIndex === i;
              return (
                <div key={msg.id || i} className="flex items-start gap-3.5 max-w-[94%]">
                  {/* Soft Lavender AI Container */}
                  <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#7342E2] shrink-0 mt-0.5 shadow-2xs">
                    {msg.iconType === 'file' ? <FileText size={16} /> : <Sparkles size={16} />}
                  </div>

                  {/* Message Bubble + Citations + Listen */}
                  <div className="flex flex-col items-start gap-1 flex-1">
                    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                      <p className="text-sm text-slate-800 font-normal leading-relaxed">
                        {msg.text}
                      </p>

                      {msg.vernacularText && (
                        <p className="mt-2.5 text-xs sm:text-[13px] text-slate-500 italic leading-relaxed">
                          {msg.vernacularText}
                        </p>
                      )}

                      {msg.sourceDoc && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#7342E2]">
                          <BookOpen size={13} className="shrink-0" />
                          <span>Source: {msg.sourceDoc}</span>
                        </div>
                      )}
                    </div>

                    {/* Minimal Listen Toggle Button */}
                    <button
                      onClick={() => toggleSpeak(msg.text, i)}
                      className={`mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer select-none ${
                        isSpeakingThis
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs'
                          : 'text-slate-500 hover:text-[#0B2545] bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                      title={isSpeakingThis ? 'Click to stop listening' : 'Click to listen'}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX size={13} className="text-rose-600 animate-pulse" />
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3.5 max-w-[94%]">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#7342E2] shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles size={16} className="animate-spin" />
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs text-xs text-slate-500 italic">
                  TVS Krishi Saathi is retrieving policy documents in {language}...
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts (2-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
            {currentPreset.quickPrompts.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.query)}
                  className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-all shadow-2xs hover:shadow-xs hover:border-slate-300 text-left cursor-pointer group"
                >
                  <Icon size={15} className={`${qp.iconColor} shrink-0 group-hover:scale-110 transition-transform`} />
                  <span className="truncate">{qp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Composer Fixed at Bottom */}
          <div className="flex items-center gap-2.5 mt-2">
            {/* Separate Microphone Button */}
            <button
              onClick={toggleMic}
              className={`w-12 h-12 rounded-2xl bg-white border flex items-center justify-center shadow-2xs hover:shadow-xs cursor-pointer transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Voice Input (Vernacular Voice Engine)"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Spacious Text Input */}
            <div className="flex-1 flex items-center bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-2xs focus-within:border-[#5B32E5]/60 focus-within:ring-2 focus-within:ring-[#5B32E5]/10 transition-all">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={currentPreset.placeholder}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Premium Purple Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuery.trim()}
              className="w-12 h-12 rounded-2xl bg-[#5B32E5] hover:bg-[#4E27D8] text-white flex items-center justify-center shadow-sm disabled:opacity-40 transition-all cursor-pointer active:scale-95 shrink-0"
              title="Send message"
            >
              <Send size={16} className="text-white ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KrishiSaathiSection;
