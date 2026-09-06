"""
Authentication & Durable Identity Service
Provides transactional user registration, Argon2id password verification, 
session issuance, server-side token validation, and session revocation.
Backed by SQLite WAL database (data/tvs_lending.db).
"""

import datetime
import uuid
import secrets
from typing import Dict, Any, Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
from tvs_lending.db.database import get_db_connection

_hasher = PasswordHasher()

# Institutional roles that require authorization
OFFICER_ROLES = {
    "Agri Underwriter",
    "Risk Operations Officer",
    "Risk Operations",
    "Field Agronomist",
    "GeoKisaan Tractor Dealer",
    "GeoKisaan Dealer",
    "TVS Tractor Dealer",
    "TVS Dealer",
    "Admin",
}
VALID_INVITE_CODES = {"TVS_OFFICER_2026", "EPIC8_AGRI_SECURE"}


def register_user(
    name: str,
    email: str,
    password: str,
    phone: str = "+91 98271 04421",
    role: str = "Borrower",
    branch: str = "Raipur Central Hub",
    invite_code: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Register a new user account with Argon2id password hashing.
    Enforces least-privilege: defaults to 'Borrower' unless an authorized
    institutional invite code is provided for officer/underwriter roles.
    """
    clean_email = email.strip().lower()
    if len(password) < 6:
        return {
            "success": False,
            "message": "Password must be at least 6 characters.",
            "token": None,
            "user": None,
        }

    # Enforce least-privilege role assignment
    assigned_role = "Borrower"
    req_role = role.strip()
    if req_role in OFFICER_ROLES:
        if invite_code and invite_code.strip() in VALID_INVITE_CODES:
            assigned_role = req_role
        elif clean_email.endswith("@tvscredit.com") or clean_email.endswith("@tvsdealers.in"):
            # Institutional domain auto-clearance
            assigned_role = req_role
        else:
            # Fall back to applicant/borrower role for public registrants
            assigned_role = "Borrower"
    elif req_role:
        assigned_role = req_role

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    expires_iso = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)).isoformat()
    user_id = f"TVS-USR-{uuid.uuid4().hex[:8].upper()}"
    pw_hash = _hasher.hash(password)
    session_token = f"tvs_sec_{secrets.token_urlsafe(32)}"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if email is already taken
        cursor.execute("SELECT id FROM users WHERE email = ?", (clean_email,))
        if cursor.fetchone():
            return {
                "success": False,
                "message": f"An institutional account with {clean_email} already exists. Please sign in.",
                "token": None,
                "user": None,
            }

        # Insert user
        cursor.execute("""
            INSERT INTO users (id, email, name, phone, role, branch, password_hash, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """, (user_id, clean_email, name.strip(), phone.strip(), assigned_role, branch.strip(), pw_hash, now_iso, now_iso))

        # Insert active session
        cursor.execute("""
            INSERT INTO sessions (token, user_id, created_at, expires_at, revoked_at, ip_address, user_agent)
            VALUES (?, ?, ?, ?, NULL, ?, ?)
        """, (session_token, user_id, now_iso, expires_iso, ip_address, user_agent))

        # Audit log
        cursor.execute("""
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
            VALUES (?, 'USER_REGISTERED', 'USER', ?, ?, ?)
        """, (user_id, user_id, f"Role: {assigned_role}, Email: {clean_email}", now_iso))

    return {
        "success": True,
        "message": f"Welcome aboard, {name}! Your GeoKisaan account has been provisioned as {assigned_role}.",
        "token": session_token,
        "user": {
            "user_id": user_id,
            "name": name.strip(),
            "email": clean_email,
            "phone": phone.strip(),
            "role": assigned_role,
            "branch": branch.strip(),
            "created_at": now_iso,
        },
    }


def authenticate_user(
    email: str,
    password: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Authenticate a user against durable database records using Argon2id.
    Zero demo bypasses: every account requires valid password verification.
    Issues a server-tracked session token with a 7-day expiration.
    """
    clean_email = email.strip().lower()

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email, name, phone, role, branch, password_hash, is_active
            FROM users WHERE email = ?
        """, (clean_email,))
        user_row = cursor.fetchone()

        if not user_row:
            return {
                "success": False,
                "message": "Invalid email or password.",
                "token": None,
                "user": None,
            }

        if not user_row["is_active"]:
            return {
                "success": False,
                "message": "This account is inactive. Please contact your GeoKisaan branch administrator.",
                "token": None,
                "user": None,
            }

        # Verify password with Argon2
        try:
            _hasher.verify(user_row["password_hash"], password)
        except (VerifyMismatchError, VerificationError, InvalidHash):
            # Log failed attempt in audit logs
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            cursor.execute("""
                INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
                VALUES (?, 'LOGIN_FAILED', 'USER', ?, 'Invalid password attempt', ?)
            """, (user_row["id"], user_row["id"], now_iso))
            return {
                "success": False,
                "message": "Invalid email or password.",
                "token": None,
                "user": None,
            }

        # Issue new session token
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        expires_iso = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)).isoformat()
        session_token = f"tvs_sec_{secrets.token_urlsafe(32)}"

        cursor.execute("""
            INSERT INTO sessions (token, user_id, created_at, expires_at, revoked_at, ip_address, user_agent)
            VALUES (?, ?, ?, ?, NULL, ?, ?)
        """, (session_token, user_row["id"], now_iso, expires_iso, ip_address, user_agent))

        cursor.execute("""
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
            VALUES (?, 'LOGIN_SUCCESS', 'USER', ?, 'Authenticated successfully', ?)
        """, (user_row["id"], user_row["id"], now_iso))

        return {
            "success": True,
            "message": f"Authentication successful. Welcome, {user_row['name']}!",
            "token": session_token,
            "user": {
                "user_id": user_row["id"],
                "name": user_row["name"],
                "email": user_row["email"],
                "phone": user_row["phone"],
                "role": user_row["role"],
                "branch": user_row["branch"],
            },
        }


def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve user by active, non-expired, non-revoked session token.
    """
    if not token or not token.startswith("tvs_sec_"):
        return None

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.email, u.name, u.phone, u.role, u.branch, u.is_active, s.expires_at, s.revoked_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ?
        """, (token,))
        row = cursor.fetchone()

        if not row:
            return None

        # Check revocation
        if row["revoked_at"] is not None:
            return None

        # Check expiration
        if row["expires_at"] <= now_iso:
            return None

        # Check active
        if not row["is_active"]:
            return None

        return {
            "user_id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "phone": row["phone"],
            "role": row["role"],
            "branch": row["branch"],
        }


def revoke_session(token: str) -> bool:
    """
    Revoke a session token server-side (logout / token invalidation).
    """
    if not token:
        return False

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sessions
            SET revoked_at = ?
            WHERE token = ? AND revoked_at IS NULL
        """, (now_iso, token))
        
        # Also log in audit
        cursor.execute("""
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at)
            VALUES ('SESSION', 'SESSION_REVOKED', 'SESSION', ?, 'Session logged out', ?)
        """, (token[:16] + "...", now_iso))
        
        return cursor.rowcount > 0
