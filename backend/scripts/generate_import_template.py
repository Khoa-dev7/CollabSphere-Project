import pandas as pd
import os

def generate_template():
    # Define data for Students sheet
    students_data = {
        'username': ['sv001', 'sv002', 'sv003'],
        'email': ['student1@example.com', 'student2@example.com', 'student3@example.com'],
        'full_name': ['Nguyen Van A', 'Tran Thi B', 'Le Van C'],
        'password': ['123456', '123456', '123456']
    }
    
    df_students = pd.DataFrame(students_data)
    
    # Define data for Instructions sheet
    instructions_data = {
        'Column': ['username', 'email', 'full_name', 'password'],
        'Description': [
            'Mã sinh viên hoặc tên đăng nhập (Bắt buộc, Duy nhất)',
            'Email của sinh viên (Bắt buộc, Duy nhất)',
            'Họ và tên đầy đủ của sinh viên (Tùy chọn)',
            'Mật khẩu mặc định cho tài khoản mới (Tùy chọn)'
        ],
        'Example': ['B20DCCN001', 'b20dccn001@student.ptit.edu.vn', 'Nguyen Van An', 'password123']
    }
    
    df_instructions = pd.DataFrame(instructions_data)
    
    # Create Excel writer object
    # Save to frontend/public so it can be downloaded via browser
    output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'frontend', 'public', 'class_import_template.xlsx')
    
    try:
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            df_students.to_excel(writer, sheet_name='Students', index=False)
            df_instructions.to_excel(writer, sheet_name='Instructions', index=False)
            
            # Auto-adjust columns width (basic approximation)
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                for column in worksheet.columns:
                    max_length = 0
                    column = [cell for cell in column]
                    try:
                        max_length = max(len(str(cell.value)) for cell in column)
                        adjusted_width = (max_length + 2)
                        worksheet.column_dimensions[column[0].column_letter].width = adjusted_width
                    except:
                        pass
                        
        print(f"Successfully created template at: {os.path.abspath(output_path)}")
    except Exception as e:
        print(f"Error creating template: {str(e)}")

if __name__ == "__main__":
    generate_template()
