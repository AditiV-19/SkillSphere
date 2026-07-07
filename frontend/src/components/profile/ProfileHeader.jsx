import { FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

import React, { useState } from "react";
import { MapPin, Phone } from "lucide-react";

export default function ProfileHeader({ isEditing, setIsEditing, profile }) {
  const initials = () => {
    if (profile?.profilePicture) return profile.profilePicture;

    const first = profile?.firstName || "";
    const last = profile?.lastName || "";
    const username = profile?.user?.username || "";

    return (
      `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() ||
      username.charAt(0).toUpperCase() ||
      "U"
    );
  };
  const availabilityStyles = {
    available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    busy: "bg-amber-50 text-amber-700 ring-amber-600/20",
    unavailable: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Picture */}
        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md shrink-0">
          {profile.profilePicture ? (
            <img
               src={profile.profilePicture}
               alt="Profile"
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
                {profile.firstName} {profile.lastName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${
                  availabilityStyles[profile.availability?.status] ||
                  availabilityStyles.Available
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {profile.availability?.status}
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">{profile.headline}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition font-medium"
          onClick={() => setIsEditing(true)}
        >
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
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
