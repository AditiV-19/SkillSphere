import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

import React, { useState } from "react";
import { MapPin, Phone } from "lucide-react";

export default function ProfileHeader({ isEditing, setIsEditing, profile, isShow}) {

  const user = localStorage.getItem('user')? JSON.parse(localStorage.getItem("user"))
  : null;

  const locationText =
    typeof profile.location === "string"
      ? profile.location
      : [
          profile.location?.city,
          profile.location?.state,
          profile.location?.country,
        ]
          .filter(Boolean)
          .join(", ");

  const phoneText = profile.phone || profile.contactPerson?.phone;

  // Freelancers store their photo in `profilePicture`; clients store their
  // logo in `companyLogo`. Prefer whichever one is actually present.
  const displayImage = profile.profilePicture || profile.companyLogo;

  // Freelancers show a person's name; clients show the company name.
  const displayName =
    profile.firstName || profile.lastName
      ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
      : profile.companyName;

  // Freelancers show their headline; clients show industry / company type.
  const displayTagline =
    profile.headline ||
    [profile.industry, profile.companyType].filter(Boolean).join(" · ");

  const initials = () => {
    if (profile?.firstName || profile?.lastName) {
      const first = profile?.firstName || "";
      const last = profile?.lastName || "";
      const combined = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
      if (combined) return combined;
    }

    if (profile?.companyName) {
      return profile.companyName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    }

    const username = profile?.user?.username || "";
    return username.charAt(0).toUpperCase() || "U";
  };

  const availabilityStyles = {
    Available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Busy: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Unavailable: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Picture / Company Logo */}
        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-blue-700">
              {initials()}
            </span>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {displayName}
              </h1>
              {profile.availability?.status && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${
                    availabilityStyles[profile.availability?.status] ||
                    availabilityStyles.Available
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {profile.availability?.status}
                </span>
              )}
              {profile.isHiring !== undefined && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${
                    profile.isHiring
                      ? availabilityStyles.Available
                      : availabilityStyles.Unavailable
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {profile.isHiring ? "Hiring" : "Not hiring"}
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-0.5">{displayTagline}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              {locationText && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {locationText}
                </span>
              )}
              {phoneText && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {phoneText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        { isShow && (<button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition font-medium"
          onClick={() => setIsEditing(true)}
        >
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>)
        }
        
      </div>

      {/* Completion Bar */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-slate-700">Profile completion</span>
          <span className="font-bold text-blue-700">
            {profile.profileCompletion}%
          </span>
        </div>
        <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${profile.profileCompletion}%` }}
          />
        </div>
      </div>
    </div>
  );
}