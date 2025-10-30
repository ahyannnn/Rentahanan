from extensions import db

class Notification(db.Model):
    __tablename__ = "Notifications"  # Use lowercase for table name
    notificationid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.String(100))
    userrole = db.Column(db.Enum('tenant', 'landlord'))  # Added userrole
    title = db.Column(db.String(255))  # Changed to String, not ForeignKey
    message = db.Column(db.Text)  # Changed to Text for longer messages
    creationdate = db.Column(db.DateTime, default=db.func.current_timestamp())  # Better as DateTime

    def to_dict(self):
        return {
            "notificationid": self.notificationid,
            "userid": self.userid,
            "userrole": self.userrole,
            "title": self.title,
            "message": self.message,
            "creationdate": self.creationdate.isoformat() if self.creationdate else None
        }