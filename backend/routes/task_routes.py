from flask import Blueprint, request, jsonify
from models import db, Task, TaskColumn, Attachment, UserRole
from middleware import token_required, role_required
from utils.file_manager import save_file, delete_physical_file

task_bp = Blueprint('task', __name__)

# Lấy dữ liệu Kanban Board
@task_bp.route('/api/teams/<int:team_id>/board', methods=['GET'])
@token_required
def get_board(current_user, team_id):
    columns = TaskColumn.query.filter_by(team_id=team_id).order_by(TaskColumn.position).all()
    # Nếu chưa có cột, tạo mặc định
    if not columns:
        cols = ['To Do', 'In Progress', 'Done']
        for i, name in enumerate(cols):
            db.session.add(TaskColumn(name=name, team_id=team_id, position=i))
        db.session.commit()
        columns = TaskColumn.query.filter_by(team_id=team_id).order_by(TaskColumn.position).all()
    return jsonify([c.to_dict() for c in columns]), 200

# Tạo Task mới
@task_bp.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    data = request.get_json()
    new_task = Task(
        title=data['title'],
        column_id=data['column_id'],
        creator_id=current_user.id,
        assignee_id=data.get('assignee_id')
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

# Di chuyển Task (Kéo thả)
@task_bp.route('/api/tasks/<int:task_id>/move', methods=['PUT'])
@token_required
def move_task(current_user, task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    # Cập nhật vị trí mới
    task.column_id = data.get('target_column_id', task.column_id)
    task.position = data.get('new_position', task.position)
    
    db.session.commit()
    return jsonify({'message': 'Task moved'}), 200

# Upload file đính kèm vào Task
@task_bp.route('/api/tasks/<int:task_id>/attachments', methods=['POST'])
@token_required
def upload_attachment(current_user, task_id):
    if 'file' not in request.files: return jsonify({'message': 'No file'}), 400
    
    file = request.files['file']
    filename, path = save_file(file)
    
    if filename:
        att = Attachment(filename=filename, file_path=path, task_id=task_id, uploader_id=current_user.id)
        db.session.add(att)
        db.session.commit()
        return jsonify(att.to_dict()), 201
    return jsonify({'message': 'Upload failed'}), 400
# ... (Giữ nguyên các API move_task, upload_attachment cũ)

# ==========================================
# DOWNLOAD FILE
# ==========================================
@task_bp.route('/api/attachments/<int:attachment_id>', methods=['GET'])
@token_required
def download_attachment(current_user, attachment_id):
    attachment = Attachment.query.get_or_404(attachment_id)
    
    # Kiểm tra file có tồn tại trên ổ cứng không
    if not os.path.exists(attachment.file_path):
        return jsonify({'message': 'File not found on server'}), 404

    # Trả về file cho trình duyệt tải xuống
    return send_file(
        attachment.file_path,
        as_attachment=True,
        download_name=attachment.filename
    )

# ==========================================
# DELETE FILE (Xóa file đính kèm)
# ==========================================
@task_bp.route('/api/attachments/<int:attachment_id>', methods=['DELETE'])
@token_required
def delete_attachment(current_user, attachment_id):
    attachment = Attachment.query.get_or_404(attachment_id)
    
    # Chỉ người upload hoặc Giảng viên mới được xóa
    if attachment.uploader_id != current_user.id and current_user.role != UserRole.LECTURER:
        return jsonify({'message': 'Permission denied'}), 403

    # 1. Xóa file vật lý trước (Dọn rác)
    delete_physical_file(attachment.file_path)

    # 2. Xóa dữ liệu trong Database
    db.session.delete(attachment)
    db.session.commit()
    
    return jsonify({'message': 'File deleted successfully'}), 200