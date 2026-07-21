import { FileText } from "lucide-react";

export default function DocumentViewer({ documentType, url }) {
  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="border rounded-lg p-4 bg-white mb-4">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-700">
        <FileText className="w-4 h-4" />
        {documentType} Document
      </h4>

      <div className="overflow-hidden rounded border border-slate-200 bg-slate-100 flex justify-center">
        {isPdf ? (
          <iframe
            src={url}
            title={`${documentType} Viewer`}
            className="w-full h-96"
            frameBorder="0"
          />
        ) : (
          <img
            src={url}
            alt={documentType}
            className="max-w-full h-auto max-h-96 object-contain"
          />
        )}
      </div>
      
      <div className="mt-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Open original {documentType} file in new tab
        </a>
      </div>
    </div>
  );
}