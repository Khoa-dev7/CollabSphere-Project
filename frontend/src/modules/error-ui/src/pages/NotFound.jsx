import ErrorLayout from "../components/ErrorLayout";

export default function NotFound() {
  return (
    <ErrorLayout
      code="404"
      title="Không tìm thấy trang"
      message="Trang bạn truy cập không tồn tại."
    />
  );
}
