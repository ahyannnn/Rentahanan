from extensions import db

class Tenant(db.Model):
    __tablename__ = "Tenants"  # ✅ matches your database table
    tenantid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.String(100))
    dateofbirth = db.Column(db.String(50))
    address = db.Column(db.String(255))
    applicationid = db.Column(db.Integer, db.ForeignKey('Applications.applicationid'))

    def to_dict(self):
        return {
            "id": self.tenantid,
            "userid": self.userid,
            "dateofbirth": self.dateofbirth,
            "address": self.address,
            "applicationid": self.applicationid,
        }