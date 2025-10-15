from extensions import db
from datetime import datetime

class Application(db.Model):
    __tablename__ = "Applications"

    applicationid = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    unitid = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), default="Registered")
    submissiondate = db.Column(db.DateTime, default=datetime.utcnow)
    userid = db.Column(db.Integer, db.ForeignKey("Users.userid", ondelete="CASCADE"), nullable=False)
    valid_id = db.Column(db.String(255), nullable=True)

    user = db.relationship("User", backref=db.backref("Applications", lazy=True))

    def to_dict(self):
        return {
            "applicationid": self.applicationid,
            "fullname": self.fullname,
            "email": self.email,
            "phone": self.phone,
            "unitid": self.unitid,
            "status": self.status,
            "submissiondate": self.submissiondate.strftime("%Y-%m-%d %H:%M:%S"),
            "userid": self.userid,
            "valid_id": self.valid_id
        }
