from flask import Blueprint, request, jsonify
from models import db, Rubric, RubricItem, Project, UserRole
from middleware import token_required, role_required

rubric_bp = Blueprint('rubric', __name__)

@rubric_bp.route('/api/projects/<int:project_id>/rubric', methods=['POST'])
@token_required
@role_required([UserRole.LECTURER])
def create_rubric(current_user, project_id):
    data = request.get_json()
    rubric = Rubric(name=data['name'], project_id=project_id)
    db.session.add(rubric)
    db.session.flush()
    
    for item in data.get('items', []):
        ri = RubricItem(criteria=item['criteria'], max_score=item['max_score'], rubric_id=rubric.id)
        db.session.add(ri)
    
    db.session.commit()
    return jsonify(rubric.to_dict()), 201