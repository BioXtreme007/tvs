import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Sprout,
  Tractor,
  Calendar,
  CloudRain,
  TrendingUp,
  Mic,
  Volume2,
  FileDown,
  ShieldCheck,
  CreditCard,
  Droplets,
  Sun,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Languages,
  ChevronDown,
  Check,
} from 'lucide-react';
import Logo from './Logo';
import { useResource, money, number } from '../api';

interface FarmerPortalProps {
  onBackToCockpit: () => void;
  onOpenSignIn?: () => void;
}

export const FarmerPortal: React.FC<FarmerPortalProps> = ({ onBackToCockpit, onOpenSignIn }) => {
  const loanResource = useResource<any>('/farmer/my-loan');
  const loan = loanResource.data;
  const [lang, setLang] = useState<
    'english' | 'hindi' | 'chhattisgarhi' | 'tamil' | 'telugu' | 'marathi' | 'kannada' | 'bengali'
  >('english');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [showSanctionDownloadToast, setShowSanctionDownloadToast] = useState(false);
  const [showPayToast, setShowPayToast] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions = [
    { id: 'english', label: 'English', native: 'English', sub: 'Global' },
    { id: 'hindi', label: 'Hindi', native: 'हिन्दी', sub: 'राजभाषा' },
    { id: 'chhattisgarhi', label: 'Chhattisgarhi', native: 'छत्तीसगढ़ी', sub: 'स्थानीय बोली' },
    { id: 'tamil', label: 'Tamil', native: 'தமிழ்', sub: 'தமிழ்நாடு' },
  ] as const;

  // Localization strings
  const t = {
    english: {
      portalBadge: 'Farmer Service Portal · GeoKisaan Saathi',
      backToCockpit: '← Back to Decision Cockpit',
      welcome: 'Welcome, Rajeshwar ji!',
      loanSanctionedTag: 'Loan Sanctioned (Pre-Approved)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'Sanctioned Loan Amount',
      subsidizedRate: '8.4% Subsidized PSL Interest Rate',
      tractorModel: 'GeoKisaan 45HP Smart Farm Tractor',
      dealerReady: 'Ready for delivery at GeoKisaan Raipur Dealership',
      downloadSanction: 'Download Sanction Letter',
      downloading: 'Downloading...',
      satelliteTitle: 'Sentinel-2 Satellite Crop Health',
      khasraInfo: 'Plot 142/1 · Raipur, Chhattisgarh (4.5 Acres)',
      ndviScore: '0.68 - Healthy Green Canopy',
      cloudGapTag: '100% Monsoon Cloud Penetration (CloudGap-CG)',
      ndviScaleLabel: 'Live Sentinel-2 Canopy Health (NDVI Vigor)',
      scaleLow: '0.0 (Barren)',
      scaleMid: '0.4 (Moderate)',
      scaleHigh: '0.68 (Healthy Paddy)',
      scaleMax: '1.0 (Dense Canopy)',
      cloudGapTitle: 'CloudGap-CG Inpainting',
      cloudGapDesc: 'Monsoon cloud cover penetrated with 99.4% AI confidence to verify healthy standing crop.',
      moistureTitle: 'Moisture Index (NDMI 0.19)',
      moistureDesc: 'Optimal soil moisture detected. Crop irrigation stress is minimal.',
      lastPass: 'Last Satellite Pass: Today at 10:42 AM (Sentinel-2A)',
      verifiedPlot: 'Verified Cadastral Land Parcel',
      emiTitle: 'GeoKisaan Seasonally-Aligned Harvest EMI Schedule',
      emiSubTitle: 'Flexible repayment aligned with your harvest revenue cycle',
      sowingEmiLabel: 'Sowing Season (June – October)',
      sowingEmiVal: '₹1,500 / month',
      sowingEmiSub: 'Nominal maintenance fee only',
      sowingSubNote: 'Zero repayment strain during the heavy expenditure sowing season!',
      harvestEmiLabel: 'Harvest Bullet (December)',
      harvestEmiVal: '₹55,000 Bullet Payment',
      harvestEmiSub: 'Pay post-mandi crop liquidation',
      harvestSubNote: 'Paid comfortably after selling paddy harvest at the Mandi.',
      nextDueLabel: 'Next Due Date:',
      nextDueDate: '10 October 2024',
      amountLabel: 'Amount:',
      payNowBtn: 'Pay Installment (UPI / Card)',
      mandiTitle: "Today's APMC Mandi Rates (Raipur)",
      mandiSubtitle: 'Live Government Minimum Support Price (MSP) & APMC Mandi Rates',
      paddyMsp: 'Paddy Grade-A (MSP ₹2,320/q)',
      paddyPrice: '₹2,380 / quintal',
      paddyPremium: '+₹60 Premium above Government MSP',
      raipurMandi: 'Raipur Mandi',
      soyabeanLabel: 'Soyabean (MSP ₹4,892/q)',
      durgMandi: 'Durg APMC Rate',
      mandiRateTag: 'Mandi Rate',
      expectedYield: 'Estimated Gross Harvest Value: ~₹3,57,000 (150q)',
      weatherTitle: 'Weather Forecast & Agro-Advisory',
      weatherSubtitle: 'Raipur District 5-Day Agro-Weather Forecast',
      weatherForecast: 'Light showers (12mm) anticipated Thursday evening. Ideal window for secondary urea application.',
      tempLabel: 'Temperature:',
      pestLabel: 'Pest Risk Index:',
      safeLabel: 'Zero / Safe',
      freeVoiceTag: 'Free Neural Voice Assistant (Grounded RAG)',
      askSaathiTitle: 'Talk to GeoKisaan Krishi Saathi Voice Copilot',
      askSaathiSub: 'Ask questions freely — get instant spoken answers in your dialect',
      tapToTalk: 'Tap to Speak (Voice Copilot)',
      oneTapVoiceTitle: 'One-Tap Quick Questions (Instant Spoken Voice):',
      q1: 'How does Harvest EMI work during sowing?',
      q2: 'What is today’s Paddy Mandi price?',
      q3: 'Can my EMI be deferred during drought?',
      q4: 'How do I pick up my tractor from the dealer?',
    },
    hindi: {
      portalBadge: 'किसान सेवा केंद्र · GeoKisaan साथी',
      backToCockpit: '← अधिकारी कॉकपिट पर वापस जाएं',
      welcome: 'नमस्ते, रामेश्वर जी!',
      loanSanctionedTag: 'ऋण स्वीकृत (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'स्वीकृत ऋण राशि',
      subsidizedRate: '8.4% रियायती ब्याज दर (PSL)',
      tractorModel: 'GeoKisaan 45HP स्मार्ट फार्म ट्रैक्टर',
      dealerReady: 'GeoKisaan रायपुर डीलरशिप पर डिलीवरी के लिए तैयार',
      downloadSanction: 'स्वीकृति पत्र डाउनलोड करें',
      downloading: 'डाउनलोड हो रहा है...',
      satelliteTitle: 'उपग्रह फसल स्वास्थ्य (Sentinel-2 NDVI)',
      khasraInfo: 'खसरा 142/1 · रायपुर, छत्तीसगढ़ (4.5 एकड़)',
      ndviScore: '0.68 - स्वस्थ हरी फसल',
      cloudGapTag: '100% बादल इनपेंटिंग सफल (CloudGap-CG)',
      ndviScaleLabel: 'लाइव सैटेलाइट हरियाली सूचकांक (NDVI Vigor)',
      scaleLow: '0.0 (सूखा/बंजर)',
      scaleMid: '0.4 (मध्यम)',
      scaleHigh: '0.68 (स्वस्थ धान)',
      scaleMax: '1.0 (अति सघन)',
      cloudGapTitle: 'CloudGap-CG इनपेंटिंग',
      cloudGapDesc: 'मानसून के बादलों के आर-पार देख 99.4% सटीकता से खेत की हरी फसल सत्यापित की गई।',
      moistureTitle: 'नमी सूचकांक (NDMI 0.19)',
      moistureDesc: 'खेत में पर्याप्त नमी मौजूद है। सिंचाई का तनाव न्यूनतम स्तर पर है।',
      lastPass: 'अंतिम उपग्रह परिक्रमा: आज प्रातः 10:42 बजे (Sentinel-2A)',
      verifiedPlot: 'सत्यापित भू-अभिलेख',
      emiTitle: 'GeoKisaan हार्वेस्ट-अलैन्ड मौसमी किस्त (Harvest EMI)',
      emiSubTitle: 'फसल चक्र के अनुरूप लचीली किस्त व्यवस्था',
      sowingEmiLabel: 'बुवाई के दौरान (जून - अक्टूबर)',
      sowingEmiVal: '₹1,500 / माह',
      sowingEmiSub: 'केवल नाममात्र रखरखाव किस्त',
      sowingSubNote: 'बुवाई समय किसान पर कोनो आर्थिक बोझ नहीं!',
      harvestEmiLabel: 'कटाई के बाद (दिसंबर)',
      harvestEmiVal: '₹55,000 बुलेट किस्त',
      harvestEmiSub: 'मंडी में फसल बिकने के बाद',
      harvestSubNote: 'मंडी में धान बिकने के बाद आराम से भरें।',
      nextDueLabel: 'अगली देय तिथि:',
      nextDueDate: '10 अक्टूबर 2024',
      amountLabel: 'राशि:',
      payNowBtn: 'किस्त भुगतान करें (Pay via UPI)',
      mandiTitle: 'आज का रायपुर मंडी भाव (APMC MSP Rates)',
      mandiSubtitle: 'लाइव सरकारी समर्थन मूल्य (MSP) एवं मंडी भाव',
      paddyMsp: 'धान ग्रेड-ए (MSP ₹2,320/क्विंटल)',
      paddyPrice: '₹2,380 / क्विंटल',
      paddyPremium: 'सरकारी एमएसपी से +₹60 अधिक भाव',
      raipurMandi: 'रायपुर मंडी',
      soyabeanLabel: 'सोयाबीन (MSP ₹4,892/q)',
      durgMandi: 'दुर्ग APMC भाव',
      mandiRateTag: 'मंडी भाव',
      expectedYield: 'अनुमानित फसल आय: ~₹3,57,000 (150 क्विंटल)',
      weatherTitle: 'मौसम एवं कृषि सलाह (Weather Advisory)',
      weatherSubtitle: 'रायपुर जिला 5-दिवसीय मौसम अनुमान',
      weatherForecast: 'गुरुवार को हल्की बारिश (12mm) का अनुमान है। यूरिया छिड़काव के लिए अनुकूल समय है।',
      tempLabel: 'तापमान:',
      pestLabel: 'कीट प्रकोप जोखिम:',
      safeLabel: 'शून्य / सुरक्षित',
      freeVoiceTag: 'निःशुल्क न्यूरल आवाज सहायक (Free Vernacular Voice)',
      askSaathiTitle: 'GeoKisaan कृषि साथी से बोलकर पूछें',
      askSaathiSub: 'कोई भी सवाल पूछें — तुरंत आवाज में जवाब पाएं',
      tapToTalk: 'माइक दबाकर बात करें (Tap to Speak)',
      oneTapVoiceTitle: 'एक क्लिक में पूछें (One-Tap Spoken Answers):',
      q1: 'बुवाई समय किस्त कितनी है?',
      q2: 'आज मंडी में धान का भाव क्या है?',
      q3: 'कम बारिश होने पर किस्त कैसे टलेगी?',
      q4: 'डीलर से ट्रैक्टर कब मिलेगा?',
    },
    telugu: {
      portalBadge: 'రైతు సేవా కేంద్రం · GeoKisaan సాథి',
      backToCockpit: '← అధికారి కాక్‌పిట్‌కు తిరిగి వెళ్ళండి',
      welcome: 'స్వాగతం, రాజేశ్వర్ జీ!',
      loanSanctionedTag: 'రుణం మంజూరైంది (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'మంజూరైన రుణ మొత్తం',
      subsidizedRate: '8.4% రాయితీ వడ్డీ రేటు (PSL)',
      tractorModel: 'GeoKisaan 45HP స్మార్ట్ ఫార్మ్ ట్రాక్టర్',
      dealerReady: 'GeoKisaan రాయ్‌పూర్ డీలర్‌షిప్ వద్ద డెలివరీకి సిద్ధంగా ఉంది',
      downloadSanction: 'మంజూరు పత్రం డౌన్‌లోడ్ చేయండి',
      downloading: 'డౌన్‌లోడ్ అవుతోంది...',
      satelliteTitle: 'ఉపగ్రహ పంట ఆరోగ్యం (Sentinel-2 NDVI)',
      khasraInfo: 'ప్లాట్ 142/1 · రాయ్‌పూర్, ఛత్తీస్‌గఢ్ (4.5 ఎకరాలు)',
      ndviScore: '0.68 - ఆరోగ్యకరమైన పచ్చని పంట',
      cloudGapTag: '100% క్లౌడ్‌గ్యాప్ ఇన్‌పెయింటింగ్ విజయవంతం',
      ndviScaleLabel: 'లైవ్ శాటిలైట్ పచ్చదనం సూచిక (NDVI Vigor)',
      scaleLow: '0.0 (ఎండిన నేల)',
      scaleMid: '0.4 (మధ్యస్థం)',
      scaleHigh: '0.68 (ఆరోగ్యకరమైన వరి)',
      scaleMax: '1.0 (దట్టమైన పచ్చదనం)',
      cloudGapTitle: 'CloudGap-CG ఇన్‌పెయింటింగ్',
      cloudGapDesc: 'వర్షాకాలపు మేఘాలను 99.4% AI ఖచ్చితత్వంతో ఛేదించి పంట ఆరోగ్యాన్ని ధృవీకరించింది.',
      moistureTitle: 'తేమ సూచిక (NDMI 0.19)',
      moistureDesc: 'నేలలో సరైన తేమ ఉంది. సాగు నీటి ఒత్తిడి చాలా తక్కువగా ఉంది.',
      lastPass: 'చివరి ఉపగ్రహ కదలిక: నేడు ఉదయం 10:42 గంటలకు (Sentinel-2A)',
      verifiedPlot: 'ధృవీకరించబడిన రెవెన్యూ భూ రికార్డు',
      emiTitle: 'GeoKisaan హార్వెస్ట్ అనుగుణ సీజనల్ EMI షెడ్యూల్',
      emiSubTitle: 'పంట రాబడి చక్రానికి తగిన అనువైన వాయిదాల పద్ధతి',
      sowingEmiLabel: 'విత్తనాల కాలం (జూన్ - అక్టోబర్)',
      sowingEmiVal: '₹1,500 / నెలకు',
      sowingEmiSub: 'నామమాత్రపు మెయింటెనెన్స్ ఫీజు మాత్రమే',
      sowingSubNote: 'విత్తనాలు నాటే సమయంలో రైతుపై ఎలాంటి ఆర్థిక భారం ఉండదు!',
      harvestEmiLabel: 'కోత కాలం బుల్లెట్ చెల్లింపు (డిసెంబర్)',
      harvestEmiVal: '₹55,000 బుల్లెట్ వాయిదా',
      harvestEmiSub: 'మండీలో పంట అమ్మిన తర్వాత చెల్లించండి',
      harvestSubNote: 'మండీలో వరి ధాన్యం విక్రయించిన తర్వాత సులభంగా చెల్లించండి.',
      nextDueLabel: 'తదుపరి గడువు తేదీ:',
      nextDueDate: '10 అక్టోబర్ 2024',
      amountLabel: 'మొత్తం:',
      payNowBtn: 'వాయిదా చెల్లించండి (Pay via UPI)',
      mandiTitle: 'నేటి రాయ్‌పూర్ మార్కెట్ ధరలు (APMC MSP Rates)',
      mandiSubtitle: 'లైవ్ ప్రభుత్వ కనీస మద్దతు ధర (MSP) & మార్కెట్ ధరలు',
      paddyMsp: 'వరి గ్రేడ్-ఎ (MSP ₹2,320/క్వింటాల్)',
      paddyPrice: '₹2,380 / క్వింటాల్',
      paddyPremium: 'ప్రభుత్వ MSP కంటే +₹60 ఎక్కువ ధర',
      raipurMandi: 'రాయ్‌పూర్ మండీ',
      soyabeanLabel: 'సోయాబీన్ (MSP ₹4,892/q)',
      durgMandi: 'దుర్గ్ APMC ధర',
      mandiRateTag: 'మండీ ధర',
      expectedYield: 'అంచనా పంట విలువ: ~₹3,57,000 (150 క్వింటాళ్లు)',
      weatherTitle: 'వాతావరణం & వ్యవసాయ సూచనలు',
      weatherSubtitle: 'రాయ్‌పూర్ జిల్లా 5-రోజుల వాతావరణ అంచనా',
      weatherForecast: 'గురువారం సాయంత్రం తేలికపాటి వర్షం (12mm) కురిసే అవకాశం ఉంది. యూరియా వేయడానికి అనుకూల సమయం.',
      tempLabel: 'ఉష్ణోగ్రత:',
      pestLabel: 'తెగుళ్ల ముప్పు సూచిక:',
      safeLabel: 'సున్నా / సురక్షితం',
      freeVoiceTag: 'ఉచిత న్యూరల్ వాయిస్ అసిస్టెంట్ (Grounded RAG)',
      askSaathiTitle: 'GeoKisaan కృషి సాథితో మాట్లాడండి',
      askSaathiSub: 'ఏదైనా ప్రశ్న అడగండి — తక్షణమే మీ భాషలో సమాధానం వినండి',
      tapToTalk: 'మైక్ నొక్కి మాట్లాడండి (Tap to Speak)',
      oneTapVoiceTitle: 'ఒక్క క్లిక్‌తో సమాధానాలు (One-Tap Voice):',
      q1: 'విత్తనాల సమయంలో హార్వెస్ట్ EMI ఎంత?',
      q2: 'నేడు మండీలో వరి ధర ఎంత?',
      q3: 'కరువు వస్తే EMI వాయిదా పడుతుందా?',
      q4: 'డీలర్ నుండి ట్రాక్టర్ ఎప్పుడు తీసుకోవచ్చు?',
    },
    marathi: {
      portalBadge: 'शेतकरी सेवा केंद्र · GeoKisaan साथी',
      backToCockpit: '← अधिकारी कॉकपिटवर परत जा',
      welcome: 'स्वागत आहे, राजेश्वर जी!',
      loanSanctionedTag: 'कर्ज मंजूर (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'मंजूर कर्ज रक्कम',
      subsidizedRate: '8.4% सवलतीचा व्याजदर (PSL)',
      tractorModel: 'GeoKisaan 45HP स्मार्ट फार्म ट्रॅक्टर',
      dealerReady: 'GeoKisaan रायपूर डीलरशिपवर वितरणासाठी सज्ज',
      downloadSanction: 'मंजुरी पत्र डाउनलोड करा',
      downloading: 'डाउनलोड होत आहे...',
      satelliteTitle: 'उपग्रह पीक आरोग्य (Sentinel-2 NDVI)',
      khasraInfo: 'भूखंड 142/1 · रायपूर, छत्तीसगड (4.5 एकर)',
      ndviScore: '0.68 - निरोगी हिरवे पीक',
      cloudGapTag: '100% क्लाउडगॅप इनपेंटिंग यशस्वी',
      ndviScaleLabel: 'थेट सॅटेलाइट हिरवेपण निर्देशांक (NDVI Vigor)',
      scaleLow: '0.0 (नापीक/ओसाड)',
      scaleMid: '0.4 (मध्यम)',
      scaleHigh: '0.68 (निरोगी भातशेती)',
      scaleMax: '1.0 (अति हिरवेगार)',
      cloudGapTitle: 'CloudGap-CG इनपेंटिंग',
      cloudGapDesc: 'पावसाळी ढगांच्या पलीकडे जाऊन 99.4% अचूकतेने शेतातील पीक सत्यापित करण्यात आले.',
      moistureTitle: 'ओलावा निर्देशांक (NDMI 0.19)',
      moistureDesc: 'मातीत पुरेसा ओलावा उपलब्ध आहे. पिकावरील ताण नगण्य आहे.',
      lastPass: 'शेवटची उपग्रह फेरी: आज सकाळी 10:42 वाजता (Sentinel-2A)',
      verifiedPlot: 'सत्यापित भू-अभिलेख',
      emiTitle: 'GeoKisaan हंगामी हार्वेस्ट ईएमआय वेळापत्रक (Harvest EMI)',
      emiSubTitle: 'पीक चक्रानुसार लवचिक परतफेड व्यवस्था',
      sowingEmiLabel: 'पेरणीचा काळ (जून - ऑक्टोबर)',
      sowingEmiVal: '₹1,500 / महिना',
      sowingEmiSub: 'केवळ नाममात्र देखभाल हप्ता',
      sowingSubNote: 'पेरणीच्या खर्चाच्या काळात शेतकऱ्यावर कोणताही मोठा भार नाही!',
      harvestEmiLabel: 'कापणीनंतरचा बुलेट हप्ता (डिसेंबर)',
      harvestEmiVal: '₹55,000 बुलेट हप्ता',
      harvestEmiSub: 'मंडईत पीक विकल्यानंतर भरा',
      harvestSubNote: 'मंडईत भात विकल्यानंतर आरामात भरा.',
      nextDueLabel: 'पुढील देय तारीख:',
      nextDueDate: '10 ऑक्टोबर 2024',
      amountLabel: 'रक्कम:',
      payNowBtn: 'हप्ता भरा (Pay via UPI)',
      mandiTitle: 'आजचे रायपूर बाजार भाव (APMC MSP Rates)',
      mandiSubtitle: 'थेट सरकारी हमीभाव (MSP) आणि बाजार भाव',
      paddyMsp: 'धान ग्रेड-ए (MSP ₹2,320/क्विंटल)',
      paddyPrice: '₹2,380 / क्विंटल',
      paddyPremium: 'सरकारी हमीभावापेक्षा +₹60 अधिक भाव',
      raipurMandi: 'रायपूर कृषी उत्पन्न बाजार समिती',
      soyabeanLabel: 'सोयाबीन (MSP ₹4,892/q)',
      durgMandi: 'दुर्ग APMC भाव',
      mandiRateTag: 'बाजार भाव',
      expectedYield: 'अंदाजे पीक उत्पन्न मूल्य: ~₹3,57,000 (150 क्विंटल)',
      weatherTitle: 'हवामान आणि कृषी सल्ला (Weather Advisory)',
      weatherSubtitle: 'रायपूर जिल्हा 5-दिवसीय हवामान अंदाज',
      weatherForecast: 'गुरुवारी संध्याकाळी हलका पाऊस (12mm) अपेक्षित आहे. युरिया खत देण्यासाठी अनुकूल वेळ.',
      tempLabel: 'तापमान:',
      pestLabel: 'कीड प्रादुर्भाव जोखीम:',
      safeLabel: 'शून्य / सुरक्षित',
      freeVoiceTag: 'विनामूल्य न्यूरल आवाज सहाय्यक (Grounded RAG)',
      askSaathiTitle: 'GeoKisaan कृषी साथीशी बोलून विचारा',
      askSaathiSub: 'कोणताही प्रश्न विचारा — तत्काळ आपल्या भाषेत उत्तर मिळवा',
      tapToTalk: 'माईक दाबून बोला (Tap to Speak)',
      oneTapVoiceTitle: 'एका क्लीकमध्ये विचारा (One-Tap Voice):',
      q1: 'पेरणीच्या काळात हप्ता किती आहे?',
      q2: 'आज मंडईत धान भाव काय आहे?',
      q3: 'दुष्काळ पडल्यास हप्ता पुढे ढकलला जाईल का?',
      q4: 'डीलरकडून ट्रॅक्टर कधी मिळेल?',
    },
    kannada: {
      portalBadge: 'ರೈತ ಸೇವಾ ಕೇಂದ್ರ · GeoKisaan ಸಾಥಿ',
      backToCockpit: '← ಅಧಿಕಾರಿ ಕಾಕ್‌ಪಿಟ್‌ಗೆ ಹಿಂತಿರುಗಿ',
      welcome: 'ಸ್ವಾಗತ, ರಾಜೇಶ್ವರ್ ಜೀ!',
      loanSanctionedTag: 'ಸಾಲ ಮಂಜೂರಾಗಿದೆ (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'ಮಂಜೂರಾದ ಸಾಲದ ಮೊತ್ತ',
      subsidizedRate: '8.4% ಸಬ್ಸಿಡಿ ಬಡ್ಡಿದರ (PSL)',
      tractorModel: 'GeoKisaan 45HP ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮ್ ಟ್ರ್ಯಾಕ್ಟರ್',
      dealerReady: 'GeoKisaan ರಾಯಪುರ ಡೀಲರ್‌ಶಿಪ್‌ನಲ್ಲಿ ವಿತರಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ',
      downloadSanction: 'ಮಂಜೂರಾತಿ ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      downloading: 'ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      satelliteTitle: 'ಉಪಗ್ರಹ ಬೆಳೆ ಆರೋಗ್ಯ (Sentinel-2 NDVI)',
      khasraInfo: 'ಪ್ಲಾಟ್ 142/1 · ರಾಯಪುರ, ಛತ್ತೀಸ್‌ಗಢ (4.5 ಎಕರೆ)',
      ndviScore: '0.68 - ಆರೋಗ್ಯಕರ ಹಸಿರು ಬೆಳೆ',
      cloudGapTag: '100% ಕ್ಲೌಡ್‌ಗ್ಯಾಪ್ ಇನ್‌ಪೇಂಟಿಂಗ್ ಯಶಸ್ವಿ',
      ndviScaleLabel: 'ಲೈವ್ ಉಪಗ್ರಹ ಹಸಿರು ಸೂಚ್ಯಂಕ (NDVI Vigor)',
      scaleLow: '0.0 (ಬಂಜರು ಭೂಮಿ)',
      scaleMid: '0.4 (ಮಧ್ಯಮ)',
      scaleHigh: '0.68 (ಆರೋಗ್ಯಕರ ಭತ್ತದ ಬೆಳೆ)',
      scaleMax: '1.0 (ದಟ್ಟ ಹಸಿರು)',
      cloudGapTitle: 'CloudGap-CG ಇನ್‌ಪೇಂಟಿಂಗ್',
      cloudGapDesc: 'ಮುಂಗಾರು ಮೋಡಗಳ ನಡುವೆಯೂ 99.4% ನಿಖರತೆಯೊಂದಿಗೆ ಬೆಳೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
      moistureTitle: 'ತೇವಾಂಶ ಸೂಚ್ಯಂಕ (NDMI 0.19)',
      moistureDesc: 'ಮಣ್ಣಿನಲ್ಲಿ ಸೂಕ್ತ ತೇವಾಂಶವಿದೆ. ಬೆಳೆ ನೀರಿನ ಒತ್ತಡ ಕನಿಷ್ಠವಾಗಿದೆ.',
      lastPass: 'ಕೊನೆಯ ಉಪಗ್ರಹ ಪರಿಶೀಲನೆ: ಇಂದು ಬೆಳಗ್ಗೆ 10:42 (Sentinel-2A)',
      verifiedPlot: 'ದೃಢೀಕೃತ ಭೂ ದಾಖಲೆ (ಕಹಸ್ರಾ)',
      emiTitle: 'GeoKisaan ಸುಗ್ಗಿ ಆಧಾರಿತ ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ ವೇಳಾಪಟ್ಟಿ',
      emiSubTitle: 'ಬೆಳೆ ಆದಾಯ ಚಕ್ರಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುವ ಸುಲಭ ಕಂತುಗಳು',
      sowingEmiLabel: 'ಬಿತ್ತನೆ ಕಾಲ (ಜೂನ್ - ಅಕ್ಟೋಬರ್)',
      sowingEmiVal: '₹1,500 / ತಿಂಗಳಿಗೆ',
      sowingEmiSub: 'ಕೇವಲ ನಾಮಮಾತ್ರದ ನಿರ್ವಹಣಾ ಕಂತು',
      sowingSubNote: 'ಬಿತ್ತನೆ ಖರ್ಚಿನ ಸಮಯದಲ್ಲಿ ರೈತರ ಮೇಲೆ ಯಾವುದೇ ಆರ್ಥಿಕ ಹೊರೆಯನ್ನು ಹಾಕುವುದಿಲ್ಲ!',
      harvestEmiLabel: 'ಸುಗ್ಗಿಯ ಬುಲೆಟ್ ಕಂತು (ಡಿಸೆಂಬರ್)',
      harvestEmiVal: '₹55,000 ಬುಲೆಟ್ ಪಾವತಿ',
      harvestEmiSub: 'ಮಂಡಿಯಲ್ಲಿ ಬೆಳೆ ಮಾರಾಟವಾದ ನಂತರ ಪಾವತಿಸಿ',
      harvestSubNote: 'ಮಂಡಿಯಲ್ಲಿ ಭತ್ತ ಮಾರಾಟವಾದ ನಂತರ ಆರಾಮವಾಗಿ ಪಾವತಿಸಿ.',
      nextDueLabel: 'ಮುಂದಿನ ಕಂತಿನ ದಿನಾಂಕ:',
      nextDueDate: '10 ಅಕ್ಟೋಬರ್ 2024',
      amountLabel: 'ಮೊತ್ತ:',
      payNowBtn: 'ಕಂತು ಪಾವತಿಸಿ (Pay via UPI)',
      mandiTitle: 'ಇಂದಿನ ರಾಯಪುರ ಎಪಿಎಂಸಿ ದರಗಳು (MSP Rates)',
      mandiSubtitle: 'ಲೈವ್ ಸರ್ಕಾರದ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) & ಮಂಡಿ ದರಗಳು',
      paddyMsp: 'ಭತ್ತ ಗ್ರೇಡ್-ಎ (MSP ₹2,320/ಕ್ವಿಂಟಾಲ್)',
      paddyPrice: '₹2,380 / ಕ್ವಿಂಟಾಲ್',
      paddyPremium: 'ಸರ್ಕಾರಿ ಎಂಎಸ್‌ಪಿಗಿಂತ +₹60 ಹೆಚ್ಚಿನ ದರ',
      raipurMandi: 'ರಾಯಪುರ ಮಂಡಿ',
      soyabeanLabel: 'ಸೋಯಾಬೀನ್ (MSP ₹4,892/q)',
      durgMandi: 'ದುರ್ಗ್ APMC ದರ',
      mandiRateTag: 'ಮಂಡಿ ದರ',
      expectedYield: 'ಅಂದಾಜು ಬೆಳೆ ಆದಾಯ: ~₹3,57,000 (150 ಕ್ವಿಂಟಾಲ್)',
      weatherTitle: 'ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ',
      weatherSubtitle: 'ರಾಯಪುರ ಜಿಲ್ಲೆಯ 5-ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
      weatherForecast: 'ಗುರುವಾರ ಸಂಜೆ ಸಾಧಾರಣ ಮಳೆ (12mm) ಸಾಧ್ಯತೆ. ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕಲು ಸೂಕ್ತ ಸಮಯ.',
      tempLabel: 'ತಾಪಮಾನ:',
      pestLabel: 'ಕೀಟ ಬಾಧೆ ಅಪಾಯ:',
      safeLabel: 'ಶೂನ್ಯ / ಸುರಕ್ಷಿತ',
      freeVoiceTag: 'ಉಚಿತ ನ್ಯೂರಲ್ ಧ್ವನಿ ಸಹಾಯಕ (Grounded RAG)',
      askSaathiTitle: 'GeoKisaan ಕೃಷಿ ಸಾಥಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ',
      askSaathiSub: 'ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ — ತಕ್ಷಣ ಧ್ವನಿಯ ಮೂಲಕ ಉತ್ತರ ಪಡೆಯಿರಿ',
      tapToTalk: 'ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ (Tap to Speak)',
      oneTapVoiceTitle: 'ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಧ್ವನಿ ಉತ್ತರಗಳು:',
      q1: 'ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಹಾರ್ವೆಸ್ಟ್ ಇಎಂಐ ಎಷ್ಟು?',
      q2: 'ಇಂದು ಮಂಡಿಯಲ್ಲಿ ಭತ್ತದ ದರವೇನು?',
      q3: 'ಬರಗಾಲ ಬಂದರೆ ಇಎಂಐ ಮುಂದೂಡಬಹುದೇ?',
      q4: 'ಡೀಲರ್‌ನಿಂದ ಟ್ರ್ಯಾಕ್ಟರ್ ಯಾವಾಗ ಸಿಗುತ್ತದೆ?',
    },
    bengali: {
      portalBadge: 'কৃষক সেবা কেন্দ্র · GeoKisaan সাথী',
      backToCockpit: '← ক্রেডিট অফিসার ককপিটে ফিরে যান',
      welcome: 'স্বাগতম, রাজেশ্বর জী!',
      loanSanctionedTag: 'ঋণ মঞ্জুর হয়েছে (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'মঞ্জুরীকৃত ঋণের পরিমাণ',
      subsidizedRate: '8.4% ভর্তুকিযুক্ত সুদের হার (PSL)',
      tractorModel: 'GeoKisaan 45HP স্মার্ট ফার্ম ট্র্যাক্টর',
      dealerReady: 'GeoKisaan রায়পুর ডিলারশিপে ডেলিভারির জন্য প্রস্তুত',
      downloadSanction: 'মঞ্জুরিপত্র ডাউনলোড করুন',
      downloading: 'ডাউনলোড হচ্ছে...',
      satelliteTitle: 'উপগ্রহ ফসল স্বাস্থ্য (Sentinel-2 NDVI)',
      khasraInfo: 'খসরা ১৪২/১ · রায়পুর, ছত্তিশগড় (৪.৫ একর)',
      ndviScore: '0.68 - সুস্থ সবুজ ফসল',
      cloudGapTag: '১০০% ক্লাউডগ্যাপ ইনপেন্টিং সফল (CloudGap-CG)',
      ndviScaleLabel: 'লাইভ উপগ্রহ সবুজ সূচক (NDVI Vigor)',
      scaleLow: '0.0 (অনুর্বর/শুষ্ক)',
      scaleMid: '0.4 (মাঝারি)',
      scaleHigh: '0.68 (স্বাস্থ্যকর ধান)',
      scaleMax: '1.0 (ঘন সবুজ)',
      cloudGapTitle: 'CloudGap-CG ইনপেন্টিং',
      cloudGapDesc: 'বর্ষার মেঘ ভেদ করে ৯৯.৪% নির্ভুলতায় ফসলের স্বাস্থ্য যাচাই করা হয়েছে।',
      moistureTitle: 'আর্দ্রতা সূচক (NDMI 0.19)',
      moistureDesc: 'মাটিতে পর্যাপ্ত আর্দ্রতা রয়েছে। ফসলে সেচজনিত চাপ অত্যন্ত কম।',
      lastPass: 'সর্বশেষ উপগ্রহ চক্র: আজ সকাল ১০:৪২ মিনিটে (Sentinel-2A)',
      verifiedPlot: 'যাচাইকৃত খতিয়ান/জমি রেকর্ড',
      emiTitle: 'GeoKisaan মরশুমি হার্ভেস্ট ইএমআই সময়সূচী',
      emiSubTitle: 'ফসল উৎপাদন চক্রের সাথে মানানসই নমনীয় কিস্তি ব্যবস্থা',
      sowingEmiLabel: 'বপনের মরশুম (জুন - অক্টোবর)',
      sowingEmiVal: '₹1,500 / প্রতি মাসে',
      sowingEmiSub: 'কেবল নামমাত্র রক্ষণাবেক্ষণ কিস্তি',
      sowingSubNote: 'বপন মরশুমে কৃষকদের ওপর কোনো ভারী আর্থিক চাপ নেই!',
      harvestEmiLabel: 'ফসল তোলার বুলেট কিস্তি (ডিসেম্বর)',
      harvestEmiVal: '₹55,000 বুলেট পেমেন্ট',
      harvestEmiSub: 'মন্ডিতে ফসল বিক্রির পর পরিশোধ করুন',
      harvestSubNote: 'মন্ডিতে ধান বিক্রির পর স্বাচ্ছন্দ্যে পরিশোধ করুন।',
      nextDueLabel: 'পরবর্তী কিস্তির তারিখ:',
      nextDueDate: '10 অক্টোবর 2024',
      amountLabel: 'পরিমাণ:',
      payNowBtn: 'কিস্তি পরিশোধ করুন (Pay via UPI)',
      mandiTitle: 'আজকের রায়পুর মান্ডি দর (APMC MSP Rates)',
      mandiSubtitle: 'লাইভ সরকারি ন্যূনতম সহায়ক মূল্য (MSP) ও মান্ডি দর',
      paddyMsp: 'ধান গ্রেড-এ (MSP ₹2,320/কুইন্টাল)',
      paddyPrice: '₹2,380 / কুইন্টাল',
      paddyPremium: 'সরকারি MSP-এর চেয়ে +₹60 বেশি দাম',
      raipurMandi: 'রায়পুর মান্ডি',
      soyabeanLabel: 'সয়াবিন (MSP ₹4,892/q)',
      durgMandi: 'দুর্গ APMC দর',
      mandiRateTag: 'মান্ডি দর',
      expectedYield: 'আনুমানিক ফসল বিক্রয় মূল্য: ~₹3,57,000 (150q)',
      weatherTitle: 'আবহাওয়া ও কৃষি পরামর্শ (Weather Advisory)',
      weatherSubtitle: 'রায়পুর জেলার ৫ দিনের আবহাওয়া পূর্বাভাস',
      weatherForecast: 'বৃহস্পতিবার সন্ধ্যায় হালকা বৃষ্টিপাতের (12mm) সম্ভাবনা। ইউরিয়া সারের দ্বিতীয় ধাপ প্রয়োগের উপযুক্ত সময়।',
      tempLabel: 'তাপমাত্রা:',
      pestLabel: 'কীটপতঙ্গ ঝুঁকি সূচক:',
      safeLabel: 'শূন্য / নিরাপদ',
      freeVoiceTag: 'বিনামূল্যে নিউরাল ভয়েস সহকারী (Grounded RAG)',
      askSaathiTitle: 'GeoKisaan কৃষি সাথীর সাথে কথা বলুন',
      askSaathiSub: 'যেকোনো প্রশ্ন মুখে বলুন — তাৎক্ষণিক কথ্য ভাষায় উত্তর পান',
      tapToTalk: 'মাইক চেপে কথা বলুন (Tap to Speak)',
      oneTapVoiceTitle: 'এক ক্লিকে ভয়েস উত্তর (One-Tap Voice):',
      q1: 'বপন মরশুমে হার্ভেস্ট ইএমআই কত?',
      q2: 'আজ মান্ডিতে ধানের দর কত?',
      q3: 'খরা দেখা দিলে কি ইএমআই স্থগিত হবে?',
      q4: 'ডিলারের কাছ থেকে ট্র্যাক্টর কবে পাওয়া যাবে?',
    },
    chhattisgarhi: {
      portalBadge: 'किसान सेवा केंद्र · GeoKisaan साथी',
      backToCockpit: '← क्रेडिट अफसर कॉकपिट म जाव',
      welcome: 'जय जोहार, रामेश्वर जी!',
      loanSanctionedTag: 'ऋण स्वीकृत (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'स्वीकृत राशि',
      subsidizedRate: '8.4% रियायती ब्याज दर (PSL)',
      tractorModel: 'GeoKisaan 45HP स्मार्ट फार्म ट्रैक्टर',
      dealerReady: 'GeoKisaan रायपुर डीलरशिप म गाड़ी मिले बर तइयार हे',
      downloadSanction: 'स्वीकृति पत्र डाउनलोड करव',
      downloading: 'डाउनलोड होवत हे...',
      satelliteTitle: 'उपग्रह फसल स्वास्थ्य (Sentinel-2 NDVI)',
      khasraInfo: 'खसरा 142/1 · रायपुर, छत्तीसगढ़ (4.5 एकड़)',
      ndviScore: '0.68 - स्वस्थ हरी फसल',
      cloudGapTag: '100% बादल इनपेंटिंग सफल (CloudGap-CG)',
      ndviScaleLabel: 'लाइव सैटेलाइट हरियाली सूचकांक (NDVI Vigor)',
      scaleLow: '0.0 (सूखा/बंजर)',
      scaleMid: '0.4 (मध्यम)',
      scaleHigh: '0.68 (स्वस्थ धान)',
      scaleMax: '1.0 (अति सघन)',
      cloudGapTitle: 'CloudGap-CG इनपेंटिंग',
      cloudGapDesc: 'मानसून के बादलों के आर-पार देख 99.4% सटीकता से खेत की हरी फसल सत्यापित की गई।',
      moistureTitle: 'नमी सूचकांक (NDMI 0.19)',
      moistureDesc: 'खेत में पर्याप्त नमी मौजूद है। सिंचाई का तनाव न्यूनतम स्तर पर है।',
      lastPass: 'अंतिम उपग्रह परिक्रमा: आज प्रातः 10:42 बजे (Sentinel-2A)',
      verifiedPlot: 'सत्यापित भू-अभिलेख',
      emiTitle: 'GeoKisaan हार्वेस्ट-अलैन्ड मौसमी किस्त (Harvest EMI)',
      emiSubTitle: 'फसल चक्र के अनुरूप लचीली किस्त व्यवस्था',
      sowingEmiLabel: 'बोआई बेरा (जून - अक्टूबर)',
      sowingEmiVal: '₹1,500 / महीना',
      sowingEmiSub: 'खाली नानचुन रखरखाव किस्त',
      sowingSubNote: 'बोआई समय किसान पर कोनो आर्थिक बोझ नई!',
      harvestEmiLabel: 'कटाई बेरा (दिसंबर)',
      harvestEmiVal: '₹55,000 बुलेट किस्त',
      harvestEmiSub: 'मंडी म धान बिकाय के बाद',
      harvestSubNote: 'जब जेब में फसल की पूरी आमदनी आए।',
      nextDueLabel: 'अगली देय तिथि:',
      nextDueDate: '10 अक्टूबर 2024',
      amountLabel: 'राशि:',
      payNowBtn: 'किस्त जमा करव (Pay via UPI)',
      mandiTitle: 'आज के रायपुर मंडी भाव (APMC MSP Rates)',
      mandiSubtitle: 'लाइव सरकारी समर्थन मूल्य (MSP) एवं मंडी भाव',
      paddyMsp: 'धान ग्रेड-ए (MSP ₹2,320/क्विंटल)',
      paddyPrice: '₹2,380 / क्विंटल',
      paddyPremium: 'सरकारी एमएसपी से +₹60 अधिक भाव',
      raipurMandi: 'रायपुर मंडी',
      soyabeanLabel: 'सोयाबीन (MSP ₹4,892/q)',
      durgMandi: 'दुर्ग APMC भाव',
      mandiRateTag: 'मंडी भाव',
      expectedYield: 'अनुमानित फसल आय: ~₹3,57,000 (150 क्विंटल)',
      weatherTitle: 'मौसम अउ कृषि सलाह (Weather Advisory)',
      weatherSubtitle: 'रायपुर जिला 5-दिवसीय मौसम अनुमान',
      weatherForecast: 'बृहस्पतिवार मंझा हल्का पानी गिरे के संभावना हे (12mm)। यूरिया खाद डाले बर बढ़िया बेरा हे।',
      tempLabel: 'तापमान:',
      pestLabel: 'कीट प्रकोप जोखिम:',
      safeLabel: 'शून्य / सुरक्षित',
      freeVoiceTag: 'निःशुल्क न्यूरल आवाज सहायक (Free Vernacular Voice)',
      askSaathiTitle: 'GeoKisaan कृषि साथी से बोल के पूछव',
      askSaathiSub: 'कोनो भी सवाल पूछव — तुरंत आवाज म उत्तर मिलही',
      tapToTalk: 'माइक दबा के पूछव (Tap to Speak)',
      oneTapVoiceTitle: 'एक क्लिक में पूछें (One-Tap Spoken Answers):',
      q1: 'बोआई बेरा किस्त कतका हे?',
      q2: 'मंडी म धान के भाव का हे?',
      q3: 'सूखा परे म का किस्त रुकही?',
      q4: 'डीलर ले ट्रैक्टर कइसे मिलही?',
    },
    tamil: {
      portalBadge: 'உழவர் சேவை மையம் · GeoKisaan சாதி',
      backToCockpit: '← கடன் ஆய்வாளர் காக்பிட் திரும்புக',
      welcome: 'வணக்கம், ராஜேஷ்வர் ஜி!',
      loanSanctionedTag: 'கடன் அனுமதி உறுதியானது (Loan Sanctioned)',
      loanAmount: '₹5,50,000',
      sanctionedAmountLabel: 'அனுமதிக்கப்பட்ட கடன் தொகை',
      subsidizedRate: '8.4% மானிய வட்டி விகிதம் (PSL)',
      tractorModel: 'GeoKisaan 45HP ஸ்மார்ட் விவசாய டிராக்டர்',
      dealerReady: 'ராய்ப்பூர் GeoKisaan டீலர் அலுவலகத்தில் வாகனம் தயார்',
      downloadSanction: 'அனுமதி கடிதத்தை பதிவிறக்குக',
      downloading: 'பதிவிறக்கம் செய்யப்படுகிறது...',
      satelliteTitle: 'செயற்கைக்கோள் பயிர் நலம் (Sentinel-2 NDVI)',
      khasraInfo: 'புல எண் 142/1 · ராய்ப்பூர் (4.5 ஏக்கர்)',
      ndviScore: '0.68 - சிறந்த பசுமை குறியீடு',
      cloudGapTag: '100% மேகமூட்ட ஊடுருவல் (CloudGap-CG)',
      ndviScaleLabel: 'நேரடி செயற்கைக்கோள் பசுமை குறியீடு (NDVI Vigor)',
      scaleLow: '0.0 (வறண்ட நிலம்)',
      scaleMid: '0.4 (மிதமானது)',
      scaleHigh: '0.68 (ஆரோக்கிய பயிர்)',
      scaleMax: '1.0 (அடர் பசுமை)',
      cloudGapTitle: 'CloudGap-CG மேகமூட்ட ஊடுருவல்',
      cloudGapDesc: 'மேகமூட்டத்தையும் ஊடுருவி 99.4% துல்லியத்துடன் பயிர் நலம் சரிபார்க்கப்பட்டது.',
      moistureTitle: 'ஈரப்பத குறியீடு (NDMI 0.19)',
      moistureDesc: 'மண்ணில் போதுமான ஈரப்பதம் உள்ளது. பாசன அழுத்தம் குறைவு.',
      lastPass: 'கடைசி செயற்கைக்கோள் சுழற்சி: இன்று காலை 10:42 (Sentinel-2A)',
      verifiedPlot: 'சரிபார்க்கப்பட்ட நில ஆவணம்',
      emiTitle: 'GeoKisaan சீசனல் அறுவடை தவணை திட்டம் (Harvest EMI)',
      emiSubTitle: 'பயிர் வருவாய் சுழற்சிக்கு ஏற்ற நெகிழ்வான தவணை முறை',
      sowingEmiLabel: 'விதைப்பு காலம் (ஜூன் - அக்டோபர்)',
      sowingEmiVal: '₹1,500 / மாதம்',
      sowingEmiSub: 'குறைந்த பராமரிப்பு தவணை மட்டுமே',
      sowingSubNote: 'விதைப்பு காலத்தில் விவசாயிகளுக்கு நிதிச்சுமை இல்லை!',
      harvestEmiLabel: 'அறுவடை காலம் (டிசம்பர்)',
      harvestEmiVal: '₹55,000 முக்கிய தவணை',
      harvestEmiSub: 'மண்டி விற்பனைக்கு பின்னர் செலுத்துங்கள்',
      harvestSubNote: 'அறுவடை விற்ற பின்னர் எளிய முறையில் செலுத்துங்கள்.',
      nextDueLabel: 'அடுத்த தவணை தேதி:',
      nextDueDate: '10 அக்டோபர் 2024',
      amountLabel: 'தொகை:',
      payNowBtn: 'தவணை செலுத்துக (UPI / QR)',
      mandiTitle: 'இன்றைய ராய்ப்பூர் மண்டி விலை (APMC MSP)',
      mandiSubtitle: 'நேரடி அரசு குறைந்தபட்ச ஆதரவு விலை (MSP) & மண்டி விலை',
      paddyMsp: 'நெல் கிரேடு-ஏ (MSP ₹2,320/குவிண்டால்)',
      paddyPrice: '₹2,380 / குவிண்டால்',
      paddyPremium: 'அரசு MSP-யை விட +₹60 கூடுதல் விலை',
      raipurMandi: 'ராய்ப்பூர் மண்டி',
      soyabeanLabel: 'சோயாபீன் (MSP ₹4,892/q)',
      durgMandi: 'துர்க் APMC விலை',
      mandiRateTag: 'மண்டி விலை',
      expectedYield: 'எதிர்பார்க்கப்படும் பயிர் மதிப்பு: ~₹3,57,000',
      weatherTitle: 'வானிலை மற்றும் பயிர் வழிகாட்டுதல்',
      weatherSubtitle: 'ராய்ப்பூர் மாவட்ட 5-நாள் வானிலை முன்னறிவிப்பு',
      weatherForecast: 'வியாழக்கிழமை மிதமான மழை (12 மிமீ) எதிர்பார்க்கப்படுகிறது. உரம் இடுவதற்கு ஏற்ற சூழல்.',
      tempLabel: 'வெப்பநிலை:',
      pestLabel: 'பூச்சித் தாக்குதல் அபாயம்:',
      safeLabel: 'பூஜ்ஜியம் / பாதுகாப்பானது',
      freeVoiceTag: 'இலவச நியூரோ குரல் உதவியாளர் (Grounded RAG)',
      askSaathiTitle: 'GeoKisaan கிரிஷி சாதியிடம் பேசி அறிந்திடுங்கள்',
      askSaathiSub: 'குரல் வழியே உங்கள் கேள்விகளைக் கேட்டு உடனே விடை பெறுங்கள்',
      tapToTalk: 'மைக் அழுத்தி பேசுக (Tap to Speak)',
      oneTapVoiceTitle: 'ஒரே தொடுதலில் கேள்வி கேளுங்கள்:',
      q1: 'விதைப்பு காலத்தில் தவணை எவ்வளவு?',
      q2: 'இன்றைய மண்டி நெல் விலை என்ன?',
      q3: 'வறட்சி ஏற்பட்டால் EMI தள்ளிப்போகுமா?',
      q4: 'டீலரிடம் இருந்து டிராக்டரை எப்போது பெறலாம்?',
    },
  }[lang];

  const triggerAssistantWithQuery = (query: string) => {
    window.dispatchEvent(
      new CustomEvent('open-krishi-saathi', {
        detail: { query, language: lang },
      })
    );
  };

  const handleDownloadSanction = () => {
    setShowSanctionDownloadToast(true);
    setTimeout(() => {
      setShowSanctionDownloadToast(false);
      const borrowerName = loan?.applicant_name || 'Rajeshwar Sahu';
      const appId = loan?.application_id || 'GK-TR-2024-5510';
      const khasra = loan?.khasra_no || '142/1';
      const village = loan?.village || 'Raipur';
      const district = loan?.district || 'Chhattisgarh';
      const acres = loan?.land_acres || '4.50';
      const amountInr = loan?.sanctioned_amount_inr ? Number(loan.sanctioned_amount_inr).toLocaleString('en-IN') : '5,50,000';
      const tractor = loan?.tractor_model || 'GeoKisaan 45HP Smart Agriculture Tractor';
      const roi = loan?.interest_rate_pct || 8.4;
      const sowingEmi = loan?.repayment_structure?.sowing_lean_inr ? Number(loan.repayment_structure.sowing_lean_inr).toLocaleString('en-IN') : '1,500';
      const harvestEmi = loan?.repayment_structure?.harvest_bullet_inr ? Number(loan.repayment_structure.harvest_bullet_inr).toLocaleString('en-IN') : '55,000';
      const ndvi = loan?.scorecard_breakdown?.satellite_ndvi_mean ?? 0.68;
      const dealership = loan?.dealership || `GeoKisaan ${district} Authorized Dealership`;

      // Trigger a real text file download for the sanction letter
      const sanctionText = `=====================================================
GEOKISAAN SERVICES LIMITED - AGRI-LENDING SANCTION
=====================================================
Borrower: ${borrowerName}
Application Ref: ${appId}
Khasra / Plot: ${khasra}, ${village}, ${district} (${acres} Acres)
Sanction Amount: INR ${amountInr}
Product: ${tractor}
Interest Rate: ${roi}% p.a. (Priority Sector Lending PSL)
Repayment Structure: Seasonally-Aligned GeoKisaan Harvest EMI
  - Sowing Lean Months (June-Oct): INR ${sowingEmi}/month
  - Harvest Bullet Months (Nov-Dec): INR ${harvestEmi}/bullet
Verification: Sentinel-2 NDVI ${ndvi} + CloudGap-CG Verified
Dealer Delivery: ${dealership}
=====================================================`;
      const blob = new Blob([sanctionText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GeoKisaan_Sanction_Letter_${borrowerName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen w-full text-slate-900 pb-24"
      style={{ backgroundColor: '#F4EFEB' }}
    >
      {/* 
        FARMER TOP NAVIGATION BAR
      */}
      <header className="sticky top-0 z-40 bg-[#0B2545] text-white shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Portal title */}
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  GeoKisaan
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                  {t.portalBadge}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium hidden sm:block">
                {loan ? `${loan.applicant_name} · Ref: ${loan.application_id || 'GK-8921'} (${loan.village || loan.district})` : (
                  lang === 'english'
                    ? 'Rajeshwar Sahu · Member ID: GK-8921 (Raipur)'
                    : lang === 'tamil'
                    ? 'ராஜேஷ்வர் சாஹு · உறுப்பினர் ID: GK-8921 (ராய்ப்பூர்)'
                    : lang === 'telugu'
                    ? 'రాజేశ్వర్ సాహు · సభ్యుని ID: GK-8921 (రాయ్‌పూర్)'
                    : lang === 'kannada'
                    ? 'ರಾಜೇಶ್ವರ್ ಸಾಹು · ಸದಸ್ಯ ID: GK-8921 (ರಾಯಪುರ)'
                    : lang === 'bengali'
                    ? 'রাজেশ্বর সাহু · সদস্য ID: GK-8921 (রায়পুর)'
                    : lang === 'marathi'
                    ? 'राजेश्वर साहू · सदस्य आयडी: GK-8921 (रायपूर)'
                    : 'राजेश्वर साहू · सदस्य ID: GK-8921 (रायपुर)'
                )}
              </p>
            </div>
          </div>

          {/* Controls: Language Dropdown with Icon & Return to Cockpit */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selection Dropdown with Language Icon */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15 cursor-pointer shadow-sm active:scale-95"
                aria-haspopup="listbox"
                aria-expanded={isLangDropdownOpen}
                aria-label="Select Language"
              >
                <Languages size={15} className="text-emerald-400" />
                <span className="font-medium tracking-wide">
                  {languageOptions.find((o) => o.id === lang)?.native || 'English'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-300 transition-transform duration-200 ${
                    isLangDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isLangDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-black/10 py-1.5 z-50 overflow-hidden"
                  style={{
                    boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.35)',
                  }}
                  role="listbox"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center gap-1.5">
                    <Languages size={12} className="text-emerald-600" />
                    <span>Language / भाषा</span>
                  </div>
                  {languageOptions.map((opt) => {
                    const isSelected = lang === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setLang(opt.id);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-950 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div>
                          <div className="font-semibold">{opt.native}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {opt.label} ({opt.sub})
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Back to Website button */}
            <button
              onClick={onBackToCockpit}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#0B2545] hover:bg-slate-100 transition-colors shadow cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Website</span>
              <span className="sm:hidden">Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATIONS */}
      {showSanctionDownloadToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-300" />
          <span>{t.downloading}</span>
        </div>
      )}

      {showPayToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B2545] text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>
            {lang === 'english'
              ? 'UPI payment link initialized: ₹1,500 (GPay / PhonePe / BHIM)'
              : 'UPI भुगतान लिंक तैयार है: ₹1,500 (GPay / PhonePe / BHIM)'}
          </span>
        </div>
      )}

      {/* 
        MAIN FARMER DASHBOARD CONTENT
      */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* 
          1. HERO SANCTION CELEBRATION CARD
        */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #0B2545 0%, #133863 50%, #0E4B5B 100%)',
          }}
        >
          {/* Topographic watermark overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 size={14} />
                <span>{t.loanSanctionedTag}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {loan ? (lang === 'chhattisgarhi' ? `जय जोहार, ${loan.applicant_name} जी!` : `Welcome, ${loan.applicant_name}!`) : t.welcome}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 font-medium">
                {loan?.dealership ? `Ready for delivery at ${loan.dealership}` : t.dealerReady} · <span className="text-emerald-300 font-semibold">{loan?.tractor_model || t.tractorModel}</span>
              </p>
            </div>

            {/* Sanction amount pill & download CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-300">
                  {t.sanctionedAmountLabel}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {loan?.sanctioned_amount_inr ? money(loan.sanctioned_amount_inr) : t.loanAmount}
                </div>
                <span className="text-[11px] text-emerald-300 font-medium">
                  {loan?.interest_rate_pct ? `${loan.interest_rate_pct}% Subsidized PSL Interest Rate` : t.subsidizedRate}
                </span>
              </div>
              <button
                onClick={handleDownloadSanction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <FileDown size={16} />
                <span>{t.downloadSanction}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 
          2. TWO-COLUMN GRID: SATELLITE CROP HEALTH & HARVEST EMI SCHEDULE
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SATELLITE CROP HEALTH (7 COLS) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Sprout size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {t.satelliteTitle}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {loan ? `Plot ${loan.khasra_no} · ${loan.village}, ${loan.district} (${loan.land_acres} Acres, ${loan.crop_type})` : t.khasraInfo}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {loan?.scorecard_breakdown?.satellite_ndvi_mean ? `${loan.scorecard_breakdown.satellite_ndvi_mean} - Healthy Green Canopy` : t.ndviScore}
                </span>
              </div>

              {/* Satellite telemetry visualization */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
                  <span>{t.ndviScaleLabel}</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {loan?.scorecard_breakdown?.satellite_ndvi_mean ?? '0.68'} / 1.00
                  </span>
                </div>

                {/* NDVI Color Scale Bar */}
                <div className="relative w-full h-4 rounded-full overflow-hidden bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 shadow-inner">
                  {/* Indicator marker */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow border-2 border-slate-900"
                    style={{ left: `${Math.min(Math.max((loan?.scorecard_breakdown?.satellite_ndvi_mean ?? 0.68) * 100, 5), 95)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{t.scaleLow}</span>
                  <span>{t.scaleMid}</span>
                  <span className="text-emerald-700 font-bold">{t.scaleHigh}</span>
                  <span>{t.scaleMax}</span>
                </div>
              </div>

              {/* Cloud Inpainting & Moisture badges */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                    <CloudRain size={14} className="text-blue-600" />
                    <span>{t.cloudGapTitle}</span>
                  </div>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                    {t.cloudGapDesc}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <Droplets size={14} className="text-amber-600" />
                    <span>{t.moistureTitle}</span>
                  </div>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                    {t.moistureDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{t.lastPass}</span>
              <span className="font-semibold text-emerald-700">{t.verifiedPlot}</span>
            </div>
          </motion.div>

          {/* HARVEST-ALIGNED EMI SCHEDULE (5 COLS) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.emiTitle}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.emiSubTitle}
                  </p>
                </div>
              </div>

              {/* Sowing vs Harvest Breakdown */}
              <div className="mt-5 space-y-3.5">
                {/* Sowing Period */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-950">
                        {t.sowingEmiLabel}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-800">
                      {loan?.repayment_structure?.sowing_lean_inr ? `${money(loan.repayment_structure.sowing_lean_inr)} / month` : t.sowingEmiVal}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-900">
                    {t.sowingEmiSub} · {t.sowingSubNote}
                  </p>
                </div>

                {/* Harvest Period */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-950">
                        {t.harvestEmiLabel}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-amber-900">
                      {loan?.repayment_structure?.harvest_bullet_inr ? `${money(loan.repayment_structure.harvest_bullet_inr)} Bullet Payment` : t.harvestEmiVal}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-900">
                    {t.harvestEmiSub} · {t.harvestSubNote}
                  </p>
                </div>
              </div>

              {/* Next due reminder */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">{t.nextDueLabel}</span>
                  <div className="font-bold text-slate-900">{loan?.repayment_structure?.next_due_date || t.nextDueDate}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">{t.amountLabel}</span>
                  <div className="font-bold text-emerald-700">
                    {loan?.repayment_structure?.sowing_lean_inr ? money(loan.repayment_structure.sowing_lean_inr) : '₹1,500'}
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div className="mt-5">
              <button
                onClick={() => {
                  setShowPayToast(true);
                  setTimeout(() => setShowPayToast(false), 3000);
                }}
                className="w-full py-3 rounded-xl bg-[#0B2545] hover:bg-[#133863] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <CreditCard size={16} />
                <span>{t.payNowBtn}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* 
          3. MANDI MSP PRICES & WEATHER AGRO-ADVISORY
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mandi Rates */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t.mandiTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.mandiSubtitle}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Paddy */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.paddyMsp}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {t.paddyPremium}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    {t.paddyPrice}
                  </div>
                  <span className="text-[10px] text-slate-400">{t.raipurMandi}</span>
                </div>
              </div>

              {/* Soyabean */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.soyabeanLabel}</div>
                  <div className="text-[11px] text-slate-500">{t.durgMandi}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    ₹4,950 / क्विंटल
                  </div>
                  <span className="text-[10px] text-slate-400">{t.mandiRateTag}</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              {t.expectedYield}
            </p>
          </motion.div>

          {/* Weather Advisory */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Sun size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t.weatherTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.weatherSubtitle}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs sm:text-sm text-sky-950 leading-relaxed font-medium">
              <p>{t.weatherForecast}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">{t.tempLabel}</span>
                <div className="font-bold text-slate-800 text-sm">29°C - 34°C</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">{t.pestLabel}</span>
                <div className="font-bold text-emerald-700 text-sm">{t.safeLabel}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 
          4. EMBEDDED FARMER VOICE HELPLINE COMPANION BANNER
        */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
          style={{
            backgroundColor: '#0B2545',
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <Volume2 size={14} />
                <span>{t.freeVoiceTag}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                {t.askSaathiTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {t.askSaathiSub}
              </p>
            </div>

            {/* Push to talk button */}
            <button
              onClick={() => triggerAssistantWithQuery('')}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <Mic size={20} className="animate-pulse" />
              <span>{t.tapToTalk}</span>
            </button>
          </div>

          {/* Quick Voice Questions Pills */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
            <div className="text-xs font-semibold text-slate-300 mb-3">
              {t.oneTapVoiceTitle}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[t.q1, t.q2, t.q3, t.q4].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerAssistantWithQuery(q)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left text-xs font-medium text-slate-100 transition-colors border border-white/10 flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="truncate">{q}</span>
                  <Volume2 size={14} className="text-emerald-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FarmerPortal;
