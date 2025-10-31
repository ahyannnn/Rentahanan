from extensions import db

class Notification(db.Model):
    __tablename__ = "Notifications"  # Use lowercase for table name
    notificationid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    targetuserrole = db.Column(db.String(50), nullable=True)  # For group notifications
    targetuserid = db.Column(db.Integer, nullable=True)  # For individual notifications
    isgroupnotification = db.Column(db.Boolean, default=False)
    recipientcount = db.Column(db.Integer, default=1)
    createdbyuserid = db.Column(db.Integer, nullable=True)
    creationdate = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "notificationid": self.notificationid,
            "title": self.title,
            "message": self.message,
            "targetuserrole": self.targetuserrole,
            "targetuserid": self.targetuserid,
            "isgroupnotification": self.isgroupnotification,
            "recipientcount": self.recipientcount,
            "createdbyuserid": self.createdbyuserid,
            "creationdate": self.creationdate.isoformat() if self.creationdate else None
        }