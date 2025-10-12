from extensions import db
from werkzeug.security import check_password_hash, generate_password_hash

class User(db.Model):
    __tablename__ = "Users"

    userid = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), nullable=False, default="Tenant")
    datecreated = db.Column(db.DateTime, nullable=False)

    # Optional helper
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
