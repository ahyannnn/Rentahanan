from flask import Blueprint, request, jsonify
from extensions import db
from models.notifications_model import Notification

notification_bp = Blueprint('notification_bp', __name__)

# GET notifications for user - TANGGALIN ANG /api
@notification_bp.route('/notifications/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    try:
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

# DELETE notification - TANGGALIN ANG /api
@notification_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({"success": False, "message": "Notification not found"}), 404
        
        db.session.delete(notification)
        db.session.commit()
        return jsonify({"success": True, "message": "Notification deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

# MARK AS READ - TANGGALIN ANG /api
@notification_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_as_read(notification_id):
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({"success": False, "message": "Notification not found"}), 404
        
        # Add your mark as read logic here
        return jsonify({"success": True, "message": "Notification marked as read"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500