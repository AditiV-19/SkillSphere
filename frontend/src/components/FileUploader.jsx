import { useState } from "react";
import { Paperclip, Trash2, FileText, UploadCloud, FileArchive } from "lucide-react";

export default function FileUploader({ attachments, setAttachments }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setAttachments((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removeStagedFile = (idxToRemove) => {
    setAttachments(attachments.filter((_, idx) => idx !== idxToRemove));
  };

  // Helper to dynamically display correct file icon shapes
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    if (ext === 'zip' || ext === 'rar') return <FileArchive size={16} className="text-amber-500 shrink-0" />;
    return <FileText size={16} className="text-blue-500 shrink-0" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
        <Paperclip size={18} className="text-blue-600" />
        <h2 className="font-bold text-base tracking-tight">Project Documentation</h2>
      </div>

      {/* Drag & Drop Zone Container */}
      <label 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer text-center ${
          isDragActive 
            ? "border-blue-500 bg-blue-50/30 ring-4 ring-blue-50" 
            : "border-slate-200 bg-slate-50/50 hover:border-blue-500 hover:bg-white"
        }`}
      >
        <UploadCloud className={`mb-2 transition ${isDragActive ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-blue-500"}`} size={32} />
        <span className="text-sm font-bold text-slate-700">
          {isDragActive ? "Drop files here instantly" : "Upload assignment briefs or media"}
        </span>
        <span className="text-xs text-slate-400 mt-1">PDF, DOCX, PNG, JPG, or ZIP up to 10MB</span>
        <input 
          type="file" 
          multiple 
          accept=".pdf,.docx,.doc,.zip,.rar,.png,.jpg,.jpeg"
          onChange={handleFileChange} 
          className="hidden" 
        />
      </label>

      {/* Uploaded File Feed Indicator List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs transition hover:bg-slate-100/50">
              <div className="flex items-center gap-2.5 font-semibold text-slate-600 min-w-0">
                {getFileIcon(file.name || file.url)}
                <span className="truncate">{file.name || "Cloud Document"}</span>
              </div>
              <button
                type="button"
                onClick={() => removeStagedFile(index)}
                className="text-slate-400 hover:text-rose-600 transition shrink-0 p-1"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}