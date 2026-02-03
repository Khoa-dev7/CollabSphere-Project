export default function FileCard({ file, onPreview }) {
  const icon =
    file.type === "pdf"
      ? "📄"
      : file.type === "doc"
      ? "📘"
      : file.type === "image"
      ? "🖼️"
      : "📁";

  return (
    <div className="file-row">
      <span className="file-name">
        {icon} {file.name}
      </span>
      <span>{file.size}</span>
      <span className="actions">
        <button onClick={onPreview}>Preview</button>
        <button className="download">Download</button>
      </span>
    </div>
  );
}
