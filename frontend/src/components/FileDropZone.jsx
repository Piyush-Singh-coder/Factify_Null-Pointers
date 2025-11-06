import { UploadCloud } from "lucide-react";
import { useState, useId } from "react";

const FileDropzone = ({ onFilesChange, multiple = false, accept = "*" }) => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const id = useId();

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setFiles(fileList);
    onFilesChange(fileList);
  };

  const handleDragEvents = (e, isDragging) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(isDragging);
  };

  const handleDrop = (e) => {
    handleDragEvents(e, false);
    const fileList = Array.from(e.dataTransfer.files);
    setFiles(fileList);
    onFilesChange(fileList);
  };

  return (
    <div
      className={`p-6 border-2 border-dashed rounded-xl transition-all duration-200 text-center cursor-pointer ${
        dragging
          ? "border-primary bg-primary/10"
          : "border-base-300 bg-base-100 hover:border-primary hover:bg-base-200"
      }`}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={`file-upload-${id}`}
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
      />
      <label
        htmlFor={`file-upload-${id}`}
        className="flex flex-col items-center space-y-2"
      >
        <UploadCloud className="w-10 h-10 text-gray-400" />
        <span className="font-semibold text-primary">Click to upload</span>
        <span className="text-sm text-gray-500">or drag and drop</span>
        {files.length > 0 && (
          <div className="mt-3 text-sm text-gray-700">
            {files.map((f) => f.name).join(", ")}
          </div>
        )}
      </label>
    </div>
  );
};

export default FileDropzone;
