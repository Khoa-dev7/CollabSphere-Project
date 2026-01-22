from flask import Blueprint, request, jsonify
from models import db, Team, TeamMember, ClassRoom, UserRole, User
from middleware import token_required, role_required

team_bp = Blueprint('team', __name__)

@team_bp.route('/api/classes/<int:class_id>/teams', methods=['POST'])
@token_required
@role_required([UserRole.LECTURER])
def create_team(current_user, class_id):
    # Check quyền giảng viên
    cls = ClassRoom.query.get_or_404(class_id)
    if cls.lecturer_id != current_user.id:
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json()
    new_team = Team(name=data['name'], class_id=class_id)
    db.session.add(new_team)
    db.session.commit()
    return jsonify(new_team.to_dict()), 201

@team_bp.route('/api/teams/<int:team_id>/members', methods=['POST'])
@token_required
@role_required([UserRole.LECTURER])
def add_members(current_user, team_id):
    data = request.get_json()
    student_ids = data.get('student_ids', [])
    for sid in student_ids:
        member = TeamMember(user_id=sid, team_id=team_id)
        db.session.add(member)
    db.session.commit()
    return jsonify({'message': 'Members added'}), 200