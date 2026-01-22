from flask import Blueprint, request, jsonify
from models import db, User, UserRole
from extensions import db
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'collabsphere_secret_key_123')

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    try:
        role = UserRole(data.get('role', 'Student'))
    except ValueError:
        return jsonify({'message': 'Invalid role'}), 400

    new_user = User(username=data['username'], email=data['email'], role=role)
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'role': user.role.value,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY, algorithm="HS256")
    
    return jsonify({'token': token, 'user': user.to_dict()}), 200