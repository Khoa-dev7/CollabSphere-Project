from flask import Blueprint, request, jsonify
from models import db, ChatRoom, ChatMessage, MessageType
from middleware import token_required
from utils.file_manager import save_file

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat/rooms', methods=['POST'])
@token_required
def create_room(current_user):
    data = request.get_json()
    room = ChatRoom(name=data.get('name'), team_id=data.get('team_id'))
    db.session.add(room)
    db.session.commit()
    return jsonify(room.to_dict()), 201

@chat_bp.route('/api/chat/rooms/<int:room_id>/messages', methods=['POST'])
@token_required
def send_message(current_user, room_id):
    data = request.get_json()
    msg = ChatMessage(
        content=data.get('content'),
        room_id=room_id,
        sender_id=current_user.id,
        msg_type=MessageType.TEXT
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict()), 201

@chat_bp.route('/api/chat/rooms/<int:room_id>/messages', methods=['GET'])
@token_required
def get_history(current_user, room_id):
    page = request.args.get('page', 1, type=int)
    msgs = ChatMessage.query.filter_by(room_id=room_id)\
        .order_by(ChatMessage.created_at.desc())\
        .paginate(page=page, per_page=20)
    return jsonify([m.to_dict() for m in msgs.items]), 200