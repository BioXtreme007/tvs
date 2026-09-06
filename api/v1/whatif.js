export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    rainfall_change_pct = 0,
    temperature_increase_c = 0,
    crop_market_price_change_pct = 0,
    fertilizer_cost_change_pct = 0,
    district = 'All Districts'
  } = req.body || {};

  const baseline_portfolio_crores = 988.0;
  const baseline_gnpa_pct = 2.30;
  const baseline_farmers_count = 23200;

  const drought_penalty = Math.max(0.0, -rainfall_change_pct) * 0.08;
  const heat_penalty = temperature_increase_c * 0.45;
  const price_penalty = Math.max(0.0, -crop_market_price_change_pct) * 0.05;

  const stressed_gnpa_pct = Number((baseline_gnpa_pct + drought_penalty + heat_penalty + price_penalty).toFixed(2));
  const stressed_gnpa_crores = Number((baseline_portfolio_crores * (stressed_gnpa_pct / 100.0)).toFixed(2));
  const baseline_gnpa_crores = Number((baseline_portfolio_crores * (baseline_gnpa_pct / 100.0)).toFixed(2));
  const incremental_npa_crores = Number((stressed_gnpa_crores - baseline_gnpa_crores).toFixed(2));
  const at_risk_farmers_count = Math.round(baseline_farmers_count * (stressed_gnpa_pct / 100.0));

  const mitigated_gnpa_pct = Number((stressed_gnpa_pct * 0.68).toFixed(2));
  const saved_crores = Number((stressed_gnpa_crores - (baseline_portfolio_crores * (mitigated_gnpa_pct / 100.0))).toFixed(2));

  return res.status(200).json({
    simulation_parameters: req.body,
    baseline_portfolio: {
      portfolio_size_crores: baseline_portfolio_crores,
      gnpa_pct: baseline_gnpa_pct,
      gnpa_amount_crores: baseline_gnpa_crores,
      total_borrowers: baseline_farmers_count,
    },
    stressed_portfolio_impact: {
      stressed_gnpa_pct,
      stressed_gnpa_amount_crores,
      incremental_npa_crores,
      at_risk_borrowers_count,
    },
    proactive_harvest_restructuring_benefit: {
      mitigated_gnpa_pct,
      capital_loss_prevented_crores: saved_crores,
      risk_mitigation_efficiency_pct: 32.0,
    }
  });
}
