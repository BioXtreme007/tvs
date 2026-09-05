"""
Dual-Track Agentic Orchestrator for TVS Credit Decision Hub
Combines:
- Track A: Fast-Path (<500ms deterministic Python for instant scoring & SHAP)
- Track B: Deep Agentic Deliberation (Guideline RAG, Multi-Agent Review, Explainability Memo, Audit)
"""

import time
from typing import Dict, Any, List, Optional
from .subagents import (
    GeoDataValidationAgent,
    GuidelineRAGAgent,
    CreditExplainabilityAgent,
    EscalationAgent,
    SafetyGuardrailAgent,
    AuditLogger,
)


class DualTrackOrchestrator:
    def __init__(self):
        self.validation_agent = GeoDataValidationAgent()
        self.rag_agent = GuidelineRAGAgent()
        self.explainability_agent = CreditExplainabilityAgent()
        self.escalation_agent = EscalationAgent()
        self.guardrail_agent = SafetyGuardrailAgent()
        self.audit_logger = AuditLogger()

    def deliberate_application(
        self,
        applicant_name: str,
        coordinates: List[List[float]],
        khasra_no: str,
        district: str,
        credit_score: int,
        tier: str,
        features: Dict[str, Any],
        days_past_due: int = 0,
        ndvi_drop_pct: float = 0.0,
        outstanding_inr: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Executes full agentic deliberation across all specialized subagents.
        """
        start_time = time.time()

        # 1. Geo-Data Validation Agent
        val_res = self.validation_agent.validate(coordinates, khasra_no, district)

        # 2. Guideline RAG Agent
        rag_res = self.rag_agent.search_guidelines(query=f"tractor loan {district} {tier}")

        # 3. Credit Explainability Agent
        memo = self.explainability_agent.generate_memo(applicant_name, credit_score, tier, features)

        # 4. Escalation Agent
        esc_res = self.escalation_agent.evaluate_escalation(days_past_due, ndvi_drop_pct, outstanding_inr)

        # 5. Safety Guardrail Agent
        guard_res = self.guardrail_agent.verify_financial_claims(memo, features)

        # 6. Audit Logger
        agent_subresults = {
            "validation": val_res,
            "escalation": esc_res,
            "guardrails": guard_res,
        }
        decision = "AUTO_APPROVE" if credit_score >= 750 and val_res["passed"] else ("FAST_TRACK" if credit_score >= 680 else "MANUAL_REVIEW")
        audit_entry = self.audit_logger.log_decision(applicant_name, credit_score, decision, agent_subresults)

        duration_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "orchestrator": "DualTrackOrchestrator",
            "deliberation_status": "COMPLETED",
            "latency_ms": duration_ms,
            "final_decision": decision,
            "underwriting_memo": memo,
            "agents_report": {
                "geo_validation": val_res,
                "guidelines_retrieved": rag_res,
                "escalation_policy": esc_res,
                "safety_guardrails": guard_res,
                "audit_record": audit_entry,
            }
        }
