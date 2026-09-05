import React, { useState, useEffect } from 'react';
import { AlertTriangle, Satellite, FileText, Phone, CheckCircle2 } from 'lucide-react';

interface AlertItem {
  loan_id: string;
  borrower_name: string;
  current_ndvi?: number;
  previous_ndvi?: number;
  ndvi_drop_pct?: number;
  satellite_message?: string;
  rainfall_7d_forecast_mm?: number;
  days_past_due: number;
  outstanding_principal_inr: number;
}

interface RecoveryDossier {
  loan_id: string;
  borrower_name: string;
  phone: string;
  village: string;
  district: string;
  outstanding_inr: number;
  probability_of_default_pct: number;
  days_past_due: number;
  asset_type: string;
  land_acres: number;
  khasra_no: string;
  crop_type: string;
  latest_ndvi: number;
  weather_alert: string;
}

export const EWSSection: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      loan_id: 'TVS-TR-2023-4109',
      borrower_name: 'Bhupendra Baghel',
      current_ndvi: 0.35,
      previous_ndvi: 0.60,
      rainfall_7d_forecast_mm: 12.0,
      days_past_due: 65,
      outstanding_principal_inr: 390000.0,
    },
    {
      loan_id: 'TVS-TR-2024-8812',
      borrower_name: 'Rameshwar Verma',
      current_ndvi: 0.42,
      previous_ndvi: 0.68,
      rainfall_7d_forecast_mm: 135.0,
      days_past_due: 18,
      outstanding_principal_inr: 520000.0,
    },
  ]);

  const [dossiers, setDossiers] = useState<RecoveryDossier[]>([
    {
      loan_id: 'TVS-TR-2023-4109',
      borrower_name: 'Bhupendra Baghel',
      phone: '+91-9752109832',
      village: 'Kurud',
      district: 'Dhamtari',
      outstanding_inr: 390000.0,
      probability_of_default_pct: 28.5,
      days_past_due: 65,
      asset_type: 'TVS New 45HP Tractor',
      land_acres: 3.8,
      khasra_no: '214/1',
      crop_type: 'Paddy',
      latest_ndvi: 0.35,
      weather_alert: '42% NDVI drop (Severe Stem Borer Infestation)',
    },
    {
      loan_id: 'TVS-TR-2024-8812',
      borrower_name: 'Rameshwar Verma',
      phone: '+91-9425201198',
      village: 'Arang',
      district: 'Raipur',
      outstanding_inr: 520000.0,
      probability_of_default_pct: 19.2,
      days_past_due: 18,
      asset_type: 'TVS 50HP Tractor + Rotavator',
      land_acres: 5.2,
      khasra_no: '98/B',
      crop_type: 'Paddy',
      latest_ndvi: 0.42,
      weather_alert: 'Torrential Rainfall Inundation Forecast (135mm)',
    },
  ]);

  const [actionTriggered, setActionTriggered] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/v1/ews/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts && data.alerts.length > 0) setAlerts(data.alerts);
        if (data.prioritized_recovery_dossiers && data.prioritized_recovery_dossiers.length > 0) {
          const mapped = data.prioritized_recovery_dossiers.map((d: any) => ({
            loan_id: d.loan_id,
            borrower_name: d.borrower_name,
            phone: d.phone || '+91-9876543210',
            village: d.location?.village || d.village || 'Patan',
            district: d.location?.district || d.district || 'Durg',
            outstanding_inr: d.outstanding_principal_inr ?? d.outstanding_inr ?? 450000,
            probability_of_default_pct: d.probability_of_default_pct ?? 25.0,
            days_past_due: d.days_past_due ?? 0,
            asset_type: d.pledged_collateral?.asset_type || d.asset_type || 'Tractor',
            land_acres: d.pledged_collateral?.land_acres || d.land_acres || 4.0,
            khasra_no: d.pledged_collateral?.khasra_no || d.khasra_no || '101/A',
            crop_type: d.pledged_collateral?.crop || d.crop_type || 'Paddy',
            latest_ndvi: d.satellite_ground_truth?.current_ndvi ?? d.latest_ndvi ?? 0.45,
            weather_alert: d.satellite_ground_truth?.weather_alert || d.weather_alert || 'Monitored via Sentinel-2',
          }));
          setDossiers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleAction = (loanId: string, actionName: string) => {
    setActionTriggered((prev) => ({ ...prev, [loanId]: actionName }));
  };

  return (
    <section id="ews" className="relative w-full py-20 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold mb-2">
              <AlertTriangle size={14} className="text-rose-600" />
              <span>Proactive Risk Mitigation</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
            >
              Early Warning System (EWS) & Field Collection
            </h2>
            <p className="mt-2 text-sm text-slate-700 max-w-xl">
              Real-time satellite vegetative drop watcher and automated restructuring action playbooks for field agents.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {alerts.length} Fortnightly Anomaly Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Satellite Anomaly Feed (5 cols) */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-7 flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Satellite size={16} className="text-[#0B2545]" />
              Sentinel-2 Anomaly Watcher
            </h3>

            <div className="flex flex-col gap-4">
              {alerts.map((al) => {
                const prev = al.previous_ndvi ?? 0.65;
                const curr = al.current_ndvi ?? 0.40;
                const dropPct = al.ndvi_drop_pct ?? Math.round(((prev - curr) / Math.max(0.01, prev)) * 100);
                return (
                  <div
                    key={al.loan_id}
                    className="p-4 rounded-2xl bg-white/90 border border-rose-200 flex flex-col gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-rose-900">{al.loan_id}</span>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {al.days_past_due} DPD
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{al.borrower_name}</span>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Principal: ₹{(al.outstanding_principal_inr || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-600">-{dropPct}% NDVI</span>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {prev.toFixed(2)} → {curr.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <strong>Risk Trigger:</strong>{' '}
                      {al.satellite_message || ((al.rainfall_7d_forecast_mm ?? 0) > 100
                        ? `Torrential Rain Inundation (${al.rainfall_7d_forecast_mm}mm)`
                        : 'Severe Vegetative Stress (Stem Borer Infestation)')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Field Recovery Dossiers (7 cols) */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-7 flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText size={16} className="text-[#0B2545]" />
              Prioritized Field Recovery Dossiers
            </h3>

            <div className="flex flex-col gap-4">
              {dossiers.map((dos) => {
                const isActed = actionTriggered[dos.loan_id];
                return (
                  <div
                    key={dos.loan_id}
                    className="p-5 rounded-2xl bg-white/90 border border-slate-200 flex flex-col gap-3.5 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{dos.borrower_name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {dos.days_past_due} DPD (SMA-2)
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} /> {dos.phone} · Village: {dos.village}, {dos.district}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</span>
                        <div className="text-base font-black text-slate-900">
                          ₹{(dos.outstanding_inr ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 font-semibold">Pledged Asset</span>
                        <div className="font-bold text-slate-800 truncate">{dos.asset_type}</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 font-semibold">Land / Khasra</span>
                        <div className="font-bold text-slate-800">{dos.land_acres} ac ({dos.khasra_no})</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 font-semibold">Default Risk (PD)</span>
                        <div className="font-bold text-rose-600">{dos.probability_of_default_pct}%</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 font-semibold">Current NDVI</span>
                        <div className="font-bold text-amber-600">{dos.latest_ndvi}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <strong>Satellite Alert:</strong> {dos.weather_alert}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Action Playbook:</span>

                      {isActed ? (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-300">
                          <CheckCircle2 size={14} /> Action Triggered: {isActed}
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAction(dos.loan_id, 'Offer Harvest EMI Restructure')}
                            className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#0B2545] hover:bg-purple-800 transition-colors shadow-xs active:scale-95 cursor-pointer"
                          >
                            Reschedule to Harvest EMI
                          </button>
                          <button
                            onClick={() => handleAction(dos.loan_id, 'File PMFBY Insurance Claim')}
                            className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            File PMFBY Claim
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EWSSection;
