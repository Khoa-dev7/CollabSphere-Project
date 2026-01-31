export default function FilePreviewModal({ file, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>File Preview</h3>

        <p><b>Name:</b> {file.name}</p>
        <p><b>Type:</b> {file.type}</p>
        <p><b>Size:</b> {file.size}</p>

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
