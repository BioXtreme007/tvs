function computeScore(body) {
  const bureau = body.bureau_cibil_score ? Number(body.bureau_cibil_score) : 650;
  const land = Math.min(Number(body.land_acres) || 4, 20);
  const turnover = Number(body.annual_banking_turnover_inr) || 400000;
  const amount = Number(body.requested_loan_amount_inr) || 500000;

  // Weighted score simulation (mirrors the real scorecard logic)
  const bureauPts = Math.round(((bureau - 300) / 600) * 40 * 9); // 40% weight, 0-360 pts
  const vigorPts = Math.round((Math.min(land, 10) / 10) * 30 * 9); // 30% weight
  const climatePts = body.crop_type === 'PADDY_KHARIF' ? 148 : body.crop_type === 'WHEAT_RABI' ? 162 : 135;
  const landPts = Math.round((Math.min(land, 15) / 15) * 10 * 9); // 10% weight

  const raw = bureauPts + vigorPts + climatePts + landPts;
  const agri_credit_score = Math.min(900, Math.max(300, Math.round(300 + raw)));

  const ltv = amount / (land * 85000); // approx land value
  const affordability = turnover / (amount / 36);

  let decision, tier, sanctioned_amount_inr, risk_adjusted_roi_pct;

  if (agri_credit_score >= 750 && ltv < 0.75 && affordability > 1.8) {
    decision = 'APPROVED';
    tier = 'TIER_1_PRIME_AGRO';
    sanctioned_amount_inr = amount;
    risk_adjusted_roi_pct = 10.25;
  } else if (agri_credit_score >= 620) {
    decision = 'CONDITIONAL_APPROVAL';
    tier = 'TIER_2_STANDARD_AGRO';
    sanctioned_amount_inr = Math.round(amount * 0.80);
    risk_adjusted_roi_pct = 12.75;
  } else {
    decision = 'MANUAL_REVIEW_REQUIRED';
    tier = 'TIER_3_MONITORED_AGRO';
    sanctioned_amount_inr = Math.round(amount * 0.60);
    risk_adjusted_roi_pct = 15.50;
  }

  const cropMap = { PADDY_KHARIF: 'Kisan Krishi Gold – Kharif', WHEAT_RABI: 'Kisan Krishi Gold – Rabi', SOYBEAN_KHARIF: 'Agri Flex Soybean Plus' };

  // Repayment installments (harvest-linked)
  const stages = ['PRE_SOWING', 'SOWING_KHARIF', 'TILLERING', 'HEADING', 'HARVEST_KHARIF', 'POST_HARVEST_RABI'];
  const weights = [0.05, 0.10, 0.05, 0.05, 0.50, 0.25];
  const installments = stages.map((stage, i) => ({
    installment_number: i + 1,
    crop_growth_stage: stage,
    installment_amount_inr: Math.round(sanctioned_amount_inr * weights[i]),
  }));

  return {
    underwriting_verdict: {
      agri_credit_score,
      tier,
      decision,
      sanctioned_amount_inr,
      risk_adjusted_roi_pct,
      recommended_product: cropMap[body.crop_type] || 'Kisan Krishi Gold',
    },
    scorecard_breakdown: {
      subscores: {
        bureau_score_pts: bureauPts - 180,
        ndvi_vigor_pts: vigorPts - 130,
        climate_risk_pts: climatePts - 162,
        land_collateral_pts: landPts - 45,
      }
    },
    repayment_structure: { installments },
    application_summary: {
      applicant_name: body.applicant_name,
      district: body.district,
      village: body.village,
      khasra_no: body.khasra_no,
      land_acres: body.land_acres,
      crop_type: body.crop_type,
      requested_loan_amount_inr: amount,
      assessment_mode: 'DEMO',
    }
  };
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    if (!body.applicant_name || !body.village || !body.khasra_no) {
      return res.status(422).json({ detail: 'Enter the borrower name, village and plot reference.' });
    }
    const result = computeScore(body);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ detail: 'Assessment service error. Please retry.' });
  }
}
