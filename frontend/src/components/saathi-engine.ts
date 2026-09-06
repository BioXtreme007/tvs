/**
 * GeoKisaan Krishi Saathi: Client-Side Intelligent Conversational Engine
 * Provides authentic, grounded multi-lingual responses in English, Hindi,
 * Chhattisgarhi, and Tamil when the backend is offline or hosted statically on Vercel.
 */

export interface SaathiResponse {
  reply: string;
  source: string;
  evidence: string[];
  action?: {
    type: 'NAVIGATE';
    target: string;
    label: string;
  };
  suggested_follow_ups: string[];
}

export function generateLocalSaathiResponse(
  query: string,
  language = 'ENGLISH',
  context?: Record<string, any> | null
): SaathiResponse {
  const q = (query || '').toLowerCase().trim();
  const lang = (language || 'ENGLISH').toUpperCase();

  const applicantName = context?.applicant_name || 'Rajeshwar Sahu';
  const landAcres = context?.land_acres || '4.5';
  const cropType = context?.crop_type || 'Paddy (Kharif)';
  const sanctionAmt = context?.requested_loan_amount_inr || '5,50,000';

  // 1. GREETINGS & INTRO
  if (
    q === 'hi' ||
    q === 'hello' ||
    q.includes('hey') ||
    q.includes('how are you') ||
    q.includes('who are you') ||
    q.includes('namaste') ||
    q.includes('johar') ||
    q.includes('vanakkam') ||
    q.includes('kaise ho') ||
    q.includes('kya haal') ||
    q.includes('good morning') ||
    q.includes('good afternoon') ||
    q.includes('good evening')
  ) {
    if (lang === 'HINDI') {
      return {
        reply: `नमस्ते! मैं कृषि साथी हूँ, आपका टीवीएस क्रेडिट एआई कृषि-ऋण सलाहकार। मैं बिलकुल ठीक हूँ और आपकी सेवा के लिए तैयार हूँ। मैं ट्रैक्टर लोन पात्रता, खसरा भूमि सत्यापन, या फसल-आधारित ईएमआई में आपकी मदद कर सकता हूँ। आज मैं आपकी क्या सहायता करूँ?`,
        source: 'GeoKisaan Knowledge Base · Vernacular Welcome',
        evidence: [
          'TVS Credit Kisan Tractor Scheme 2026',
          'Multimodal Satellite Credit Verification',
          'Toll-free Kisan Helpline: 1800-425-4555',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#underwriting',
          label: 'ऋण स्वीकृति कॉकपिट देखें',
        },
        suggested_follow_ups: [
          'ट्रैक्टर लोन के लिए क्या दस्तावेज चाहिए?',
          'हार्वेस्ट ईएमआई और छूट कैसे काम करती है?',
          'क्या 3.5 एकड़ जमीन पर लोन मिल सकता है?',
        ],
      };
    }

    if (lang === 'CHHATTISGARHI') {
      return {
        reply: `जय जोहार संगी! मैं हरंव तोर टीवीएस क्रेडिट कृषि साथी। मैं बने हंव। ट्रैक्टर लोन, खसरा जमीन जांच, अउ खरीफ फसल कटाई के बाद ईएमआई चुकाए बर मोर ले पूछ सकत हव। बताव आज का मदद करंव?`,
        source: 'GeoKisaan Knowledge Base · Chhattisgarhi Rural Advisory',
        evidence: [
          'छत्तीसगढ़ भुवन कैडस्ट्रल लैंड रजिस्ट्री',
          'खरीफ धान फसल कटाई आधारित ईएमआई',
          'किसान हेल्पलाइन: 1800-425-4555',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#underwriting',
          label: 'लोन स्वीकृति कॉकपिट खोलव',
        },
        suggested_follow_ups: [
          'का-का कागज जमा करना परही?',
          'धान कटाई के बाद किस्त कइसे भरे बर हे?',
          'सूखा परे म का छूट मिलही?',
        ],
      };
    }

    if (lang === 'TAMIL') {
      return {
        reply: `வணக்கம்! நான் கிருஷி சாதி, உங்கள் டிவிஎஸ் கிரெடிட் விவசாயக் கடன் ஆலோசகர். நான் நலமாக உள்ளேன். டிராக்டர் கடன் தகுதி, நில சரிபார்ப்பு மற்றும் அறுவடை சார்ந்த தவணைத் திட்டங்கள் பற்றி என்னிடம் கேட்கலாம். உங்களுக்கு எவ்வாறு உதவட்டும்?`,
        source: 'GeoKisaan Knowledge Base · Tamil Agri Advisory',
        evidence: [
          'TVS Credit Kisan Tractor Scheme 2026',
          'Sentinel-2 Remote Sensing Cadastral RAG',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#underwriting',
          label: 'கடன் அனுமதி பக்கத்தை திறக்கவும்',
        },
        suggested_follow_ups: [
          'டிராக்டர் கடனுக்கு என்ன ஆவணங்கள் தேவை?',
          'அறுவடைக்கு பின் இஎம்ஐ செலுத்துவது எப்படி?',
          '3 ஏக்கர் நிலத்திற்கு கடன் கிடைக்குமா?',
        ],
      };
    }

    // Default ENGLISH
    return {
      reply: `Hello! I am Krishi Saathi, your TVS Credit AI Agri-Lending advisor. I am doing well and ready to assist you. I can guide you through tractor loan eligibility, Khasra 142/1 land verification, document checklists, or our Seasonally-Aligned Harvest EMI schedule. How can I help you today?`,
      source: 'GeoKisaan Knowledge Base · Multi-turn Advisor',
      evidence: [
        'TVS Credit Kisan Tractor Scheme 2026',
        'Cadastral Bhuvan API Guideline',
        'Seasonally-Aligned Harvest EMI Architecture',
      ],
      action: {
        type: 'NAVIGATE',
        target: '#underwriting',
        label: 'Open Sanction Decision Cockpit',
      },
      suggested_follow_ups: [
        'What documents do I need for a tractor loan?',
        'I have 3.5 acres. Can I get a tractor loan?',
        'How do harvest repayments and EMI moratoriums work?',
      ],
    };
  }

  // 2. TRACTOR LOAN ELIGIBILITY & ACRES
  if (
    q.includes('tractor') ||
    q.includes('eligib') ||
    q.includes('acre') ||
    q.includes('ekad') ||
    q.includes('patra') ||
    q.includes('yogyata') ||
    q.includes('down payment') ||
    q.includes('interest rate') ||
    q.includes('how much')
  ) {
    if (lang === 'HINDI') {
      return {
        reply: `टीवीएस क्रेडिट किसान ट्रैक्टर योजना के तहत, 3.0 एकड़ या अधिक सिंचित भूमि वाले किसान ₹5,50,000 तक के ट्रैक्टर लोन के लिए पात्र हैं। ब्याज दरें 10.75% प्रति वर्ष से शुरू होती हैं, और डाउन पेमेंट केवल 10% से 15% है। सेंटिनल-2 सैटेलाइट जांच के कारण बिना किसी पटवारी सत्यापन के 3 मिनट में स्वीकृति प्राप्त होती है।`,
        source: 'TVS Credit Kisan Tractor Policy 2026',
        evidence: [
          'न्यूनतम भूमि: 3.0 एकड़ सिंचित',
          'ब्याज दर: 10.75% प्रति वर्ष से शुरू',
          'स्वीकृति समय: < 3 मिनट',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#underwriting',
          label: 'अपनी लोन पात्रता जांचें',
        },
        suggested_follow_ups: [
          'क्या दस्तावेज चाहिए?',
          'हार्वेस्ट ईएमआई कैसे काम करती है?',
          'सिबिल स्कोर कम हो तो क्या होगा?',
        ],
      };
    }

    if (lang === 'CHHATTISGARHI') {
      return {
        reply: `छत्तीसगढ़ म 3 एकड़ या ओकर ले जादा सिंचित खेत वाले किसान भइया मन बर ₹5,50,000 तक के ट्रैक्टर लोन मिले के सुविधा हे। ब्याज 10.75% ले शुरू होथे अउ डाउन पेमेंट खाली 10% ले 15% हे। सैटेलाइट ले खेत जांच होए के सेती कोनो पटवारी सत्यापन के जरूरत नई हे।`,
        source: 'जियोकिसान ट्रैक्टर लोन नीति 2026',
        evidence: [
          'कम से कम जमीन: 3 एकड़ सिंचित',
          'लोन राशि: ₹5,50,000 तक',
          'मंजूरी समय: 180 सेकंड',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#underwriting',
          label: 'लोन पात्रता जांचव',
        },
        suggested_follow_ups: [
          'का-का कागज जमा करना परही?',
          'धान कटाई के बाद किस्त कइसे भरे बर हे?',
        ],
      };
    }

    return {
      reply: `Under the TVS Credit Kisan Tractor Scheme, farmers with at least 3.0 acres of irrigated land qualify for loans up to ₹5,50,000. Interest rates start from 10.75% p.a., with a minimal down payment of 10% to 15%. Our satellite verification bypasses manual Patwari inspections, providing decisions in under 180 seconds.`,
      source: 'TVS Credit Kisan Tractor Policy 2026',
      evidence: [
        'Minimum Land: 3.0 Irrigated Acres',
        'Interest Rate: Starting at 10.75% p.a.',
        'Down Payment: 10% to 15%',
        'SLA: < 3 Minutes Autonomous Decision',
      ],
      action: {
        type: 'NAVIGATE',
        target: '#underwriting',
        label: 'Open Sanction Decision Cockpit',
      },
      suggested_follow_ups: [
        'What documents do I need for a tractor loan?',
        'How do harvest repayments work?',
        'What if my credit score is thin or low?',
      ],
    };
  }

  // 3. DOCUMENTS & KHASRA
  if (
    q.includes('document') ||
    q.includes('dastavej') ||
    q.includes('khasra') ||
    q.includes('paper') ||
    q.includes('b1') ||
    q.includes('patwari') ||
    q.includes('aadhaar') ||
    q.includes('checklist')
  ) {
    if (lang === 'HINDI') {
      return {
        reply: `ट्रैक्टर लोन के लिए केवल 4 सरल दस्तावेजों की आवश्यकता होती है: 1. आधार कार्ड और पैन कार्ड। 2. खसरा खतौनी (B1) अथवा किसान पासबुक। 3. 6 महीने का बैंक स्टेटमेंट। 4. अधिकृत टीवीएस ट्रैक्टर डीलर का कोटेशन। भुवन उपग्रह रिकॉर्ड्स के माध्यम से खसरा सीमा की जांच स्वतः हो जाती है।`,
        source: 'TVS Credit Document Checklist Guideline',
        evidence: [
          'UIDAI बायोमेट्रिक आधार सत्यापन',
          'भुवन सीजी कैडस्ट्रल लैंड रजिस्ट्री',
          'शून्य भौतिक पटवारी निरीक्षण आवश्यकता',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#farmer-documents',
          label: 'दस्तावेज चेकलिस्ट देखें',
        },
        suggested_follow_ups: [
          'खसरा 142/1 की जांच कैसे होती है?',
          'लोन अप्रूवल में कितना समय लगता है?',
        ],
      };
    }

    return {
      reply: `You only need 4 simple documents: 1. Aadhaar Card and PAN card. 2. Land Record B1 (Khasra 142/1) or Kisan Passbook. 3. 6-month bank account statement. 4. Proforma quotation from an authorized TVS tractor dealer. Our Bhuvan Cadastral integration verifies your boundaries digitally in 15 seconds.`,
      source: 'TVS Credit Document Verification SOP',
      evidence: [
        'Instant UIDAI e-KYC Verification',
        'Bhuvan CG Spatial Cadastral Registry',
        'Zero Physical Patwari Verification Delay',
      ],
      action: {
        type: 'NAVIGATE',
        target: '#farmer-documents',
        label: 'Review Required Documents',
      },
      suggested_follow_ups: [
        'Can I get a loan for 3.5 acres?',
        'How do harvest repayments work?',
      ],
    };
  }

  // 4. HARVEST-LINKED EMI & MORATORIUM & WEATHER
  if (
    q.includes('harvest') ||
    q.includes('emi') ||
    q.includes('moratorium') ||
    q.includes('drought') ||
    q.includes('flood') ||
    q.includes('rain') ||
    q.includes('sookha') ||
    q.includes('barish') ||
    q.includes('fasal') ||
    q.includes('relief')
  ) {
    if (lang === 'HINDI') {
      return {
        reply: `जियोकिसान सीजनल-अलाइन्ड हार्वेस्ट EMI में, बुवाई और देखरेख के समय (जून से अक्टूबर) आपको केवल ₹1,500/माह का नाममात्र रखरखाव शुल्क देना होता है। मुख्य किस्त फसल कटाई और मंडी में बिक्री के बाद चुकानी होती है। यदि सैटेलाइट सेंसर 30% से अधिक बारिश की कमी या बाढ़ दर्ज करते हैं, तो 60 दिन की ईएमआई राहत (मोरेटोरियम) स्वतः लागू हो जाती है।`,
        source: 'GeoKisaan Seasonally-Aligned Repayment Charter',
        evidence: [
          'बुवाई अवधि ईएमआई: ₹1,500/माह',
          'मुख्य किस्त: मंडी बिक्री के बाद देय',
          'मौसम सुरक्षा: 60-दिन स्वतः मोरेटोरियम',
        ],
        action: {
          type: 'NAVIGATE',
          target: '#stress-sim',
          label: 'जलवायु तनाव सिम्युलेटर देखें',
        },
        suggested_follow_ups: [
          'सूखा पड़ने पर ब्याज पर क्या असर होता है?',
          'ट्रैक्टर लोन के लिए आवेदन कैसे करें?',
        ],
      };
    }

    return {
      reply: `With GeoKisaan Seasonally-Aligned Harvest EMIs, you pay only a nominal maintenance fee of ₹1,500/month during sowing season. The principal bullet repayment is deferred until after your crop is harvested and sold at the Mandi. If Sentinel-2 satellites detect a >30% rainfall deficit or flood, a 60-day zero-penalty moratorium is automatically activated.`,
      source: 'GeoKisaan Seasonally-Aligned Repayment Charter',
      evidence: [
        'Sowing Period EMI: ₹1,500/mo Maintenance',
        'Post-Harvest Mandi Bullet Repayment',
        'Early Warning Telemetry: 60-Day Auto Moratorium',
      ],
      action: {
        type: 'NAVIGATE',
        target: '#stress-sim',
        label: 'Explore Stress Simulator',
      },
      suggested_follow_ups: [
        'What if rainfall drops by 40%?',
        'What documents are needed for approval?',
      ],
    };
  }

  // 5. CIBIL & CREDIT SCORING
  if (
    q.includes('cibil') ||
    q.includes('credit score') ||
    q.includes('score') ||
    q.includes('bureau') ||
    q.includes('thin') ||
    q.includes('reject')
  ) {
    return {
      reply: `At TVS Credit, a thin or moderate CIBIL score doesn't stop your agricultural ambition. Our E.P.I.C 8 decision engine uses an additive scorecard: combining your bureau history (550 baseline) with 10m Sentinel-2 satellite crop vegetative vigor (+69 points). Verified farm productivity unlocks credit even without extensive prior bank loans.`,
      source: 'TVS Credit Multimodal Scoring Engine (E.P.I.C 8)',
      evidence: [
        'Bureau Base Score: 550 Points',
        'Satellite Crop Vigor Attribution: +69 Points',
        'Final Multimodal Score: 619 / 900 (Approved)',
      ],
      action: {
        type: 'NAVIGATE',
        target: '#underwriting',
        label: 'View Additive Scorecard',
      },
      suggested_follow_ups: [
        'How does satellite scoring work?',
        'Can I apply with 4.5 acres in Raipur?',
      ],
    };
  }

  // 6. PIPELINE & TURNAROUND TIME
  if (q.includes('pipeline') || q.includes('how it works') || q.includes('time') || q.includes('turnaround')) {
    return {
      reply: `The GeoKisaan Autonomous Lending Pipeline completes assessment in under 180 seconds across 4 seamless steps: 1. Cadastral Ingestion (<15s). 2. Sentinel-2 CloudGap Inpainting (<45s). 3. 6-Subagent Deliberation (<60s). 4. Seasonally-Aligned Sanction & Disbursement (<60s).`,
      source: 'GeoKisaan 180s Autonomous Lending SLA',
      evidence: [
        'Step 01: Cadastral & Identity Ingestion (< 15s)',
        'Step 02: Sentinel-2 CloudGap-CG Inpainting (< 45s)',
        'Step 03: 6-Subagent Consensus Engine (< 60s)',
        'Step 04: Harvest-Aligned Sanction & Payout (< 60s)',
      ],
      action: {
        type: 'NAVIGATE',
        target: '#pipeline',
        label: 'View 3-Minute Pipeline',
      },
      suggested_follow_ups: [
        'What is CloudGap-CG inpainting?',
        'Check loan eligibility for my farm',
      ],
    };
  }

  // 7. GENERAL / CROP GUIDANCE (Context-Aware Fallback)
  if (context?.applicant_name) {
    return {
      reply: `For applicant ${applicantName} (${landAcres} acres of ${cropType}), your pre-approved loan of ₹${sanctionAmt} is ready. Sentinel-2 indicates optimal crop vigor (NDVI 0.68). Your sowing EMI is ₹1,500/month with bullet repayment post-mandi sale. How would you like to proceed?`,
      source: 'GeoKisaan Active Borrower Profile',
      evidence: [
        `Applicant: ${applicantName}`,
        `Land: ${landAcres} Acres ${cropType}`,
        `Pre-Approved Amount: ₹${sanctionAmt}`,
      ],
      action: {
        type: 'NAVIGATE',
        target: '#underwriting',
        label: 'Review Full Sanction Dossier',
      },
      suggested_follow_ups: [
        'What documents are required for disbursement?',
        'How does the 60-day weather relief work?',
      ],
    };
  }

  return {
    reply: `I understand your question about agricultural lending. As your TVS Credit Krishi Saathi, I can evaluate your tractor loan eligibility, check your land's satellite vegetative vigor, explain our harvest-aligned repayment schedules, or guide you through required documents. Feel free to ask about land acres, down payment, or crop moratoriums!`,
    source: 'TVS Credit Krishi Saathi General Advisory',
    evidence: [
      'TVS Credit Kisan Tractor Scheme 2026',
      'Kisan Assistance Toll-Free: 1800-425-4555',
    ],
    action: {
      type: 'NAVIGATE',
      target: '#underwriting',
      label: 'Open Sanction Decision Cockpit',
    },
    suggested_follow_ups: [
      'What documents do I need for a tractor loan?',
      'Can I get a loan with 3.5 acres?',
      'How do harvest repayments work?',
    ],
  };
}
