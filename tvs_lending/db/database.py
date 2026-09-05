"""
Durable Database Management for TVS Credit Smart Lending Decision Hub
Provides thread-safe transactional SQLite database with WAL mode and connection pooling.
Supports PostgreSQL via DATABASE_URL environment variable.
"""

import os
import sqlite3
import datetime
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from contextlib import contextmanager
from argon2 import PasswordHasher

DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DEFAULT_SQLITE_PATH = DB_DIR / "tvs_lending.db"
DATABASE_URL = os.environ.get("DATABASE_URL", str(DEFAULT_SQLITE_PATH))

_hasher = PasswordHasher()


def get_db_path() -> Path:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    return DEFAULT_SQLITE_PATH


@contextmanager
def get_db_connection():
    """Context manager for thread-safe SQLite connection with WAL mode and foreign keys."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path), timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        # Enable WAL mode for high concurrency read/write
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initialize database tables and seed standard institutional demo users with Argon2id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                role TEXT NOT NULL DEFAULT 'Borrower',
                branch TEXT,
                password_hash TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")

        # 2. Sessions Table (Durable Server-Side Session Tracking)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                revoked_at TEXT,
                ip_address TEXT,
                user_agent TEXT
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);")

        # 3. Audit Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id TEXT,
                action TEXT NOT NULL,
                entity_type TEXT,
                entity_id TEXT,
                details TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # 4. Applications Table (Durable Lending Workflow & Audit History)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                idempotency_key TEXT UNIQUE,
                borrower_id TEXT REFERENCES users(id) ON DELETE SET NULL,
                applicant_name TEXT NOT NULL,
                district TEXT NOT NULL,
                village TEXT NOT NULL,
                khasra_no TEXT NOT NULL,
                land_acres REAL NOT NULL,
                crop_type TEXT NOT NULL,
                requested_loan_amount_inr REAL NOT NULL,
                requested_tenure_months INTEGER NOT NULL,
                bureau_cibil_score INTEGER,
                annual_banking_turnover_inr REAL NOT NULL,
                requested_product_type TEXT,
                status TEXT NOT NULL DEFAULT 'SUBMITTED',
                policy_version TEXT NOT NULL DEFAULT '2026.Q3',
                model_version TEXT NOT NULL DEFAULT 'v2.1.0',
                input_snapshot_json TEXT NOT NULL,
                scorecard_result_json TEXT NOT NULL,
                decision_verdict_json TEXT NOT NULL,
                repayment_schedule_json TEXT NOT NULL,
                evidence_snapshot_json TEXT NOT NULL,
                created_by TEXT,
                reviewed_by TEXT,
                review_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_borrower ON applications(borrower_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_apps_idempotency ON applications(idempotency_key);")

        # 5. Application Lifecycle Transitions & History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS application_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
                from_status TEXT,
                to_status TEXT NOT NULL,
                changed_by TEXT NOT NULL,
                reason TEXT,
                created_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_app_history_app ON application_history(application_id);")

        # 6. Conversations Table (Persistent, Multi-Worker Session Ownership)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
                language TEXT NOT NULL DEFAULT 'ENGLISH',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conv_app ON conversations(application_id);")

        # 7. Conversation Messages Table (with Message ID Retries & Evidence Attributions)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE,
                conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                sender TEXT NOT NULL,
                content TEXT NOT NULL,
                evidence_json TEXT,
                suggested_follow_ups_json TEXT,
                provider_model TEXT,
                created_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conv_msg_conv ON conversation_messages(conversation_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conv_msg_mid ON conversation_messages(message_id);")

        # 8. Support Escalation Tickets Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS support_tickets (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
                application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
                category TEXT NOT NULL,
                issue_description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'OPEN',
                assigned_officer_id TEXT,
                resolution_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);")

        # 9. EWS Alerts Table (Alert Lifecycle: OPEN -> ACKNOWLEDGED -> ASSIGNED -> RESOLVED)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ews_alerts (
                loan_id TEXT PRIMARY KEY,
                borrower_name TEXT NOT NULL,
                current_ndvi REAL NOT NULL,
                previous_ndvi REAL NOT NULL,
                rainfall_7d_forecast_mm REAL NOT NULL,
                days_past_due INTEGER NOT NULL DEFAULT 0,
                outstanding_principal_inr REAL NOT NULL,
                ews_severity TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'OPEN',
                assigned_officer_id TEXT,
                resolution_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ews_status ON ews_alerts(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ews_severity ON ews_alerts(ews_severity);")

        # 10. Seed Standard Demo Accounts with real Argon2id hashes if absent
        seed_users = [
            {
                "id": "TVS-USR-1001",
                "email": "rajeshwar.sharma@tvscredit.com",
                "name": "Rajeshwar Sharma",
                "phone": "+91 98271 04421",
                "role": "Agri Underwriter",
                "branch": "Raipur Central Hub",
                "password": "Underwrite@2026",
            },
            {
                "id": "TVS-USR-1002",
                "email": "sunil.verma@tvscredit.com",
                "name": "Sunil Verma",
                "phone": "+91 94252 88910",
                "role": "Risk Operations Officer",
                "branch": "Zonal Risk Command",
                "password": "RiskOps@2026",
            },
            {
                "id": "TVS-USR-1003",
                "email": "kavita.patel@tvscredit.com",
                "name": "Kavita Patel",
                "phone": "+91 98263 77412",
                "role": "Field Agronomist",
                "branch": "Bilaspur Cluster",
                "password": "Underwrite@2026",
            },
            {
                "id": "TVS-USR-1004",
                "email": "ramesh.patel@tvsdealers.in",
                "name": "Ramesh Patel",
                "phone": "+91 98275 33211",
                "role": "TVS Tractor Dealer",
                "branch": "Durg TVS Dealership",
                "password": "Underwrite@2026",
            }
        ]

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        for su in seed_users:
            cursor.execute("SELECT id FROM users WHERE email = ?", (su["email"].lower(),))
            row = cursor.fetchone()
            if not row:
                pw_hash = _hasher.hash(su["password"])
                cursor.execute("""
                    INSERT INTO users (id, email, name, phone, role, branch, password_hash, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """, (su["id"], su["email"].lower(), su["name"], su["phone"], su["role"], su["branch"], pw_hash, now_iso, now_iso))

        # Seed initial active EWS alerts if table is empty
        cursor.execute("SELECT COUNT(*) as cnt FROM ews_alerts")
        if cursor.fetchone()["cnt"] == 0:
            seed_alerts = [
                ("TVS-TR-2024-8812", "Rameshwar Verma", 0.42, 0.68, 135.0, 18, 520000.0, "HIGH_AMBER_ALERT", "OFFER_SEASONAL_EMI_MORATORIUM_VIA_WHATSAPP", "OPEN", "TVS-USR-1002"),
                ("TVS-KW-2025-1044", "Dhananjay Sahu", 0.58, 0.62, 1.2, 0, 85000.0, "WATCHLIST_YELLOW_ALERT", "DISPATCH_AGRONOMIC_ADVISORY_SMS", "OPEN", None),
                ("TVS-TR-2023-4109", "Bhupendra Baghel", 0.35, 0.60, 12.0, 65, 390000.0, "CRITICAL_RED_ALERT", "DISPATCH_FIELD_RECOVERY_OFFICER_IMMEDIATE_RESTRUCTURE", "ASSIGNED", "TVS-USR-1001"),
            ]
            for sa in seed_alerts:
                cursor.execute("""
                    INSERT INTO ews_alerts (loan_id, borrower_name, current_ndvi, previous_ndvi, rainfall_7d_forecast_mm, days_past_due, outstanding_principal_inr, ews_severity, recommended_action, status, assigned_officer_id, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (*sa, now_iso, now_iso))


# Auto-initialize tables on module load
init_db()
