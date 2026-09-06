import policy from '../../data/tvs_credit_policy.json';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query = '', language = 'en', context = {} } = req.body || {};
  const q = query.toLowerCase();

  let answer = "Krishi Saathi is here to assist you with agricultural loan underwriting, satellite insights, and repayment scheduling.";
  let sources = ["TVS Credit Policy 2026.Q3", "ISRO Bhuvan / Sentinel-2 Data"];

  if (q.includes('par-90') || q.includes('par 90') || q.includes('risk')) {
    answer = "PAR-90 (Portfolio at Risk > 90 days) reflects loans where installments are overdue by more than 90 days. In Chhattisgarh, your current portfolio average is 2.31% across ₹988 Cr. Janjgir-Champa has the highest canal irrigation stability (1.8% PAR-90), while Korba has elevated risk (3.4% PAR-90) due to dryland farming.";
    sources.push("Portfolio Analytics Model");
  } else if (q.includes('document') || q.includes('prepare') || q.includes('tractor')) {
    answer = "For a TVS Tractor Loan, farmers need: 1) Land records (Khasra/B1 form with min 3 acres), 2) Aadhaar & PAN card, 3) 6 months bank statement showing agricultural turnover, and 4) Quotation from an authorized TVS Tractor dealership.";
    sources.push("TVS Product Guidelines - TRACTOR_NEW");
  } else if (q.includes('harvest') || q.includes('repayment') || q.includes('emi')) {
    answer = "GeoKisaan Smart Harvest EMI matches your crop cycle: Low nominal maintenance installments during sowing and vegetative growth (June-October), followed by bullet installments matching mandi procurement sales (November-January). This slashes penal defaults by 34.5%.";
    sources.push("Smart Harvest EMI Policy");
  } else if (q.includes('score') || q.includes('explain') || q.includes('assessment')) {
    answer = "The Agri Credit Score (300–900) synthesizes 4 pillars: Bureau/CIBIL history (40%), Satellite NDVI vegetative vigor & CloudGap inpainting (30%), Climate and rainfall stability (20%), and Cadastral land collateral validity via ISRO Bhuvan (10%).";
    sources.push("AgriCredit Scorecard Model v2.1.0");
  }

  return res.status(200).json({
    reply: answer,
    sources,
    timestamp: new Date().toISOString(),
    language
  });
}
