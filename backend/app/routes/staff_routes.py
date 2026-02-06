from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.routes.auth_routes import get_current_user
from app.services import staff_service
from app.schemas.subject_schemas import SubjectOut, ClassOut, ClassCreate, SubjectUpdate, ClassUpdate
from app.schemas.user_schemas import UserOut
from app.models.base_models import User

from app.core.permissions import PermissionChecker, Permissions

router = APIRouter()

@router.post("/import-subjects", response_model=List[SubjectOut], dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def import_subjects(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """API nhập danh sách môn học từ file Excel. Yêu cầu quyền MANAGE_ACADEMIC_DATA."""
    return staff_service.import_subjects_from_excel(db, file)

@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return staff_service.get_subjects(db, skip, limit)

@router.get("/subjects/{subject_id}", response_model=SubjectOut)
def view_subject(subject_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return staff_service.get_subject(db, subject_id)

@router.put("/subjects/{subject_id}", response_model=SubjectOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def update_subject(subject_id: int, subject_in: SubjectUpdate, db: Session = Depends(get_db)):
    return staff_service.update_subject(db, subject_id, subject_in)

@router.delete("/subjects/{subject_id}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    staff_service.delete_subject(db, subject_id)
    return {"message": "Xóa môn học thành công"}

@router.post("/import-users/{role}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def import_users(role: str, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if role not in ["Lecturer", "Student"]:
        raise HTTPException(status_code=400, detail="Vai trò không hợp lệ để nhập")
    return staff_service.import_users_from_excel(db, file, role)

@router.post("/import-classes", response_model=List[ClassOut], dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def import_classes(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return staff_service.import_classes_from_excel(db, file)

@router.post("/import-class-members", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def import_class_members(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Import students into classes from Excel file"""
    from app.services.class_service import import_class_members_from_excel
    result = import_class_members_from_excel(db, file)
    return result

@router.get("/classes/me", response_model=List[ClassOut])
def get_my_classes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get classes for the current user based on their role"""
    from app.models.project_models import Class, ClassMember
    
    if current_user.role == "Lecturer":
        # Lecturers see classes they teach
        classes = db.query(Class).filter(Class.lecturer_id == current_user.id).all()
    elif current_user.role == "Student":
        # Students see classes they're enrolled in
        class_members = db.query(ClassMember).filter(ClassMember.user_id == current_user.id).all()
        class_ids = [cm.class_id for cm in class_members]
        classes = db.query(Class).filter(Class.id.in_(class_ids)).all() if class_ids else []
    else:
        # Staff/Admin/Head see all classes
        classes = db.query(Class).all()
    
    # Populate additional fields
    result = []
    for cls in classes:
        class_dict = {
            "id": cls.id,
            "name": cls.name,
            "lecturer_id": cls.lecturer_id,
            "created_at": cls.created_at,
            "code": f"CLS{cls.id:03d}",  # Generate code from ID
            "lecturer_name": cls.lecturer.full_name if cls.lecturer else "Unknown",
            "credits": 3,  # Default credits
            "syllabus": None  # TODO: Link to actual syllabus when available
        }
        result.append(class_dict)
    
    return result

@router.get("/classes", response_model=List[ClassOut], dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def list_classes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    from app.models.project_models import Class, ClassMember
    
    classes = db.query(Class).offset(skip).limit(limit).all()
    
    # Populate additional fields
    result = []
    for cls in classes:
        student_count = db.query(ClassMember).filter(ClassMember.class_id == cls.id).count()
        class_dict = {
            "id": cls.id,
            "name": cls.name,
            "lecturer_id": cls.lecturer_id,
            "created_at": cls.created_at,
            "code": f"CLS{cls.id:03d}",
            "lecturer_name": cls.lecturer.full_name if cls.lecturer else "Unknown",
            "credits": 3,
            "syllabus": None,
            "student_count": student_count
        }
        result.append(class_dict)
    
    return result

@router.get("/classes/{class_id}", response_model=ClassOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def view_class(class_id: int, db: Session = Depends(get_db)):
    return staff_service.get_class(db, class_id)

@router.get("/classes/{class_id}/students", response_model=List[UserOut], dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def get_class_students(class_id: int, db: Session = Depends(get_db)):
    """Get all students enrolled in a specific class"""
    from app.models.project_models import ClassMember
    
    # Get all class members for this class
    class_members = db.query(ClassMember).filter(ClassMember.class_id == class_id).all()
    
    # Get user details for each member
    student_ids = [cm.user_id for cm in class_members]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    
    return students

@router.get("/lecturer/classes/{class_id}/students", response_model=List[UserOut])
def get_lecturer_class_students(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all students enrolled in a specific class (for Lecturers of that class)"""
    from app.models.project_models import Class, ClassMember
    
    # Verify that the current user is a Lecturer
    if current_user.role != "Lecturer":
        raise HTTPException(status_code=403, detail="Chỉ Giảng viên mới có quyền truy cập")
    
    # Verify that this lecturer is assigned to this class
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    
    if class_obj.lecturer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không phải giảng viên của lớp này")
    
    # Get all class members for this class
    class_members = db.query(ClassMember).filter(ClassMember.class_id == class_id).all()
    
    # Get user details for each member
    student_ids = [cm.user_id for cm in class_members]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    
    return students

@router.get("/classes/{class_id}/available-students", response_model=List[UserOut])
def get_available_students(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all students enrolled in a specific class who are NOT yet in any team in THAT class"""
    from app.models.project_models import ClassMember, Team, TeamMember, Class
    
    # Security check
    if current_user.role == "Lecturer":
        cls = db.query(Class).filter(Class.id == class_id, Class.lecturer_id == current_user.id).first()
        if not cls:
            raise HTTPException(status_code=403, detail="Bạn không phải giảng viên của lớp này")
    elif current_user.role == "Student":
        membership = db.query(ClassMember).filter(ClassMember.class_id == class_id, ClassMember.user_id == current_user.id).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Bạn không thuộc lớp học này")
    
    # Staff/Admin logic: students NOT in any class
    if current_user.role in ["Admin", "Staff"]:
        enrolled_student_ids = [cm.user_id for cm in db.query(ClassMember).all()]
        available_students = db.query(User).filter(
            User.role == "Student",
            User.id.not_in(enrolled_student_ids) if enrolled_student_ids else True
        ).all()
        return available_students

    # Lecturer/Student logic: students in class but NOT in team
    # 1. Get all students enrolled in this class
    class_member_ids = [
        cm.user_id for cm in db.query(ClassMember).filter(ClassMember.class_id == class_id).all()
    ]
    
    if not class_member_ids:
        return []
    
    # 2. Get students already in a team in this class
    class_teams = db.query(Team).filter(Team.class_id == class_id).all()
    team_ids = [t.id for t in class_teams]
    
    assigned_student_ids = []
    if team_ids:
        assigned_student_ids = [
            tm.user_id for tm in db.query(TeamMember).filter(TeamMember.team_id.in_(team_ids)).all()
        ]
    
    # 3. Filter class members who are not assigned to any team
    available_student_ids = [uid for uid in class_member_ids if uid not in assigned_student_ids]
    
    if not available_student_ids:
        return []
        
    available_students = db.query(User).filter(User.id.in_(available_student_ids)).all()
    return available_students

@router.put("/classes/{class_id}", response_model=ClassOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def update_class(class_id: int, class_in: ClassUpdate, db: Session = Depends(get_db)):
    return staff_service.update_class(db, class_id, class_in)

@router.delete("/classes/{class_id}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def delete_class(class_id: int, db: Session = Depends(get_db)):
    staff_service.delete_class(db, class_id)
    return {"message": "Xóa lớp học thành công"}

@router.post("/classes", response_model=ClassOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def create_class(class_in: ClassCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return staff_service.create_class(db, class_in.name, class_in.lecturer_id)

@router.post("/classes/{class_id}/add-student/{student_id}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def add_student(class_id: int, student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return staff_service.add_student_to_class(db, class_id, student_id)

@router.delete("/classes/{class_id}/remove-student/{student_id}", dependencies=[Depends(PermissionChecker(Permissions.MANAGE_ACADEMIC_DATA))])
def remove_student(class_id: int, student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Remove a student from a class"""
    from app.models.project_models import ClassMember
    
    # Find the enrollment
    enrollment = db.query(ClassMember).filter(
        ClassMember.class_id == class_id,
        ClassMember.user_id == student_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Sinh viên không có trong lớp này")
    
    db.delete(enrollment)
    db.commit()
    
    return {"message": "Đã xóa sinh viên khỏi lớp"}

@router.post("/classes/{class_id}/enroll")
def enroll_in_class(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """API cho phép sinh viên tự đăng ký vào một lớp học."""
    from app.models.project_models import Class, ClassMember
    
    # Check if user is a student
    if current_user.role != "Student":
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới có thể đăng ký lớp học")
    
    # Check if class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    
    # Check if already enrolled
    existing = db.query(ClassMember).filter(
        ClassMember.class_id == class_id,
        ClassMember.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Bạn đã đăng ký lớp học này rồi")
    
    # Enroll student
    member = ClassMember(class_id=class_id, user_id=current_user.id)
    db.add(member)
    db.commit()
    
    return {"message": "Đăng ký lớp học thành công!", "class_name": class_obj.name}

@router.delete("/classes/{class_id}/unenroll")
def unenroll_from_class(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Allow students to unenroll from a class"""
    from app.models.project_models import ClassMember
    
    # Check if user is a student
    if current_user.role != "Student":
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới có thể hủy đăng ký lớp học")
    
    # Find enrollment
    enrollment = db.query(ClassMember).filter(
        ClassMember.class_id == class_id,
        ClassMember.user_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Bạn chưa đăng ký lớp học này")
    
    # Remove enrollment
    db.delete(enrollment)
    db.commit()
    
    return {"message": "Đã hủy đăng ký lớp học"}

@router.get("/classes/available", response_model=List[ClassOut])
def get_available_classes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all available classes for enrollment (for students)"""
    from app.models.project_models import Class, ClassMember
    
    # Get all classes
    all_classes = db.query(Class).all()
    
    # Get classes the student is already enrolled in
    if current_user.role == "Student":
        enrolled_class_ids = [
            cm.class_id for cm in db.query(ClassMember).filter(ClassMember.user_id == current_user.id).all()
        ]
    else:
        enrolled_class_ids = []
    
    # Populate class data
    result = []
    for cls in all_classes:
        student_count = db.query(ClassMember).filter(ClassMember.class_id == cls.id).count()
        class_dict = {
            "id": cls.id,
            "name": cls.name,
            "lecturer_id": cls.lecturer_id,
            "created_at": cls.created_at,
            "code": f"CLS{cls.id:03d}",
            "lecturer_name": cls.lecturer.full_name if cls.lecturer else "Unknown",
            "credits": 3,
            "syllabus": None,
            "student_count": student_count,
            "is_enrolled": cls.id in enrolled_class_ids
        }
        result.append(class_dict)
    
    return result

@router.get("/users", response_model=List[UserOut], dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return staff_service.get_users(db, skip, limit)

@router.post("/users/{user_id}/toggle-status", response_model=UserOut, dependencies=[Depends(PermissionChecker(Permissions.MANAGE_USERS))])
def toggle_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới có quyền khóa/mở tài khoản")
    return staff_service.toggle_user_status(db, user_id)
