from flask import Blueprint, request, jsonify
from models import db, Project, ProjectStatus, ProjectMilestone, ClassRoom, UserRole
from middleware import token_required, role_required

project_bp = Blueprint('project', __name__)

@project_bp.route('/api/lecturer/projects', methods=['POST'])
@token_required
@role_required([UserRole.LECTURER])
def create_project(current_user):
    data = request.get_json()
    new_project = Project(
        name=data['name'],
        description=data.get('description'),
        subject_id=data['subject_id'],
        owner_id=current_user.id,
        status=ProjectStatus.PENDING
    )
    db.session.add(new_project)
    db.session.flush() # Lấy ID để tạo milestones

    for m in data.get('milestones', []):
        milestone = ProjectMilestone(name=m['name'], project_id=new_project.id)
        db.session.add(milestone)
        
    db.session.commit()
    return jsonify({'message': 'Project submitted'}), 201

@project_bp.route('/api/head/projects/<int:id>/status', methods=['PUT'])
@token_required
@role_required([UserRole.HEAD_DEPARTMENT])
def approve_project(current_user, id):
    project = Project.query.get_or_404(id)
    status = request.get_json().get('status')
    if status == 'Approved': project.status = ProjectStatus.APPROVED
    elif status == 'Denied': project.status = ProjectStatus.DENIED
    else: return jsonify({'message': 'Invalid status'}), 400
    db.session.commit()
    return jsonify({'message': f'Project {status}'}), 200