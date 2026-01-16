import { useState } from "react";
import FileCard from "../../components/file/FileCard";
import FilePreviewModal from "../../components/file/FilePreviewModal";

const files = [
  { id: 1, name: "Proposal.pdf", type: "pdf", size: "1.2 MB" },
  { id: 2, name: "Report.docx", type: "doc", size: "2.8 MB" },
  { id: 3, name: "Architecture.png", type: "image", size: "900 KB" },
  { id: 4, name: "Meeting_Notes.txt", type: "text", size: "120 KB" },
];

export default function FileManager() {
  const [preview, setPreview] = useState(null);

  return (
    <>
      <div className="file-table">
        <div className="file-table-header">
          <span>Name</span>
          <span>Size</span>
          <span>Action</span>
        </div>

        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onPreview={() => setPreview(file)}
          />
        ))}
      </div>

      {preview && (
        <FilePreviewModal
          file={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
