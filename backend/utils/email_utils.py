# utils/email_utils.py

import os
import random
import time
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from dotenv import load_dotenv

load_dotenv()


# -------------------
# Brevo (Sendinblue) Setup
# -------------------
BREVO_API_KEY = os.getenv("BREVO_API_KEY")

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key["api-key"] = BREVO_API_KEY

# Temporary in-memory storage for verification codes
# Structure: { email: {"code": "123456", "timestamp": 1234567890} }
verification_codes = {}

# -------------------
# Utility Functions
# -------------------
def generate_code():
    """Generate a random 6-digit code."""
    return str(random.randint(100000, 999999))


def send_verification_email(email):
    """
    Send a verification code via Brevo.
    Returns True if successful, False otherwise.
    """
    code = generate_code()

    # Save code + timestamp
    verification_codes[email] = {
        "code": code,
        "timestamp": time.time()
    }

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Password Reset Verification</h1>
        <p style="font-size: 16px; color: #555;">
            We received a request to reset your password. Please use the verification code below to proceed:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 25px; background-color: #007bff; color: white; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">
                {code}
            </span>
        </div>
        <p style="font-size: 14px; color: #777;">
            This code will expire in 15 minutes. If you didn’t request this, please ignore the email.
        </p>
        <p style="font-size: 14px; color: #777;">
            Thanks,<br>The Rentahanan App Team
        </p>
    </div>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email}],
        sender={"name": "Rentahanan App", "email": "padillacarlosnino.pdm@gmail.com"},  # ✅ verified Brevo sender
        subject="Your Password Reset Verification Code",
        html_content=html_content
    )

    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        api_instance.send_transac_email(send_smtp_email)
        print(f"[Brevo] Sent verification email to {email} with code {code}")
        return True
    except ApiException as e:
        print(f"[Brevo Error] Failed to send email to {email}: {e}")
        return False


def verify_code(email, code):
    """
    Verify if the provided code matches the stored one and is not expired.
    Returns (True, "message") or (False, "error message")
    """
    MAX_AGE = 15 * 60  # 15 minutes in seconds
    entry = verification_codes.get(email)

    if not entry:
        return False, "No verification code found for this email."

    # Check expiration
    if time.time() - entry["timestamp"] > MAX_AGE:
        del verification_codes[email]
        return False, "Verification code expired. Please request a new one."

    # Check match
    if entry["code"] == code:
        del verification_codes[email]
        return True, "Code verified successfully."

    return False, "Invalid verification code."
