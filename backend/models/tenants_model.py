from extensions import db

class Tenant(db.Model):
    __tablename__ = "Tenants"
    tenantid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.String(100))
    applicationid = db.Column(db.Integer, db.ForeignKey('Applications.applicationid'))
    status = db.Column(db.String(20), )  # Pending, Active, Terminated

    def to_dict(self):
        return {
            "id": self.tenantid,
            "userid": self.userid,
            "applicationid": self.applicationid,
            "status": self.status
        }