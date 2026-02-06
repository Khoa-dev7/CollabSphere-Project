import sys
import os
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.models.eval_models import Rubric, RubricCriteria, RubricAssessment, RubricAssessmentItem
from app.services import eval_service
from app.models.base_models import User

db = SessionLocal()

def test_grading():
    try:
        # 1. Create a dummy Rubric
        rubric = Rubric(title="Test Rubric", subject_id=1) 
        db.add(rubric)
        db.commit()
        db.refresh(rubric)
        print(f"Đã tạo Rubric: {rubric.title} (ID: {rubric.id})")
        
        # 2. Add Criteria
        # C1: Weight 0.4
        c1 = RubricCriteria(rubric_id=rubric.id, title="Criteria A", weight=0.4, max_score=10.0)
        # C2: Weight 0.6
        c2 = RubricCriteria(rubric_id=rubric.id, title="Criteria B", weight=0.6, max_score=10.0)
        db.add_all([c1, c2])
        db.commit()
        print("Đã thêm Tiêu chí.")
        
        # 3. Create Assessment
        # Need a valud evaluator? Use admin (ID 1)
        if not evaluator:
             print("Không tìm thấy Admin, việc tạo người đánh giá giả lập là không cần thiết nếu DB FK không nghiêm ngặt hoặc sử dụng ID 1")
             # Assuming ID 1 exists
        
        assessment = RubricAssessment(
            rubric_id=rubric.id,
            evaluator_id=1, # Assume admin
             # Target can be anything, keeping null for unit test logic
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        print(f"Đã tạo Đánh giá ID: {assessment.id}")
        
        # 4. Add Items
        # Item 1: Score 8
        i1 = RubricAssessmentItem(assessment_id=assessment.id, criteria_id=c1.id, score=8.0)
        # Item 2: Score 9
        i2 = RubricAssessmentItem(assessment_id=assessment.id, criteria_id=c2.id, score=9.0)
        db.add_all([i1, i2])
        db.commit()
        print("Đã thêm các tiêu chí: 8.0 (w=0.4) và 9.0 (w=0.6)")
        
        # 5. Tính điểm
        print("Đang tính điểm...")
        updated_assessment = eval_service.calculate_final_score(db, assessment.id)
        
        print(f"Điểm cuối cùng: {updated_assessment.total_score}")
        expected = (8.0 * 0.4) + (9.0 * 0.6)
        print(f"Kỳ vọng: {expected}")
        
        if abs(updated_assessment.total_score - expected) < 0.01:
            print("KIỂM TRA THÀNH CÔNG!")
        else:
            print("KIỂM TRA THẤT BẠI!")
            
    except Exception as e:
        print(f"Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup?
        pass

if __name__ == "__main__":
    test_grading()
