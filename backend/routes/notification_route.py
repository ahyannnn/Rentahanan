from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification  # Your Notification model

notification_bp = Blueprint('notification_bp', __name__)

@notification_bp.route('/notifications/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    try:
        # Get notifications for the user, ordered by most recent first
        notifications = Notification.query.filter_by(userid=user_id)\
            .order_by(Notification.creationdate.desc())\
            .all()
        
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'notificationid': notification.notificationid,
                'userid': notification.userid,
                'userrole': notification.userrole,
                'title': notification.title,
                'message': notification.message,
                'creationdate': notification.creationdate.isoformat() if notification.creationdate else None
            })
        
        return jsonify({
            'success': True,
            'notifications': notifications_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching notifications: {str(e)}'
        }), 500