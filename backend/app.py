from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from models.units_model import House
from routes.auth_route import auth_bp
from routes.application_route import application_bp
from routes.tenant_route import tenant_bp
import os
import random
import time
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

# -------------------
# Load environment variables
# -------------------
load_dotenv()

app = Flask(__name__)

# -------------------
# CORS Setup
# -------------------
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# -------------------
# Config
# -------------------
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Base folder for uploads
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Optional subfolders
for sub in ["valid_ids", "brgy_clearances", "proof_of_income"]:
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], sub), exist_ok=True)

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(application_bp, url_prefix="/api")
app.register_blueprint(tenant_bp, url_prefix="/api")

# -------------------
# Brevo (Sendinblue) Setup
# -------------------
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = BREVO_API_KEY

# Temporary storage for verification codes
# Structure: {email: {"code": "123456", "timestamp": 1234567890}}
verification_codes = {}

def generate_code():
    return str(random.randint(100000, 999999))

# -------------------
# Example Routes
# -------------------
@app.route("/api/houses", methods=["GET"])
def get_houses():
    houses = House.query.limit(5).all()
    return jsonify([h.to_dict() for h in houses])

@app.route("/api/ping")
def ping():
    return jsonify({"message": "pong"})

@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running!"})

# -------------------
# Forgot Password Route
# -------------------
@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"message": "Email is required"}), 400

    code = generate_code()
    verification_codes[email] = {
        "code": code,
        "timestamp": time.time()  # store current time
    }

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto;">
        <h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Password Reset Verification</h1>
        <p style="font-size: 16px; color: #555;">
            We received a request to reset the password for your account. 
            Please use the verification code below to proceed.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 25px; background-color: #007bff; color: white; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 5px;">
                {code}
            </span>
        </div>
        <p style="font-size: 14px; color: #777;">
            This code is valid for 15 minutes. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="font-size: 14px; color: #777;">
            Thanks,<br>The Rentahanan App Team
        </p>
    </div>
    """

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email}],
        sender={"name": "Rentahanan App", "email": "padillacarlosnino.pdm@gmail.com"},  # ✅ verified sender
        subject="Your Verification Code",
        html_content=html_content
    )

    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        api_response = api_instance.send_transac_email(send_smtp_email)
        print("Email sent:", api_response)
        return jsonify({"message": "Verification code sent successfully"})
    except ApiException as e:
        print("Error sending email:", e)
        return jsonify({"message": "Failed to send email"}), 500

# -------------------
# Verify Code Route
# -------------------
@app.route("/api/verify-code", methods=["POST"])
def verify_code():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")
    MAX_AGE = 15 * 60  # 15 minutes in seconds

    entry = verification_codes.get(email)
    if entry:
        # Check expiry
        if time.time() - entry["timestamp"] > MAX_AGE:
            return jsonify({"message": "Code expired"}), 400
        if entry["code"] == code:
            return jsonify({"message": "Code verified successfully"})
    return jsonify({"message": "Invalid code"}), 400

# -------------------
# Test Route
# -------------------
@app.route("/api/test-forgot/<email>")
def test_forgot(email):
    print("Email received:", email)
    return jsonify({"message": f"Received email: {email}"})

# -------------------
# Run app
# -------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
