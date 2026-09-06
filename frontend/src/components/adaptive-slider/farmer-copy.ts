export type FarmerLanguage = "hi" | "hne" | "ta" | "en";
interface Copy {
  title: string;
  subtitle: string;
  language: string;
  weather: string;
  presets: [string, string, string];
  states: [string, string, string];
  listen: string;
  stop: string;
  voice: string;
  simulation: string;
  headings: [string, string, string];
  health: [string, string, string];
  payment: [string, string, string];
  advice: [string, string, string];
  relief: string;
  query: string;
  unavailable: string;
}
export const farmerCopy: Record<FarmerLanguage, Copy> = {
  hi: {
    title: "फसल व क़िस्त सुरक्षा सिम्युलेटर",
    subtitle: "देखें मौसम बदलने पर आपकी फसल और क़िस्त पर क्या असर होगा",
    language: "भाषा",
    weather: "आपके खेत में बारिश",
    presets: ["कम बारिश (सूखा)", "सामान्य मानसून", "भारी बारिश (बाढ़)"],
    states: ["सूखा", "सामान्य बारिश", "अतिवृष्टि / बाढ़"],
    listen: "सुनें",
    stop: "रोकें",
    voice: "बोलकर पूछें",
    simulation:
      "यह एक उदाहरण है। इससे आपकी असली क़िस्त नहीं बदलती। राहत की पुष्टि टीवीएस क्रेडिट से करें।",
    headings: ["फसल की स्थिति", "आपकी क़िस्त", "आज क्या करें?"],
    health: [
      "फसल को पानी की कमी — इस उदाहरण में 30% से 40% पैदावार प्रभावित होने का जोखिम।",
      "बढ़िया पैदावार — इस उदाहरण में 90% से अधिक अच्छी फसल की उम्मीद।",
      "खेत में जलभराव — धान की जड़ों में पानी भरने का ख़तरा।",
    ],
    payment: [
      "इस उदाहरण में सैटेलाइट से सूखा मिलने पर क़िस्त 60 दिन आगे बढ़ेगी, बिना पेनल्टी। असली राहत की पुष्टि ज़रूरी है।",
      "सामान्य क़िस्त — फसल कटाई के बाद तय समय पर आसान भुगतान।",
      "इस उदाहरण में सैटेलाइट से बाढ़ मिलने पर क़िस्त 60 दिन आगे बढ़ेगी, बिना पेनल्टी। असली राहत की पुष्टि ज़रूरी है।",
    ],
    advice: [
      "कम पानी वाली धान की किस्म (MTU 1010) और ड्रिप सिंचाई की उपयुक्तता स्थानीय कृषि सलाहकार से पूछें।",
      "मिट्टी की जाँच और स्थानीय सलाह के अनुसार समय पर यूरिया/डीएपी दें।",
      "पानी निकासी की नाली बनाएँ; मेड़ काटने से पहले सुरक्षित निकासी की स्थानीय सलाह लें।",
    ],
    relief: "60 दिन क़िस्त राहत (मुफ़्त) · उदाहरण",
    query: "इस मौसम में मेरी फसल और क़िस्त का क्या होगा?",
    unavailable:
      "आवाज़ उपलब्ध नहीं है। नीचे लिखी सलाह पढ़ें या कृषि साथी से पूछें।",
  },
  hne: {
    title: "फसल अउ किश्त सुरक्षा सिम्युलेटर",
    subtitle: "देखव मौसम बदले ले तुंहर फसल अउ किश्त म का असर होही",
    language: "भाखा",
    weather: "तुंहर खेत म पानी",
    presets: ["कम पानी (सूखा)", "बनेच पानी (सामान्य)", "भारी झड़ी (बाढ़)"],
    states: ["सूखा", "बनेच पानी", "भारी झड़ी / बाढ़"],
    listen: "सुनव",
    stop: "रोकव",
    voice: "गोठिया के पूछव",
    simulation:
      "ये सिरिफ उदाहरण आय। एखर ले असली किश्त नई बदलय। राहत बर टीवीएस क्रेडिट ले पुष्टि करव।",
    headings: ["फसल के हाल", "तुंहर किश्त", "आज का करव?"],
    health: [
      "फसल ला पानी के कमी — ये उदाहरण म 30% ले 40% उपज के नुकसान के डर हे।",
      "बढ़िया उपज — ये उदाहरण म 90% ले जादा बने फसल के आस हे।",
      "खेत म पानी भर गे — धान के जड़ ला नुकसान के डर हे।",
    ],
    payment: [
      "ये उदाहरण म सैटेलाइट ले सूखा दिखे पर किश्त 60 दिन आगे होही, बिना जुर्माना। असली राहत के पुष्टि करव।",
      "सामान्य किश्त — कटाई के बाद तय बखत म भुगतान करव।",
      "ये उदाहरण म सैटेलाइट ले बाढ़ दिखे पर किश्त 60 दिन आगे होही, बिना जुर्माना। असली राहत के पुष्टि करव।",
    ],
    advice: [
      "कम पानी वाला धान MTU 1010 अउ ड्रिप सिंचाई बर स्थानीय कृषि सलाहकार ले पूछव।",
      "माटी जाँच अउ स्थानीय सलाह के हिसाब ले यूरिया/डीएपी देवव।",
      "पानी निकासी के नाली बनावव; मेड़ काटे के पहिली सुरक्षित निकासी बर सलाह लेवव।",
    ],
    relief: "60 दिन किश्त म छूट · उदाहरण",
    query: "अइसन मौसम म मोर फसल अउ किश्त के का होही?",
    unavailable: "आवाज नई मिलत हे। लिखे सलाह पढ़व या कृषि साथी ले पूछव।",
  },
  ta: {
    title: "பயிர் மற்றும் கடன் தவணை பாதுகாப்பு",
    subtitle: "வானிலை மாறினால் உங்கள் பயிர் மற்றும் தவணைக்கு என்ன நடக்கும்",
    language: "மொழி",
    weather: "உங்கள் வயலில் மழை",
    presets: ["குறைவான மழை (வறட்சி)", "இயல்பான மழை", "அதிக மழை (வெள்ளம்)"],
    states: ["வறட்சி", "இயல்பான மழை", "வெள்ளம்"],
    listen: "கேளுங்கள்",
    stop: "நிறுத்து",
    voice: "பேசி கேளுங்கள்",
    simulation:
      "இது ஒரு எடுத்துக்காட்டு. உங்கள் உண்மையான தவணை மாறாது. நிவாரணத்தை TVS Credit உடன் உறுதிப்படுத்தவும்.",
    headings: ["பயிரின் நிலை", "உங்கள் தவணை", "இன்று என்ன செய்யலாம்?"],
    health: [
      "பயிருக்கு தண்ணீர் பற்றாக்குறை — இந்த எடுத்துக்காட்டில் 30% முதல் 40% வரை விளைச்சல் பாதிக்கப்படும் அபாயம்.",
      "நல்ல விளைச்சல் — இந்த எடுத்துக்காட்டில் 90% க்கும் அதிகமான நல்ல பயிர் எதிர்பார்ப்பு.",
      "வயலில் நீர் தேக்கம் — நெல் வேர்கள் பாதிக்கப்படும் அபாயம்.",
    ],
    payment: [
      "இந்த எடுத்துக்காட்டில் செயற்கைக்கோள் வறட்சியை கண்டறிந்தால் அபராதமின்றி 60 நாட்கள் தவணை ஒத்திவைப்பு. உண்மையான நிவாரணத்தை உறுதிப்படுத்தவும்.",
      "இயல்பான தவணை — அறுவடைக்குப் பிறகு ஒப்புக்கொண்ட நேரத்தில் செலுத்தவும்.",
      "இந்த எடுத்துக்காட்டில் செயற்கைக்கோள் வெள்ளத்தை கண்டறிந்தால் அபராதமின்றி 60 நாட்கள் தவணை ஒத்திவைப்பு. உண்மையான நிவாரணத்தை உறுதிப்படுத்தவும்.",
    ],
    advice: [
      "குறைந்த நீர் தேவைப்படும் MTU 1010 நெல் மற்றும் சொட்டு நீர்ப்பாசனம் பற்றி உள்ளூர் வேளாண் ஆலோசகரிடம் கேளுங்கள்.",
      "மண் பரிசோதனை மற்றும் உள்ளூர் ஆலோசனைப்படி யூரியா/டிஏபி இடவும்.",
      "வடிகால் அமைக்கவும்; வரப்பை வெட்டும் முன் பாதுகாப்பான வடிகால் பற்றி உள்ளூர் ஆலோசனை பெறவும்.",
    ],
    relief: "60 நாட்கள் தவணை நிவாரணம் · எடுத்துக்காட்டு",
    query: "இந்த வானிலையில் என் பயிர் மற்றும் தவணைக்கு என்ன நடக்கும்?",
    unavailable:
      "குரல் கிடைக்கவில்லை. கீழே உள்ள ஆலோசனையைப் படிக்கவும் அல்லது கிருஷி சாத்தியிடம் கேளுங்கள்.",
  },
  en: {
    title: "Weather & Loan Safety Simulator",
    subtitle: "See how changing weather could affect your crop and repayment.",
    language: "Language",
    weather: "Rainfall on your farm",
    presets: ["Low rain (drought)", "Normal monsoon", "Heavy rain (flood)"],
    states: ["Drought", "Normal rain", "Flood"],
    listen: "Listen",
    stop: "Stop",
    voice: "Ask with voice",
    simulation:
      "This is a simulation. Your actual repayment date stays the same. Confirm relief with TVS Credit.",
    headings: ["Crop health", "Your repayment", "What to do today"],
    health: [
      "Your crop needs water. In this example, 30–40% of the harvest could be affected.",
      "A healthy harvest. This example anticipates more than 90% good crop performance.",
      "Standing water in the field may damage paddy roots.",
    ],
    payment: [
      "In this example, satellite-confirmed drought triggers a 60-day repayment extension without penalties. Actual relief needs confirmation.",
      "Normal repayment — pay on the agreed schedule after harvest.",
      "In this example, satellite-confirmed flooding triggers a 60-day repayment extension without penalties. Actual relief needs confirmation.",
    ],
    advice: [
      "Ask a local agronomist whether lower-water paddy MTU 1010 and drip irrigation suit your field.",
      "Apply urea/DAP on time, guided by soil tests and local advice.",
      "Arrange drainage. Seek local guidance on safe water discharge before opening field bunds.",
    ],
    relief: "60-day free repayment relief · simulation",
    query: "What happens to my crop and repayment in this weather?",
    unavailable:
      "Audio is unavailable. Read the advice below or ask Krishi Saathi.",
  },
};
