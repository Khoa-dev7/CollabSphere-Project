import ErrorLayout from "../components/ErrorLayout";

export default function ServerError() {
  return (
    <ErrorLayout
      code="500"
      title="Lỗi hệ thống"
      message="Đã có lỗi xảy ra. Vui lòng thử lại sau."
    />
  );
}
