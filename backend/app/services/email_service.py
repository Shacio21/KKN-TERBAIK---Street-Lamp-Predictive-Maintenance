"""Email service for sending transactional emails.

Uses SMTP (via aiosmtplib if available) or falls back to logging emails
when SMTP is not configured (development mode).
"""

import logging
from datetime import datetime

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Email templates as simple HTML strings (no Jinja2 dependency needed)
TEMPLATES = {
    "verify_email": {
        "subject": "Verifikasi Email Anda — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#00D4FF;">PJU Smart Monitor</h2>
    <p>Halo <strong>{name}</strong>,</p>
    <p>Klik tombol di bawah untuk memverifikasi email Anda:</p>
    <a href="{verify_url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#00D4FF,#8B5CF6);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Verifikasi Email</a>
    <p style="color:#94A3B8;font-size:12px;margin-top:16px;">Link berlaku 24 jam. Abaikan jika bukan Anda yang mendaftar.</p>
</div>""",
    },
    "account_approved": {
        "subject": "Akun Anda Disetujui — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#00FF88;">✅ Akun Disetujui</h2>
    <p>Halo <strong>{name}</strong>,</p>
    <p>Akun Anda telah disetujui oleh admin. Anda sekarang bisa login ke dashboard.</p>
    <a href="{login_url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#00D4FF,#8B5CF6);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Login Sekarang</a>
</div>""",
    },
    "account_rejected": {
        "subject": "Pendaftaran Ditolak — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#EF4444;">❌ Pendaftaran Ditolak</h2>
    <p>Halo <strong>{name}</strong>,</p>
    <p>Maaf, pendaftaran akun Anda ditolak.</p>
    <p><strong>Alasan:</strong> {reason}</p>
    <p style="color:#94A3B8;font-size:12px;">Hubungi admin jika Anda merasa ini adalah kesalahan.</p>
</div>""",
    },
    "password_reset": {
        "subject": "Reset Password — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#00D4FF;">🔑 Reset Password</h2>
    <p>Halo <strong>{name}</strong>,</p>
    <p>Klik tombol di bawah untuk mereset password Anda:</p>
    <a href="{reset_url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#00D4FF,#8B5CF6);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
    <p style="color:#94A3B8;font-size:12px;margin-top:16px;">Link berlaku 1 jam.</p>
</div>""",
    },
    "alert_notification": {
        "subject": "⚠ Alert: {alert_type} — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#F59E0B;">⚠ Alert Sistem</h2>
    <p><strong>Lampu:</strong> {lamp_code}</p>
    <p><strong>Tipe:</strong> {alert_type}</p>
    <p><strong>Severity:</strong> <span style="color:{severity_color}">{severity}</span></p>
    <p><strong>Pesan:</strong> {message}</p>
    <p style="color:#94A3B8;font-size:12px;">{timestamp}</p>
    <a href="{dashboard_url}" style="display:inline-block;padding:10px 20px;background:#111827;color:#00D4FF;border:1px solid #00D4FF;border-radius:8px;text-decoration:none;font-size:13px;">Lihat Dashboard</a>
</div>""",
    },
    "ticket_assigned": {
        "subject": "Tiket Ditugaskan: {ticket_title} — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#00D4FF;">🔧 Tiket Baru Ditugaskan</h2>
    <p>Halo <strong>{assignee_name}</strong>,</p>
    <p>Anda ditugaskan untuk tiket perbaikan:</p>
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;margin:12px 0;">
        <p style="margin:0;font-weight:600;color:#E2E8F0;">{ticket_title}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#94A3B8;">Lampu: {lamp_code} | Prioritas: {priority}</p>
    </div>
    <a href="{ticket_url}" style="display:inline-block;padding:10px 20px;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Lihat Tiket</a>
</div>""",
    },
    "account_suspended": {
        "subject": "Akun Ditangguhkan — PJU Monitor",
        "body": """
<div style="font-family:Inter,sans-serif;max-width:500px;margin:auto;padding:20px;">
    <h2 style="color:#EF4444;">🚫 Akun Ditangguhkan</h2>
    <p>Halo <strong>{name}</strong>,</p>
    <p>Akun Anda telah ditangguhkan oleh administrator. Hubungi admin untuk informasi lebih lanjut.</p>
</div>""",
    },
}


class EmailService:
    """Email sending service with SMTP support."""

    def __init__(self):
        self.settings = get_settings()
        self._smtp_configured = False

        # Check if SMTP is configured via env vars
        smtp_host = getattr(self.settings, "smtp_host", None)
        if smtp_host:
            self._smtp_configured = True
            self._smtp_host = smtp_host
            self._smtp_port = getattr(self.settings, "smtp_port", 587)
            self._smtp_user = getattr(self.settings, "smtp_user", "")
            self._smtp_password = getattr(self.settings, "smtp_password", "")
            self._from_email = getattr(self.settings, "smtp_from", "noreply@pju-monitor.id")
            self._from_name = getattr(self.settings, "smtp_from_name", "PJU Monitor")

    async def send_email(self, to: str, template: str, context: dict) -> bool:
        """Send email using a named template."""
        tmpl = TEMPLATES.get(template)
        if not tmpl:
            logger.error(f"Email template not found: {template}")
            return False

        subject = tmpl["subject"].format(**context)
        body = tmpl["body"].format(**context)

        html = f"""
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#030712;color:#E2E8F0;">
{body}
<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;">
<p style="color:#64748B;font-size:11px;text-align:center;">
    © {datetime.now().year} PJU Smart Monitor — Sistem Monitoring Lampu Jalan Berbasis IoT
</p>
</body></html>"""

        if self._smtp_configured:
            return await self._send_smtp(to, subject, html)
        else:
            # Development fallback: log the email
            logger.info(f"📧 EMAIL [{template}] to={to} subject='{subject}'")
            logger.debug(f"Email body preview: {body[:200]}...")
            return True

    async def _send_smtp(self, to: str, subject: str, html: str) -> bool:
        """Send via SMTP using smtplib (sync, run in thread)."""
        import asyncio
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText

        def _send():
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{self._from_name} <{self._from_email}>"
            msg["To"] = to
            msg["Subject"] = subject
            msg.attach(MIMEText(html, "html", "utf-8"))

            try:
                with smtplib.SMTP(self._smtp_host, self._smtp_port) as server:
                    server.starttls()
                    if self._smtp_user:
                        server.login(self._smtp_user, self._smtp_password)
                    server.sendmail(self._from_email, [to], msg.as_string())
                return True
            except Exception as e:
                logger.error(f"SMTP send failed: {e}")
                return False

        return await asyncio.get_event_loop().run_in_executor(None, _send)


# Singleton
email_service = EmailService()
