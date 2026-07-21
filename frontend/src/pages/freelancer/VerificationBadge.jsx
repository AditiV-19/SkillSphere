import { useRef, useState } from "react";
import {
  BadgeCheck,
  Mail,
  Phone,
  IdCard,
  Award,
  Lock,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react";

/**
 * BADGE_CONFIG maps the UI labels to the exact strings expected 
 * in the backend `verification.badges` array.
 */
const BADGE_CONFIG = {
  id: {
    label: "ID Verified",
    backendString: "Identity Verified",
    icon: IdCard,
    editable: true, // Allows file upload
    helperText: "Upload a government ID for an admin to review.",
  },
  skill: {
    label: "Skill Verified",
    backendString: "Skill Certified", 
    icon: Award,
    editable: false,
    helperText: "Granted by an admin after reviewing your completed work.",
  },
};

export default function VerificationBadge({
  verification,
  onUploadId,
  uploadingId = false,
}) {
  const entries = Object.entries(BADGE_CONFIG);
  const fileInputRef = useRef(null);
  const [localError, setLocalError] = useState("");

  const status = verification?.status || "unverified";
  const idIsPending = status === "pending";
  const idIsRejected = status === "rejected";
  
  // Safely fallback to an empty array if badges don't exist yet
  const earnedBadges = verification?.badges || [];

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; 
    if (!file) return;

    // 5MB limit check
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("File must be under 5MB.");
      return;
    }
    setLocalError("");
    
    // Pass the file up to the parent component to handle the API call
    onUploadId?.(file);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {entries.map(([key, cfg]) => {
        // Check if the array includes the specific badge string
        const isVerified = earnedBadges.includes(cfg.backendString);
        const Icon = cfg.icon;
        const isIdBadge = key === "id";

        return (
          <div
            key={key}
            className={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${
              isVerified
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : isIdBadge && idIsPending
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : isIdBadge && idIsRejected
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {isVerified ? (
                <Icon className="w-5 h-5 shrink-0" />
              ) : isIdBadge && idIsPending ? (
                <Clock className="w-5 h-5 shrink-0" />
              ) : isIdBadge && idIsRejected ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 shrink-0" />
              )}
              <span className="font-semibold text-gray-900">{cfg.label}</span>
              {isVerified && (
                <BadgeCheck className="w-5 h-5 ml-auto text-emerald-600 shrink-0" />
              )}
            </div>

            {/* Status / helper text */}
            <div className="text-sm mt-1">
              {isIdBadge && idIsPending && !isVerified && (
                <p>Submitted — awaiting admin review.</p>
              )}
              {isIdBadge && idIsRejected && !isVerified && (
                <p>
                  {verification?.rejectionReason || "Your document was rejected."}{" "}
                  Please re-upload.
                </p>
              )}
              {!isVerified && !(isIdBadge && (idIsPending || idIsRejected)) && (
                <p>{cfg.helperText}</p>
              )}
            </div>

            {/* Upload/resubmit control for the ID badge */}
            {isIdBadge && cfg.editable && !isVerified && !idIsPending && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingId}
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingId
                    ? "Uploading..."
                    : idIsRejected
                    ? "Re-upload ID"
                    : "Upload ID"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFilePicked}
                />
                {localError && (
                  <p className="text-sm font-medium text-red-600 mt-2">{localError}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}