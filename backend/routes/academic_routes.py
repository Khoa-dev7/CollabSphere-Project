from flask import Blueprint, request, jsonify
from models import db, Subject, ClassRoom, UserRole, User
from middleware import token_required, role_required

academic_bp = Blueprint('academic', __name__)

# --- SUBJECTS ---
@academic_bp.route('/api/subjects', methods=['POST'])
@token_required
@role_required([UserRole.STAFF])
def create_subject(current_user):
    data = request.get_json()
    new_sub = Subject(code=data['code'], name=data['name'], syllabus_url=data.get('syllabus_url'))
    db.session.add(new_sub)
    db.session.commit()
    return jsonify({'message': 'Subject created'}), 201

@academic_bp.route('/api/subjects', methods=['GET'])
@token_required
def get_subjects(current_user):
    subjects = Subject.query.all()
    return jsonify([{'id': s.id, 'code': s.code, 'name': s.name} for s in subjects]), 200

# --- CLASSES ---
@academic_bp.route('/api/classes', methods=['POST'])
@token_required
@role_required([UserRole.STAFF])
def create_class(current_user):
    data = request.get_json()
    new_class = ClassRoom(
        name=data['name'], 
        subject_id=data['subject_id'],
        lecturer_id=data.get('lecturer_id')
    )
    db.session.add(new_class)
    db.session.commit()
    return jsonify({'message': 'Class created'}), 201