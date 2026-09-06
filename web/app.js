/**
 * GeoKisaan AI-Powered Smart Lending Decision Hub - Web Frontend Logic
 */

// Tab Navigation
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    tab.classList.add('active');
    const targetId = tab.getAttribute('data-tab');
    document.getElementById(targetId).classList.add('active');
  });
});

// Underwriting Simulation State
let currentUnderwritingData = {
  applicant_name: "Rajeshwar Sahu",
  district: "Raipur",
  crop_type: "PADDY_KHARIF",
  land_acres: 4.5,
  requested_loan_amount_inr: 550000,
  bureau_cibil_score: 690,
  agri_credit_score: 735,
  tier: "GOOD",
  underwriting_decision: "FAST_TRACK_APPROVE",
  recommended_product: "GeoKisaan New Tractor Loan",
  sanctioned_amount_inr: 550000,
  risk_adjusted_roi_pct: 10.5,
  satellite_ndvi: 0.68,
  soc_risk: 0.32,
  estimated_yield_tha: 4.1,
  land_collateral_value_inr: 2350000,
  p50_default_pct: 3.8,
  bhuvan_verified: true,
  cloudgap_inpainting_tier: "STDIP_NEURAL_RECONSTRUCTED"
};

// Render Scorecard Function
function renderUnderwritingResults(data) {
  currentUnderwritingData = { ...currentUnderwritingData, ...data };
  
  // Update Score Meter
  const scoreVal = document.getElementById('scoreValue');
  const tierBadge = document.getElementById('tierBadge');
  const decisionText = document.getElementById('decisionText');
  
  if (scoreVal) scoreVal.innerText = data.agri_credit_score || 735;
  
  const tier = data.tier || "GOOD";
  if (tierBadge) {
    tierBadge.className = `score-tier-badge tier-${tier.toLowerCase().replace('_', '-')}`;
    tierBadge.innerText = tier.replace('_', ' ');
  }
  
  if (decisionText) {
    decisionText.innerText = (data.underwriting_decision || "FAST_TRACK_APPROVE").replace(/_/g, ' ');
  }

  // Update Summary Badges
  document.getElementById('resProduct').innerText = data.recommended_product || "GeoKisaan New Tractor Loan";
  document.getElementById('resAmount').innerText = `₹${(data.sanctioned_amount_inr || 550000).toLocaleString()}`;
  document.getElementById('resROI').innerText = `${data.risk_adjusted_roi_pct || 10.5}% p.a.`;
  document.getElementById('resNDVI').innerText = (data.satellite_ndvi || 0.68).toFixed(2);
  document.getElementById('resYield').innerText = `${data.estimated_yield_tha || 4.1} t/ha`;
  document.getElementById('resCollateral').innerText = `₹${(data.land_collateral_value_inr || 2350000).toLocaleString()}`;
  document.getElementById('resPD').innerText = `${(data.p50_default_pct || 3.8)}%`;
}

// Handle Form Submit
document.getElementById('loanAppForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const applicant = document.getElementById('applicantName').value;
  const district = document.getElementById('districtSelect').value;
  const acres = parseFloat(document.getElementById('landAcres').value);
  const loanAmt = parseFloat(document.getElementById('loanAmount').value);
  const cibil = parseInt(document.getElementById('cibilScore').value) || 0;
  const crop = document.getElementById('cropType').value;
  const clouds = parseFloat(document.getElementById('cloudCover').value);

  // Compute live client score or call API if available
  let score = 550;
  if (cibil > 700) score += 90;
  else if (cibil > 600) score += 40;
  else score -= 20;

  if (acres >= 4.0) score += 55;
  if (loanAmt <= acres * 200000) score += 40;
  
  let ndvi = 0.65;
  if (clouds > 40) ndvi = 0.69; // CloudGap Inpainted
  score = Math.min(880, Math.max(420, score));

  let tier = "GOOD";
  let decision = "FAST_TRACK_APPROVE";
  let roi = 11.0;
  if (score >= 750) { tier = "PRIME"; decision = "AUTO_APPROVE"; roi = 9.8; }
  else if (score < 600) { tier = "MODERATE"; decision = "MANUAL_UNDERWRITE"; roi = 13.0; }

  const result = {
    applicant_name: applicant,
    district: district,
    land_acres: acres,
    requested_loan_amount_inr: loanAmt,
    bureau_cibil_score: cibil,
    agri_credit_score: score,
    tier: tier,
    underwriting_decision: decision,
    recommended_product: acres >= 3.0 ? "GeoKisaan New Tractor Loan" : "GeoKisaan Kisan Rural Two-Wheeler Loan",
    sanctioned_amount_inr: loanAmt,
    risk_adjusted_roi_pct: roi,
    satellite_ndvi: ndvi,
    estimated_yield_tha: crop === "PADDY_KHARIF" ? 4.1 : 3.8,
    land_collateral_value_inr: Math.round(acres * 520000),
    p50_default_pct: (12.0 - (score - 300) * 0.015).toFixed(1),
  };

  renderUnderwritingResults(result);
  alert(`✓ Loan Application for ${applicant} Underwritten Successfully! Score: ${score}/900 (${decision})`);
});

// What-If Simulation Sliders
function updateWhatIf() {
  const rain = parseFloat(document.getElementById('sliderRain').value);
  const temp = parseFloat(document.getElementById('sliderTemp').value);
  const price = parseFloat(document.getElementById('sliderPrice').value);

  document.getElementById('valRain').innerText = `${rain > 0 ? '+' : ''}${rain}%`;
  document.getElementById('valTemp').innerText = `+${temp}°C`;
  document.getElementById('valPrice').innerText = `${price > 0 ? '+' : ''}${price}%`;

  const baseGnpa = 2.45;
  const droughtPen = Math.max(0, -rain) * 0.08;
  const heatPen = temp * 0.45;
  const pricePen = Math.max(0, -price) * 0.05;

  const stressedGnpa = (baseGnpa + droughtPen + heatPen + pricePen).toFixed(2);
  const portfolioCr = 1250.0;
  const stressedCr = ((portfolioCr * stressedGnpa) / 100).toFixed(1);
  const baseCr = ((portfolioCr * baseGnpa) / 100).toFixed(1);
  const incCr = (stressedCr - baseCr).toFixed(1);
  const savedCr = (incCr * 0.65).toFixed(1);

  document.getElementById('resStressedGnpa').innerText = `${stressedGnpa}%`;
  document.getElementById('resStressedCr').innerText = `₹${stressedCr} Cr`;
  document.getElementById('resIncCr').innerText = `+₹${incCr} Cr`;
  document.getElementById('resSavedCr').innerText = `₹${savedCr} Cr`;
}

document.getElementById('sliderRain')?.addEventListener('input', updateWhatIf);
document.getElementById('sliderTemp')?.addEventListener('input', updateWhatIf);
document.getElementById('sliderPrice')?.addEventListener('input', updateWhatIf);

// Krishi Saathi Chatbot
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const msgContainer = document.getElementById('chatMessages');
  const lang = document.getElementById('chatLanguage').value;
  
  // Append user bubble
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-bubble bubble-user';
  userDiv.innerText = msg;
  msgContainer.appendChild(userDiv);
  input.value = '';

  // Append Thinking / Typing Bubble
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-bubble bubble-assistant';
  typingDiv.id = 'tempTypingBubble';
  typingDiv.innerHTML = `<em>GeoKisaan Krishi Saathi is reasoning...</em>`;
  msgContainer.appendChild(typingDiv);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  window.krishiSaathiSessionId = window.krishiSaathiSessionId || ('sess_' + Math.random().toString(36).substring(2, 9));

  // Real Dynamic RAG Call to Backend with Multi-Turn Conversational Memory
  fetch('/api/v1/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: msg,
      language: lang,
      borrower_context: currentUnderwritingData,
      session_id: window.krishiSaathiSessionId
    })
  })
  .then(res => res.json())
  .then(data => {
    typingDiv.remove();
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-bubble bubble-assistant';
    const sourceTag = data.source ? `<div style="font-size: 0.7rem; color: #10b981; margin-top: 0.35rem;">✓ Grounded via ${data.source}</div>` : '';
    botDiv.innerHTML = `<strong>TVS Krishi Saathi:</strong><br>${data.response || data.assistant_response}${sourceTag}`;
    msgContainer.appendChild(botDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Speak response if voice was active
    if (window.lastVoiceTriggered) {
      speakVernacularText(data.response || data.assistant_response, lang);
      window.lastVoiceTriggered = false;
    }
  })
  .catch(err => {
    typingDiv.remove();
    console.warn("Backend chat fetch error, using local vernacular fallback:", err);
    // Graceful fallback
    const fallbackText = lang === "HINDI"
      ? `TVS कृषि साथी: आपके आवेदन (${currentUnderwritingData.applicant_name}) के लिए ₹${currentUnderwritingData.sanctioned_amount_inr.toLocaleString()} का ऋण स्वीकृत है (स्कोर: ${currentUnderwritingData.agri_credit_score})।`
      : `TVS Krishi Saathi: Your loan for ${currentUnderwritingData.applicant_name} is approved up to ₹${currentUnderwritingData.sanctioned_amount_inr.toLocaleString()} (Score: ${currentUnderwritingData.agri_credit_score}).`;
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-bubble bubble-assistant';
    botDiv.innerHTML = `<strong>TVS Krishi Saathi:</strong><br>${fallbackText}`;
    msgContainer.appendChild(botDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  });
}

// Vernacular Speech Synthesis
function speakVernacularText(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, ''));
  const localeMap = { "ENGLISH": "en-IN", "HINDI": "hi-IN", "CHHATTISGARHI": "hi-IN", "TAMIL": "ta-IN" };
  utterance.lang = localeMap[lang] || "hi-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

// Vernacular Voice Recognition (STT)
let recognition = null;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function() {
    const micBtn = document.getElementById('voiceMicBtn');
    const strip = document.getElementById('voiceStatusStrip');
    if (micBtn) micBtn.classList.add('recording');
    if (strip) strip.style.display = 'flex';
  };

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chatInput');
    if (input) input.value = transcript;
    window.lastVoiceTriggered = true;
    sendChatMessage();
  };

  recognition.onerror = function(event) {
    console.warn("Speech recognition error:", event.error);
    const strip = document.getElementById('voiceStatusStrip');
    if (strip) strip.style.display = 'none';
    const micBtn = document.getElementById('voiceMicBtn');
    if (micBtn) micBtn.classList.remove('recording');
  };

  recognition.onend = function() {
    const micBtn = document.getElementById('voiceMicBtn');
    const strip = document.getElementById('voiceStatusStrip');
    if (micBtn) micBtn.classList.remove('recording');
    if (strip) strip.style.display = 'none';
  };
}

document.getElementById('voiceMicBtn')?.addEventListener('click', function() {
  const lang = document.getElementById('chatLanguage').value;
  if (!recognition) {
    alert("Speech recognition is not supported natively in this browser window. Please type your query or use Google Chrome/Edge.");
    return;
  }
  const localeMap = { "ENGLISH": "en-IN", "HINDI": "hi-IN", "CHHATTISGARHI": "hi-IN", "TAMIL": "ta-IN" };
  recognition.lang = localeMap[lang] || "hi-IN";
  recognition.start();
});

document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
document.getElementById('chatInput')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendChatMessage();
});

// Quick question chip clicks
document.querySelectorAll('.chip-btn').forEach(chip => {
  chip.addEventListener('click', function() {
    document.getElementById('chatInput').value = this.innerText;
    sendChatMessage();
  });
});

