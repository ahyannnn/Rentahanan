from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from models.units_model import House
import os
from routes.auth_route import auth_bp  # Import the blueprint

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Config
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Initialize extensions
db.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/api")

# Routes
@app.route("/api/houses", methods=["GET"])
def get_houses():
    houses = House.query.limit(5).all()
    return jsonify([h.to_dict() for h in houses])

@app.route("/api/ping")
def ping():
    return jsonify({"message": "pong"})


# Run app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
