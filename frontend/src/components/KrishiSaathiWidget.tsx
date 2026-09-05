import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Sprout,
  Tractor,
  ShieldCheck,
  CloudRain,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

export interface BorrowerContext {
  applicant_name?: string;
  district?: string;
  crop?: string;
  khasra_no?: string;
  loan_id?: string;
  agri_credit_score?: number;
  max_sanction_amount_inr?: number;
  ndvi?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  vernacularText?: string;
  sourceDoc?: string;
  time: string;
  audioUrl?: string;
}

interface KrishiSaathiWidgetProps {
  borrowerContext?: BorrowerContext;
}

export const KrishiSaathiWidget: React.FC<KrishiSaathiWidgetProps> = ({ borrowerContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<
    'english' | 'hindi' | 'chhattisgarhi' | 'tamil' | 'telugu' | 'marathi' | 'kannada' | 'bengali'
  >('english');
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);

  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Default context if not passed from parent
  const activeContext: BorrowerContext = {
    applicant_name: 'Rajeshwar Sahu',
    district: 'Raipur',
    crop: 'Paddy (Grade-A)',
    khasra_no: '142/1',
    loan_id: 'TVS-TR-2024-5510',
    agri_credit_score: 735,
    max_sanction_amount_inr: 550000,
    ndvi: 0.68,
    ...borrowerContext,
  };

  const languagePresets = {
    english: {
      name: 'English',
      code: 'EN',
      greeting: `Hello ${activeContext.applicant_name || 'Farmer'}! I am TVS Krishi Saathi Copilot. I am ready to assist with your ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} tractor loan sanction, Seasonally-Aligned Harvest EMIs, and Sentinel-2 crop vigor (NDVI ${activeContext.ndvi || 0.68}).`,
      placeholder: 'Ask about Harvest EMI, loan sanction, or PMFBY (Supports Hinglish & Vernacular)...',
      quickPrompts: [
        { icon: Sprout, label: 'How does Harvest EMI work?', query: 'How does Seasonally-Aligned Harvest EMI work during sowing?' },
        { icon: Tractor, label: 'What documents for tractor loan?', query: 'What documents are required for a TVS tractor loan?' },
        { icon: ShieldCheck, label: 'How to claim PMFBY insurance?', query: 'How do I file a PMFBY crop insurance claim for damaged yield?' },
        { icon: CloudRain, label: 'Can EMI be deferred during drought?', query: 'Can EMI installments be deferred or restructured during monsoon drought?' },
      ],
    },
    hindi: {
      name: 'हिंदी',
      code: 'HI',
      greeting: `नमस्ते ${activeContext.applicant_name || 'किसान जी'}! मैं टीवीएस कृषि साथी AI हूँ। आपके ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ट्रैक्टर ऋण, हार्वेस्ट ईएमआई, एवं खसरा 142/1 (NDVI ${activeContext.ndvi || 0.68}) फसल स्वास्थ्य से संबंधित हर सहायता के लिए उपस्थित हूँ।`,
      placeholder: 'TVS Harvest EMI, लोन अप्रूवल, या PMFBY के बारे में पूछें...',
      quickPrompts: [
        { icon: Sprout, label: 'हार्वेस्ट EMI कैसे काम करती है?', query: 'हार्वेस्ट EMI कैसे काम करती है और बुवाई समय कितना देना पड़ता है?' },
        { icon: Tractor, label: 'ट्रैक्टर लोन दस्तावेज क्या हैं?', query: 'ट्रैक्टर लोन के लिए कौन कौन से दस्तावेज लगते हैं?' },
        { icon: ShieldCheck, label: 'PMFBY फसल बीमा क्लेम कैसे करें?', query: 'फसल खराब होने पर PMFBY क्लेम कैसे रजिस्टर करें?' },
        { icon: CloudRain, label: 'सूखे पर क्या ईएमआई टलेगी?', query: 'सूखा पड़ने या कम बारिश होने पर क्या किस्त आगे बढ़ सकती है?' },
      ],
    },
    chhattisgarhi: {
      name: 'छत्तीसगढ़ी',
      code: 'CG',
      greeting: `जय जोहार ${activeContext.applicant_name || 'किसान भइया'}! मैं टीवीएस कृषि साथी हंव। तुंहर ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} के ट्रैक्टर लोन, हार्वेस्ट किस्त, अउ रायपुर खेत (NDVI ${activeContext.ndvi || 0.68}) के बारे म कोनो भी सवाल पूछव।`,
      placeholder: 'हार्वेस्ट EMI, ट्रैक्टर लोन, PMFBY बीमा के बारे म पूछव...',
      quickPrompts: [
        { icon: Sprout, label: 'हार्वेस्ट EMI कइसे काम करथे?', query: 'हार्वेस्ट EMI कइसे काम करथे अउ बोआई बेरा कतका देना पड़ही?' },
        { icon: Tractor, label: 'ट्रैक्टर लोन बर का कागज लगही?', query: 'ट्रैक्टर लोन बर कोन-कोन से दस्तावेज अउ कागज लगही?' },
        { icon: ShieldCheck, label: 'PMFBY फसल बीमा क्लेम?', query: 'फसल नुकसान होए म PMFBY बीमा क्लेम कइसे करे जाथे?' },
        { icon: CloudRain, label: 'सूखा परे म किस्त छूट?', query: 'सूखा परे या कम पानी गिरे म का किस्त आगे बढ़ सकत हे?' },
      ],
    },
    tamil: {
      name: 'தமிழ்',
      code: 'TA',
      greeting: `வணக்கம் ${activeContext.applicant_name || 'விவசாயி'}! நான் TVS கிரிஷி சாதி. உங்கள் ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} டிராக்டர் கடன் அனுமதி, சீசனல் அறுவடை EMI, மற்றும் ராய்ப்பூர் நிலத்தின் செயற்கைக்கோள் பயிர் நலம் (NDVI ${activeContext.ndvi || 0.68}) குறித்த அனைத்து தகவல்களையும் தருகிறேன்.`,
      placeholder: 'TVS அறுவடை தவணை, கடன் ஒப்புதல், அல்லது PMFBY பற்றி கேளுங்கள்...',
      quickPrompts: [
        { icon: Sprout, label: 'அறுவடை EMI எவ்வாறு செயல்படுகிறது?', query: 'TVS அறுவடை சீசனல் EMI எவ்வாறு செயல்படுகிறது மற்றும் விதைப்பு காலத்தில் எவ்வளவு செலுத்த வேண்டும்?' },
        { icon: Tractor, label: 'விவசாய கடனுக்கு தேவையான ஆவணங்கள்?', query: 'டிராக்டர் மற்றும் விவசாய கடனுக்கு என்னென்ன ஆவணங்கள் தேவை?' },
        { icon: ShieldCheck, label: 'PMFBY பயிர் காப்பீடு கோருவது எப்படி?', query: 'பயிர் சேதம் ஏற்பட்டால் PMFBY காப்பீடு இழப்பீடு கோருவது எப்படி?' },
        { icon: CloudRain, label: 'வறட்சி காலத்தில் EMI ஒத்திவைக்கப்படுமா?', query: 'மழைப்பொழிவு குறைவு அல்லது வறட்சி காலத்தில் தவணை ஒத்திவைப்பு கிடைக்குமா?' },
      ],
    },
    telugu: {
      name: 'తెలుగు',
      code: 'TE',
      greeting: `నమస్కారం ${activeContext.applicant_name || 'రైతు సోదరా'}! నేను TVS కృషి సాథి Copilot. మీ ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ట్రాక్టర్ లోన్ మంజూరు, సీజనల్ హార్వెస్ట్ EMI మరియు శాటిలైట్ పంట ఆరోగ్యం (NDVI ${activeContext.ndvi || 0.68}) పై సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.`,
      placeholder: 'హార్వెస్ట్ EMI, లోన్ మంజూరు లేదా PMFBY గురించి అడగండి...',
      quickPrompts: [
        { icon: Sprout, label: 'హార్వెస్ట్ EMI ఎలా పనిచేస్తుంది?', query: 'విత్తనాలు నాటే సమయంలో సీజనల్ హార్వెస్ట్ EMI ఎలా పనిచేస్తుంది?' },
        { icon: Tractor, label: 'ట్రాక్టర్ లోన్‌కు ఏ పత్రాలు కావాలి?', query: 'TVS ట్రాక్టర్ లోన్ కోసం ఏ ఏ పత్రాలు మరియు డాక్యుమెంట్లు కావాలి?' },
        { icon: ShieldCheck, label: 'PMFBY పంట బీమా క్లెయిమ్ ఎలా చేయాలి?', query: 'పంట నష్టం జరిగితే PMFBY బీమా క్లెయిమ్ ఎలా నమోదు చేయాలి?' },
        { icon: CloudRain, label: 'కరువు సమయంలో EMI వాయిదా పడుతుందా?', query: 'వర్షాలు లేక కరువు వచ్చినప్పుడు EMI వాయిదా వేయవచ్చా?' },
      ],
    },
    marathi: {
      name: 'मराठी',
      code: 'MR',
      greeting: `नमस्कार ${activeContext.applicant_name || 'शेतकरी बंधू'}! मी टीव्हीएस कृषी साथी AI आहे. आपल्या ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ट्रॅक्टर कर्ज मंजुरी, पीक हंगामी हार्वेस्ट ईएमआय आणि सॅटेलाइट पीक आरोग्य (NDVI ${activeContext.ndvi || 0.68}) संदर्भात मदत करण्यास मी तत्पर आहे.`,
      placeholder: 'हार्वेस्ट ईएमआय, ट्रॅक्टर कर्ज किंवा PMFBY बाबत विचारा...',
      quickPrompts: [
        { icon: Sprout, label: 'हार्वेस्ट EMI कशी कार्य करते?', query: 'पेरणीच्या वेळी टीव्हीएस हार्वेस्ट ईएमआय कशी कार्य करते?' },
        { icon: Tractor, label: 'ट्रॅक्टर कर्जासाठी कोणती कागदपत्रे लागतात?', query: 'टीव्हीएस ट्रॅक्टर कर्जासाठी कोणती कागदपत्रे आवश्यक आहेत?' },
        { icon: ShieldCheck, label: 'PMFBY पीक विमा क्लेम कसा करावा?', query: 'पीक नुकसान झाल्यास PMFBY विमा क्लेम कसा नोंदवावा?' },
        { icon: CloudRain, label: 'दुष्काळात हप्ता पुढे ढकलला जाऊ शकतो का?', query: 'पाऊस कमी झाल्यास किंवा दुष्काळ पडल्यास हप्ता पुढे ढकलला जाऊ शकतो का?' },
      ],
    },
    kannada: {
      name: 'ಕನ್ನಡ',
      code: 'KN',
      greeting: `ನಮಸ್ಕಾರ ${activeContext.applicant_name || 'ರೈತ ಬಾಂಧವರೇ'}! ನಾನು ಟಿವಿಎಸ್ ಕೃಷಿ ಸಾಥಿ AI. ನಿಮ್ಮ ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ಟ್ರ್ಯಾಕ್ಟರ್ ಸಾಲ ಮಂಜೂರಾತಿ, ಸುಗ್ಗಿಯ ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ ಮತ್ತು ಉಪಗ್ರಹ ಬೆಳೆ ಆರೋಗ್ಯ (NDVI ${activeContext.ndvi || 0.68}) ಕುರಿತು ಸಹಾಯ ಮಾಡಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ.`,
      placeholder: 'ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ, ಸಾಲ ಅನುಮೋದನೆ ಅಥವಾ PMFBY ಬಗ್ಗೆ ಕೇಳಿ...',
      quickPrompts: [
        { icon: Sprout, label: 'ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?', query: 'ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಟಿವಿಎಸ್ ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?' },
        { icon: Tractor, label: 'ಟ್ರ್ಯಾಕ್ಟರ್ ಸಾಲಕ್ಕೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?', query: 'ಟಿವಿಎಸ್ ಟ್ರ್ಯಾಕ್ಟರ್ ಸಾಲ ಪಡೆಯಲು ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?' },
        { icon: ShieldCheck, label: 'PMFBY ಬೆಳೆ ವಿಮೆ ಕ್ಲೈಮ್ ಮಾಡುವುದು ಹೇಗೆ?', query: 'ಬೆಳೆ ಹಾನಿಯಾದಾಗ PMFBY ಬೆಳೆ ವಿಮೆ ಪರಿಹಾರ ಪಡೆಯುವುದು ಹೇಗೆ?' },
        { icon: CloudRain, label: 'ಬರಗಾಲದ ಸಮಯದಲ್ಲಿ ಇಎಂಐ ಮುಂದೂಡಬಹುದೇ?', query: 'ಮಳೆ ಕೊರತೆ ಅಥವಾ ಬರಗಾಲದ ಸಮಯದಲ್ಲಿ ಕಂತು ಮುಂದೂಡಲು ಸಾಧ್ಯವೇ?' },
      ],
    },
    bengali: {
      name: 'বাংলা',
      code: 'BN',
      greeting: `নমস্কার ${activeContext.applicant_name || 'কৃষক ভাই'}! আমি টিভিএস কৃষি সাথী AI। আপনার ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ট্র্যাক্টর ঋণ মঞ্জুরি, মরশুমি হার্ভেস্ট ইএমআই এবং উপগ্রহ ফসল স্বাস্থ্য (NDVI ${activeContext.ndvi || 0.68}) সংক্রান্ত সকল তথ্যের জন্য আমি উপস্থিত আছি।`,
      placeholder: 'হার্ভেস্ট ইএমআই, ঋণ অনুমোদন বা PMFBY সম্পর্কে জিজ্ঞাসা করুন...',
      quickPrompts: [
        { icon: Sprout, label: 'হার্ভেস্ট ইএমআই কীভাবে কাজ করে?', query: 'বপনের মরশুমে টিভিএস হার্ভেস্ট ইএমআই কীভাবে কাজ করে?' },
        { icon: Tractor, label: 'ট্র্যাক্টর লোনের জন্য কী কী নথি প্রয়োজন?', query: 'টিভিএস ট্র্যাক্টর লোনের জন্য কোন কোন নথিপত্র প্রয়োজন?' },
        { icon: ShieldCheck, label: 'PMFBY ফসল বীমা দাবি কীভাবে করবেন?', query: 'ফসল নষ্ট হলে PMFBY ফসল বীমা ক্ষতিপূরণ দাবি কীভাবে করবেন?' },
        { icon: CloudRain, label: 'খরার সময় কি ইএমআই স্থগিত হতে পারে?', query: 'কম বৃষ্টি বা খরা দেখা দিলে কি কিস্তি পিছিয়ে দেওয়া সম্ভব?' },
      ],
    },
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: languagePresets.english.greeting,
      sourceDoc: 'TVS Credit Grounded Agri-Lending Policy 2024',
      time: 'Just now',
    },
  ]);

  const languageRef = useRef(language);
  languageRef.current = language;

  // Listen for global summon event (e.g. from top Navbar or hero buttons)
  useEffect(() => {
    const handleGlobalSummon = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      const targetLang = e.detail?.language || languageRef.current;
      if (e.detail?.language) {
        handleLanguageChange(e.detail.language);
      }
      if (e.detail?.query) {
        handleSend(e.detail.query, targetLang);
      }
    };

    window.addEventListener('open-krishi-saathi', handleGlobalSummon);
    (window as any).sendKrishiSaathiQuery = (q: string, l?: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (l) handleLanguageChange(l);
      return handleSend(q, l);
    };

    return () => {
      window.removeEventListener('open-krishi-saathi', handleGlobalSummon);
      delete (window as any).sendKrishiSaathiQuery;
    };
  }, []);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Clean up audio playback on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Language switch
  const handleLanguageChange = (
    newLang: 'english' | 'hindi' | 'chhattisgarhi' | 'tamil' | 'telugu' | 'marathi' | 'kannada' | 'bengali'
  ) => {
    stopCurrentAudio();
    setLanguage(newLang);
    setMessages((prev) => {
      // Check if user has already sent any messages in this session
      const hasUserMessages = prev.some((m) => m.sender === 'user');

      if (!hasUserMessages) {
        // If it's just the initial greeting, convert/update the greeting in-place!
        return [
          {
            id: 'init-1',
            sender: 'assistant',
            text: languagePresets[newLang].greeting,
            sourceDoc: 'TVS Credit Grounded Agri-Lending Policy 2024',
            time: 'Just now',
          },
        ];
      }

      // In active session with conversation history, preserve all messages
      // without appending redundant greeting bubbles below!
      return prev;
    });
  };

  // Stop currently playing audio
  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveAudioMessageId(null);
  };

  // Play Neural Audio synthesized via Free Edge-TTS backend endpoint
  const playMessageAudio = async (msg: ChatMessage) => {
    if (audioMuted) return;

    if (activeAudioMessageId === msg.id && isPlayingAudio) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();
    setActiveAudioMessageId(msg.id);
    setIsPlayingAudio(true);

    const isLatin = /^[A-Za-z0-9\s.,?!'₹\-–—:;()"'%@#]+$/.test(msg.text.trim());
    const hasHinglish = /\b(kaise|kya|karein|chahiye|kitna|kisan|fasal|dhan|milega|hogi|lagta|kist|mera|meri|mere|batao|khol|kharif|rabi|bhuyian|khasra)\b/i.test(msg.text);

    let langCode = 'en-IN';
    let voiceName = 'en-IN-NeerjaNeural';

    if (isLatin && hasHinglish) {
      langCode = 'en-IN';
      voiceName = 'en-IN-NeerjaNeural';
    } else if (language === 'tamil') {
      langCode = 'ta-IN';
      voiceName = 'ta-IN-PallaviNeural';
    } else if (language === 'telugu') {
      langCode = 'te-IN';
      voiceName = 'te-IN-ShrutiNeural';
    } else if (language === 'marathi') {
      langCode = 'mr-IN';
      voiceName = 'mr-IN-AarohiNeural';
    } else if (language === 'kannada') {
      langCode = 'kn-IN';
      voiceName = 'kn-IN-SapnaNeural';
    } else if (language === 'bengali') {
      langCode = 'bn-IN';
      voiceName = 'bn-IN-TanishaaNeural';
    } else if (language === 'hindi' || language === 'chhattisgarhi') {
      langCode = 'hi-IN';
      voiceName = 'hi-IN-SwaraNeural';
    } else {
      langCode = 'en-IN';
      voiceName = 'en-IN-NeerjaNeural';
    }

    try {
      // Call free edge-tts synthesis endpoint
      const response = await fetch('/api/v1/assistant/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.text,
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
            setIsPlayingAudio(false);
            setActiveAudioMessageId(null);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            fallbackSpeechSynthesis(msg.text);
          };
          await audio.play();
          return;
        }
      }
      // If server returns non-audio or is offline, fallback gracefully
      fallbackSpeechSynthesis(msg.text);
    } catch {
      fallbackSpeechSynthesis(msg.text);
    }
  };

  // Browser speechSynthesis fallback
  const fallbackSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === 'english'
        ? 'en-IN'
        : language === 'tamil'
        ? 'ta-IN'
        : language === 'telugu'
        ? 'te-IN'
        : language === 'marathi'
        ? 'mr-IN'
        : language === 'kannada'
        ? 'kn-IN'
        : language === 'bengali'
        ? 'bn-IN'
        : 'hi-IN';
    utterance.rate = 0.92;
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveAudioMessageId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Send message
  const handleSend = async (queryText?: string, explicitLang?: any) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    stopCurrentAudio();
    const currentLang = explicitLang || languageRef.current || language;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
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
          message: text.trim(),
          language: currentLang.toUpperCase(),
          session_id: sessionIdRef.current,
          borrower_context: activeContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const asstMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.response || data.reply || 'जानकारी उपलब्ध है।',
          vernacularText: data.vernacular_translation || undefined,
          sourceDoc: data.source || 'TVS Credit Grounded Knowledge Base',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, asstMsg]);

        // Auto-play neural response if not muted
        if (!audioMuted) {
          playMessageAudio(asstMsg);
        }
      } else {
        throw new Error('Chat API returned error');
      }
    } catch {
      // Deterministic zero-failure offline fallback
      let fallbackText = '';
      const lower = text.toLowerCase();
      const isHinglishInput = /\b(kaise|kya|karein|chahiye|kitna|kisan|fasal|dhan|milega|hogi|lagta|kist|mera|meri|mere)\b/i.test(text);

      if (
        lower.includes('harvest') ||
        lower.includes('emi') ||
        text.includes('हार्वेस्ट') ||
        text.includes('किस्त') ||
        text.includes('हप्ता') ||
        text.includes('కంతి') ||
        text.includes('ಕಂತು') ||
        text.includes('কিস্তি') ||
        text.includes('தவணை')
      ) {
        if (isHinglishInput) {
          fallbackText = 'TVS Credit ke Harvest EMI mein sowing season ke dauran sirf ₹1,500 maintenance installment deni hoti hai. December mein mandi mein dhan bikne ke baad main bullet installment (₹55,000) clear hoti hai.';
        } else if (language === 'chhattisgarhi') {
          fallbackText = 'भइया, TVS क्रेडिट के हार्वेस्ट EMI म बोआई बेरा खाली ₹1,500 के नानचुन किस्त देना पड़ही। जब धान मंडी म बिकाही, तब दिसंबर म ₹55,000 के बड़का किस्त भरे बर लगही।';
        } else if (language === 'hindi') {
          fallbackText = 'टीवीएस क्रेडिट हार्वेस्ट ईएमआई में बुवाई (जून-अक्टूबर) के दौरान केवल ₹1,500 रखरखाव किस्त लगती है। दिसंबर में मंडी में फसल बिकने पर मुख्य बुलेट किस्त (₹55,000) देनी होती है।';
        } else if (language === 'tamil') {
          fallbackText = 'TVS சீசனல் அறுவடை EMI திட்டத்தில் விதைப்பு காலத்தில் மாதத்திற்கு ₹1,500 மட்டுமே. டிசம்பர் மண்டி விற்பனைக்கு பிறகு ₹55,000 முக்கிய தவணை செலுத்தப்படும்.';
        } else if (language === 'telugu') {
          fallbackText = 'TVS హార్వెస్ట్ EMI కింద విత్తనాల సమయంలో నెలకు కేవలం ₹1,500 నామమాత్రపు మెయింటెనెన్స్ కట్టాలి. డిసెంబర్‌లో పంట అమ్మకం తర్వాత ప్రధాన బుల్లెట్ వాయిదా ₹55,000 చెల్లించాలి.';
        } else if (language === 'marathi') {
          fallbackText = 'टीव्हीएस हार्वेस्ट ईएमआय अंतर्गत पेरणी काळात दरमहा केवळ ₹1,500 देखभाल हप्ता असतो. डिसेंबरमध्ये मंडईत पीक विकल्यानंतर मुख्य बुलेट हप्ता (₹55,000) भरावा लागतो.';
        } else if (language === 'kannada') {
          fallbackText = 'ಟಿವಿಎಸ್ ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ ಅಡಿಯಲ್ಲಿ ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ತಿಂಗಳಿಗೆ ಕೇವಲ ₹1,500 ನಿರ್ವಹಣಾ ಕಂತು ಇರುತ್ತದೆ. ಡಿಸೆಂಬರ್‌ನಲ್ಲಿ ಮಂಡಿಯಲ್ಲಿ ಬೆಳೆ ಮಾರಾಟವಾದ ನಂತರ ಮುಖ್ಯ ಕಂತು ₹55,000 ಪಾವತಿಸಬೇಕು.';
        } else if (language === 'bengali') {
          fallbackText = 'টিভিএস হার্ভেস্ট ইএমআই-এর অধীনে বপনের মরশুমে মাসে মাত্র ₹১,৫০০ রক্ষণাবেক্ষণ কিস্তি দিতে হয়। ডিসেম্বরে ফসল বিক্রির পর মূল বুলেট কিস্তি (₹৫৫,০০০) পরিশোধ করতে হয়।';
        } else {
          fallbackText = 'Under TVS Seasonally-Aligned Harvest EMIs, you pay a nominal maintenance installment of only ₹1,500/month during sowing. The primary bullet installment of ₹55,000 is due in December after harvest mandi sales.';
        }
      } else if (
        lower.includes('tractor') ||
        lower.includes('doc') ||
        text.includes('कागज') ||
        text.includes('दस्तावेज') ||
        text.includes('कागदपत्रे') ||
        text.includes('పత్రాలు') ||
        text.includes('ದಾಖಲೆಗಳು') ||
        text.includes('নথি') ||
        text.includes('ஆவணம்')
      ) {
        if (isHinglishInput) {
          fallbackText = 'TVS tractor loan ke liye sirf 4 documents chahiye: Aadhaar card, Khasra 142/1 land record, 6-month bank statement, aur dealer quotation. Satellite check se bina kisi delay ke approval milta hai.';
        } else if (language === 'chhattisgarhi') {
          fallbackText = 'ट्रैक्टर लोन बर खाली 4 ठन कागज लगथे: आधार कार्ड, भुइयां खसरा 142/1 रिकॉर्ड, 6 महिना के बैंक पासबुक, अउ डीलर कोटेशन। सैटेलाइट जांच ले तुरंत लोन पास हो जाही!';
        } else if (language === 'hindi') {
          fallbackText = 'ट्रैक्टर ऋण हेतु आधार कार्ड, खसरा 7/12 (भुइयां रिकॉर्ड), 6 माह बैंक स्टेटमेंट और डीलर कोटेशन चाहिए। सैटेलाइट से तुरंत जांच होकर बिना देरी संस्वीकृति मिलती है।';
        } else if (language === 'tamil') {
          fallbackText = 'TVS டிராக்டர் கடனுக்கு 4 எளிய ஆவணங்கள்: ஆதார், பட்டா/சிட்டா, 6 மாத வங்கி அறிக்கை, மற்றும் டீலர் விலைப்பட்டியல் போதுமானது.';
        } else if (language === 'telugu') {
          fallbackText = 'TVS ట్రాక్టర్ లోన్ కోసం 4 పత్రాలు అవసరం: ఆధార్ కార్డు, పహాణీ/ఖస్రా 142/1 రికార్డు, 6 నెలల బ్యాంక్ స్టేట్‌మెంట్, మరియు డీలర్ కొటేషన్.';
        } else if (language === 'marathi') {
          fallbackText = 'टीव्हीएस ट्रॅक्टर कर्जासाठी आधार कार्ड, ७/१२ उतारा, ६ महिन्यांचे बँक स्टेटमेंट आणि डीलर कोटेशन आवश्यक आहे.';
        } else if (language === 'kannada') {
          fallbackText = 'ಟಿವಿಎಸ್ ಟ್ರ್ಯಾಕ್ಟರ್ ಸಾಲಕ್ಕೆ ಆಧಾರ್ ಕಾರ್ಡ್, ಪಹಣಿ/ಖಾಸ್ರಾ 142/1, 6 ತಿಂಗಳ ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್ ಮತ್ತು ಡೀಲರ್ ಕೊಟೇಶನ್ ಅಗತ್ಯವಿದೆ.';
        } else if (language === 'bengali') {
          fallbackText = 'টিভিএস ট্র্যাক্টর লোনের জন্য আধার কার্ড, খতিয়ান/খসরা রেকর্ড, ৬ মাসের ব্যাংক স্টেটমেন্ট এবং ডিলার কোটেশন প্রয়োজন।';
        } else {
          fallbackText = 'Required documents: Aadhaar card, Land Record (Khasra 142/1), 6-month bank statement, and dealer quotation. Verified via Sentinel-2 orbital imagery.';
        }
      } else if (
        lower.includes('pmfby') ||
        lower.includes('bima') ||
        text.includes('बीमा') ||
        text.includes('विमा') ||
        text.includes('బీమా') ||
        text.includes('ವಿಮೆ') ||
        text.includes('বীমা') ||
        text.includes('காப்பீடு')
      ) {
        if (isHinglishInput) {
          fallbackText = 'Crop damage ya drought aane par 72 hours ke andar PMFBY portal ya TVS branch par claim register karein. Hamari Sentinel-2 satellite NDVI report claim settlement ko tez karti hai.';
        } else if (language === 'chhattisgarhi') {
          fallbackText = 'अगर बेमौसम बारिश या सूखा ले फसल खराब हो जाथे, त TVS क्रेडिट 72 घंटा के भीतर PMFBY क्लेम दर्ज कराए बर मदद करथे।';
        } else if (language === 'hindi') {
          fallbackText = 'फसल क्षति पर 72 घंटे में PMFBY पोर्टल या टीवीएस शाखा पर क्लेम दर्ज कराएं। हमारी सैटेलाइट NDVI रिपोर्ट क्लेम निपटारे में त्वरित प्रमाण देती है।';
        } else if (language === 'tamil') {
          fallbackText = 'பயிர் சேதம் ஏற்பட்டால் 72 மணி நேரத்திற்குள் PMFBY காப்பீட்டு உதவி எண் அல்லது TVS கிளையில் கோரிக்கை பதிவு செய்யலாம்.';
        } else if (language === 'telugu') {
          fallbackText = 'పంట నష్టం లేదా కరువు ఏర్పడితే 72 గంటలలోపు PMFBY పోర్టల్ లేదా TVS బ్రాంచ్‌లో క్లెయిమ్ నమోదు చేయండి.';
        } else if (language === 'marathi') {
          fallbackText = 'पीक नुकसान किंवा दुष्काळ पडल्यास ७२ तासांच्या आत PMFBY पोर्टलवर किंवा टीव्हीएस शाखेत क्लेम नोंदवा.';
        } else if (language === 'kannada') {
          fallbackText = 'ಬೆಳೆ ಹಾನಿ ಸಂಭವಿಸಿದಲ್ಲಿ 72 ಗಂಟೆಗಳ ಒಳಗೆ PMFBY ಪೋರ್ಟಲ್ ಅಥವಾ ಟಿವಿಎಸ್ ಶಾಖೆಯಲ್ಲಿ ಕ್ಲೈಮ್ ನೋಂದಾಯಿಸಿ.';
        } else if (language === 'bengali') {
          fallbackText = 'ফসল ক্ষতি হলে ৭২ ঘণ্টার মধ্যে PMFBY পোর্টাল বা টিভিএস শাখায় ক্ষতিপূরণ দাবি নথিভুক্ত করুন।';
        } else {
          fallbackText = 'For crop damage, file a PMFBY claim within 72 hours. Our Sentinel-2 satellite NDVI evidence accelerates insurance clearance.';
        }
      } else {
        if (isHinglishInput) {
          fallbackText = `Namaste! Aapka ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} loan pre-approved hai. Plot 142/1 Raipur mein satellite crop vigor (NDVI ${activeContext.ndvi || 0.68}) kaafi healthy hai!`;
        } else if (language === 'chhattisgarhi') {
          fallbackText = `जय जोहार! तुंहर ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} के आवेदन टीवीएस सैटेलाइट तंत्र ले स्वीकृत हे। Raipur NDVI ${activeContext.ndvi || 0.68} बहुत बढ़िया हे!`;
        } else if (language === 'hindi') {
          fallbackText = `नमस्ते! आपका ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ऋण आवेदन स्वीकृत है। रायपुर खसरा 142/1 पर फसल स्वास्थ्य (NDVI ${activeContext.ndvi || 0.68}) उत्तम है।`;
        } else if (language === 'tamil') {
          fallbackText = `வணக்கம்! உங்கள் ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} கடன் அனுமதி உறுதியானது. நிலத்தின் NDVI குறியீடு ${activeContext.ndvi || 0.68} ஆரோக்கியமாக உள்ளது.`;
        } else if (language === 'telugu') {
          fallbackText = `నమస్కారం! మీ ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} రుణం మంజూరైంది. రాయ్‌పూర్ ప్లాట్ 142/1 లో శాటిలైట్ పంట పచ్చదనం (NDVI ${activeContext.ndvi || 0.68}) చాలా ఆరోగ్యంగా ఉంది!`;
        } else if (language === 'marathi') {
          fallbackText = `नमस्कार! आपले ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} कर्ज मंजूर झाले आहे. रायपूर भूखंड 142/1 वरील पीक आरोग्य (NDVI ${activeContext.ndvi || 0.68}) उत्तम आहे!`;
        } else if (language === 'kannada') {
          fallbackText = `ನಮಸ್ಕಾರ! ನಿಮ್ಮ ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ಸಾಲ ಅನುಮೋದನೆಗೊಂಡಿದೆ. ರಾಯಪುರ ಜಮೀನಿನ ಬೆಳೆ ಆರೋಗ್ಯ (NDVI ${activeContext.ndvi || 0.68}) ಉತ್ತಮವಾಗಿದೆ!`;
        } else if (language === 'bengali') {
          fallbackText = `নমস্কার! আপনার ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} ঋণ অনুমোদিত হয়েছে। রায়পুর প্লটের উপগ্রহ ফসল স্বাস্থ্য (NDVI ${activeContext.ndvi || 0.68}) চমৎকার!`;
        } else {
          fallbackText = `Your ₹${(activeContext.max_sanction_amount_inr || 550000).toLocaleString('en-IN')} loan is pre-approved. Plot 142/1 in Raipur shows healthy crop vigor (NDVI ${activeContext.ndvi || 0.68}).`;
        }
      }

      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        sourceDoc: 'TVS Credit Grounded Policy Engine (Offline Fallback)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (!audioMuted) {
        playMessageAudio(fallbackMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Speech to Text Microphone Toggle
  const toggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is supported in Chrome, Edge, and Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    stopCurrentAudio();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang =
        language === 'english'
          ? 'en-IN'
          : language === 'tamil'
          ? 'ta-IN'
          : language === 'telugu'
          ? 'te-IN'
          : language === 'marathi'
          ? 'mr-IN'
          : language === 'kannada'
          ? 'kn-IN'
          : language === 'bengali'
          ? 'bn-IN'
          : 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* 
        FLOATING ACTION BUTTON (TRIGGER)
        Persistent in bottom-right corner across all views
      */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full shadow-2xl transition-all cursor-pointer border border-white/20"
            style={{
              backgroundColor: '#0B2545',
              boxShadow: '0 12px 36px -4px rgba(11, 37, 69, 0.45)',
            }}
            aria-label="Open TVS Krishi Saathi AI Assistant"
          >
            {/* Pulsing indicator ring */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-300">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div className="text-left pr-1">
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  Krishi Saathi AI
                </div>
                <div className="text-[10px] text-emerald-300 font-medium">
                  Voice & Chat Copilot
                </div>
              </div>
            </div>

            {/* Subtle mic badge */}
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Mic size={14} />
            </div>
          </motion.button>
        )}
      </div>

      {/* 
        SLIDE-OUT FLOATING COPILOT DRAWER
      */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? '64px' : 'min(86vh, 660px)',
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col bg-[#FBFBFA]/95 backdrop-blur-xl"
            style={{
              boxShadow: '0 24px 60px -12px rgba(11, 37, 69, 0.35)',
            }}
          >
            {/* COPILOT HEADER */}
            <div
              className="px-4 py-3 text-white flex items-center justify-between select-none cursor-pointer"
              style={{ backgroundColor: '#0B2545' }}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow">
                    <Bot size={18} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B2545]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight">TVS Krishi Saathi</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                      Free Neural AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    Vernacular Voice & Policy Copilot
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {/* Mute toggle */}
                <button
                  onClick={() => {
                    if (!audioMuted) stopCurrentAudio();
                    setAudioMuted(!audioMuted);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    audioMuted
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                  title={audioMuted ? 'Unmute voice' : 'Mute voice'}
                  aria-label="Toggle voice mute"
                >
                  {audioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  aria-label="Toggle minimize"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isMinimized ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Close */}
                <button
                  onClick={() => {
                    stopCurrentAudio();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 text-slate-200 hover:bg-rose-500/80 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* BODY (Hidden if minimized) */}
            {!isMinimized && (
              <>
                {/* BORROWER CONTEXT SYNC STRIP */}
                <div className="px-3.5 py-1.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
                  <div className="flex items-center gap-1.5 truncate">
                    <UserCheck size={13} className="text-emerald-700 flex-shrink-0" />
                    <span className="font-semibold truncate">{activeContext.applicant_name}</span>
                    <span className="text-emerald-600">·</span>
                    <span>{activeContext.district}</span>
                    <span className="text-emerald-600">·</span>
                    <span className="font-mono font-medium">NDVI {activeContext.ndvi}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-800 flex-shrink-0">
                    ₹{(activeContext.max_sanction_amount_inr || 550000) / 100000}L Active
                  </span>
                </div>

                {/* LANGUAGE DIALECT PILLS (4 Focus Languages in UI: English, Hindi, Chhattisgarhi, Tamil) */}
                <div className="px-3 pt-2.5 pb-2 grid grid-cols-4 gap-1.5 border-b border-slate-200/70 bg-white">
                  {(
                    [
                      'english',
                      'hindi',
                      'chhattisgarhi',
                      'tamil',
                    ] as const
                  ).map((langKey) => {
                    const preset = languagePresets[langKey];
                    const active = language === langKey;
                    return (
                      <button
                        key={langKey}
                        onClick={() => handleLanguageChange(langKey)}
                        className={`py-1.5 px-1 text-[11.5px] font-bold rounded-xl transition-all text-center cursor-pointer truncate ${
                          active
                            ? 'bg-[#0B2545] text-white shadow-sm ring-1 ring-[#0B2545]/20 font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 font-medium'
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>

                {/* CHATGPT-STYLE NEURAL VOICE VISUALIZER */}
                {(isPlayingAudio || isListening) && (
                  <div className="px-4 py-2.5 bg-gradient-to-r from-[#0B2545]/90 via-[#133E6E] to-[#0B2545]/95 text-white border-b border-white/10 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      {/* ChatGPT Voice Mode Pulsating Orb */}
                      <div className="relative flex items-center justify-center w-7 h-7">
                        <span className="absolute w-7 h-7 rounded-full bg-emerald-400/30 animate-ping" />
                        <span className="absolute w-5 h-5 rounded-full bg-teal-400/40 animate-pulse" />
                        <div className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-200 shadow-lg shadow-teal-400/50" />
                      </div>

                      {/* Fluid Multi-frequency Sound Waveform */}
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.4s]" />
                        <span className="w-1 h-5 bg-teal-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-6 bg-cyan-200 rounded-full animate-bounce [animation-delay:-0.05s]" />
                        <span className="w-1 h-4 bg-teal-300 rounded-full animate-bounce [animation-delay:-0.25s]" />
                        <span className="w-1 h-2 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.35s]" />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                          {isListening ? 'Listening with Whisper Neural...' : 'TVS Smart Voice Speaking...'}
                          <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-mono">
                            {language === 'tamil' ? 'Pallavi Neural' : language === 'english' ? 'Neerja Neural' : 'Swara Neural'}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {isListening ? 'Speak naturally in your dialect' : 'ChatGPT-style Conversational Audio'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={stopCurrentAudio}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 transition-colors cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                )}

                {/* CHAT MESSAGE STREAM */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F8F9FA]">
                  {messages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    const isSpeakingThis = activeAudioMessageId === msg.id && isPlayingAudio;
                    return (
                      <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-[#0B2545] text-white rounded-br-none shadow-sm'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {!isUser && (
                            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100">
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <Sparkles size={12} />
                                Krishi Saathi
                              </span>
                              {/* Audio play button */}
                              <button
                                onClick={() => playMessageAudio(msg)}
                                className={`p-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                                  isSpeakingThis
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                                }`}
                                title="Listen in neural vernacular voice"
                              >
                                {isSpeakingThis ? (
                                  <>
                                    <VolumeX size={12} />
                                    <span>Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 size={12} />
                                    <span>Play Voice</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {msg.vernacularText && (
                            <p className="mt-1.5 text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                              {msg.vernacularText}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-black/5 text-[10px] text-slate-400">
                            <span>{msg.time}</span>
                            {msg.sourceDoc && (
                              <span className="truncate max-w-[170px]" title={msg.sourceDoc}>
                                {msg.sourceDoc}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-fit">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
                      <span className="text-xs text-slate-500 font-medium">
                        Grounded RAG reasoning...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* QUICK ACTION PROMPT CHIPS */}
                <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    {languagePresets[language].quickPrompts.map((chip, idx) => {
                      const IconComponent = chip.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip.query)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                        >
                          <IconComponent size={12} className="text-emerald-600" />
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM INPUT & VOICE RECORDING BAR */}
                <div className="p-3 bg-white border-t border-slate-200/80">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* Push to talk Microphone Button */}
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`p-2.5 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={isListening ? 'Stop listening' : 'Speak your question'}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {/* Query Input */}
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={
                        isListening ? 'Listening...' : languagePresets[language].placeholder
                      }
                      disabled={loading}
                      className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={loading || !inputQuery.trim()}
                      className="p-2.5 rounded-full bg-[#0B2545] text-white hover:bg-[#133863] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
                      title="Send question"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KrishiSaathiWidget;
