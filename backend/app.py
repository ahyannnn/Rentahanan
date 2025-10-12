from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from models.units_model import House
import os
<<<<<<< HEAD
from routes.auth_route import auth_bp  # Import the blueprint
=======
from routes.auth_route import auth_bp
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3

# Load environment variables
load_dotenv()

app = Flask(__name__)
<<<<<<< HEAD
CORS(app)
=======

# ✅ Proper CORS setup — allow your frontend origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3

# Config
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Initialize extensions
db.init_app(app)

<<<<<<< HEAD
app.register_blueprint(auth_bp, url_prefix="/api")

# Routes
=======
# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")

# Example routes
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3
@app.route("/api/houses", methods=["GET"])
def get_houses():
    houses = House.query.limit(5).all()
    return jsonify([h.to_dict() for h in houses])

@app.route("/api/ping")
def ping():
    return jsonify({"message": "pong"})

<<<<<<< HEAD

# Run app
=======
>>>>>>> fc2de71f7cd755179b6081a23a6c38460ac387f3
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
