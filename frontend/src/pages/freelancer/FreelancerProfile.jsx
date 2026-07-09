import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/api.js";

import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ProfileHeader from "../../components/profile/ProfileHeader";
import SectionCard from "../../components/profile/SectionCard";
import EditProfileModal from "./EditProfileModal";

import { FaBriefcase, FaGithub, FaLinkedin } from "react-icons/fa";
import {
  Pencil,
  X,
  Plus,
  Trash2,
  MapPin,
  Phone,
  Calendar,
  Globe,
  FileText,
  Briefcase,
  GraduationCap,
  Languages as LanguagesIcon,
  Sparkles,
  Camera,
  Save,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Present";
  const d = new Date(date);
  if (isNaN(d)) return "Present";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function FreelancerProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const handleBooking = async (slot) => {
    try {
      // 1. Call your API to update the booking status
      // await updateProfile({
      //   action: 'bookSlot',
      //   slotId: slot._id // Make sure your slot object has an _id
      // });

      // 2. Refresh the profile data to show the updated UI
      // await fetchProfile();

      alert("Slot booked successfully!");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Could not book the slot. It might already be taken.");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const response = await updateProfile(formData, profile.user?.role);

      console.log("UPDATED PROFILE:", response.data);

      setProfile(response.data);

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error.response?.data || error.message);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile('freelancer');

      setProfile(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="p-10">Loading...</div>;
  }
  return (
    <>
      <div className="space-y-8">
        <ProfileHeader
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          profile={profile}
        />
        {/* content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* left column */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard icon={Sparkles} title="About">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {profile.about || "No description added yet."}
              </p>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Experience">
              {profile.experience?.length ? (
                <ul className="relative border-l-2 border-blue-200 ml-1.5">
                  {profile.experience.map((exp, i) => (
                    <li
                      key={i}
                      className={`relative pl-6 ${
                        i !== profile.experience.length - 1 ? "pb-8" : ""
                      }`}
                    >
                      <span className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <h3 className="font-semibold text-slate-900">
                        {exp.jobTitle}
                      </h3>
                      <p className="text-sm text-slate-600">{exp.company}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(exp.startDate)} —{" "}
                        {exp.currentlyWorking
                          ? "Present"
                          : formatDate(exp.endDate)}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-slate-600 mt-1.5">
                          {exp.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No experience added yet.
                </p>
              )}
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Education">
              {profile.education?.length ? (
                <ul className="relative border-l-2 border-blue-200 ml-1.5">
                  {profile.education.map((edu, i) => (
                    <li
                      key={i}
                      className={`relative pl-6 ${
                        i !== profile.education.length - 1 ? "pb-8" : ""
                      }`}
                    >
                      <span className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />

                      <h3 className="font-semibold text-slate-900">
                        {edu.degree}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {edu.institute}
                        {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {edu.startYear} — {edu.endYear || "Present"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 mt-1.5">
                  No education added yet.
                </p>
              )}
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Certifications">
              {profile.certifications?.length ? (
                <ul className="relative border-l-2 border-blue-200 ml-1.5">
                  {profile.certifications.map((cert, i) => (
                    <li
                      key={i}
                      className="flex gap-4"
                      className={`relative pl-6 ${
                        i !== profile.education.length - 1 ? "pb-8" : ""
                      }`}
                    >
                      <span className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />

                      <div className="flex flex-col items-center pt-1">
                        {i !== profile.certifications.length - 1 && (
                          <div className="w-px flex-1 bg-blue-100 mt-1" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-s text-slate-400 mt-1">
                          {formatDate(cert.issueDate)}
                        </p>
                        <h3 className="font-semibold text-slate-900">
                          {cert.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {cert.issuedBy}
                        </p>

                        {cert.certificateUrl && (
                          <p className="text-sm text-slate-600 mt-1.5">
                            {cert.certificateUrl}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No certifications added yet.
                </p>
              )}
            </SectionCard>
          </div>

          {/* right column */}
          <div className="space-y-6">
            <SectionCard title="Skills">
              {profile.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill._id || skill.name}
                      className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {skill.name} • {skill.proficiency} •{" "}
                      {skill.yearsOfExperience} yrs
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No skills added yet.</p>
              )}
            </SectionCard>

            <SectionCard icon={LanguagesIcon} title="Languages">
              {profile.languages?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang) => (
                    <span
                      key={lang}
                      className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No languages added yet.
                </p>
              )}
            </SectionCard>

            <SectionCard title="Portfolio">
              <div className="space-y-2">
                {profile.portfolio?.github && (
                  <a
                    href={profile.portfolio.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaGithub className="w-4 h-4" /> GitHub
                  </a>
                )}
                {profile.portfolio?.linkedin && (
                  <a
                    href={profile.portfolio.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaLinkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile.portfolio?.website && (
                  <a
                    href={profile.portfolio.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
                {profile.portfolio?.resume && (
                  <a
                    href={profile.portfolio.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4" /> Resume
                  </a>
                )}
                {!profile.portfolio?.github &&
                  !profile.portfolio?.linkedin &&
                  !profile.portfolio?.website &&
                  !profile.portfolio?.resume && (
                    <p className="text-sm text-slate-400">
                      No links added yet.
                    </p>
                  )}
              </div>
            </SectionCard>

            <SectionCard icon={Calendar} title="Book Slots">
              {profile.availability.slots?.length > 0 ? (
                <div className="space-y-2">
                  {profile.availability.slots.map((slot, index) => {
                    const startDate = new Date(slot.startTime);
                    const endDate = new Date(slot.endTime);

                    const start = new Date(slot.startTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" },
                    );
                    const end = new Date(slot.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
                      >
                        {/* Time Display */}
                        <span
                          className={`text-sm font-medium ${slot.isBooked ? "text-slate-400" : "text-slate-700"}`}
                        >
                          {startDate.toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {endDate.toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          <br />
                          {start} - {end}
                        </span>

                        {/* Status and Action */}
                        {slot.isBooked ? (
                          <span className="bg-red-100 text-red-500 text-xs font-bold px-3 py-1 rounded-full">
                            Booked
                          </span>
                        ) : profile.user.role === "client" ? (
                          <span className="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                            Your Slot
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBooking(slot)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-1.5 rounded-md transition-colors"
                          >
                            Book Now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No slots available.</p>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditing(false)}
          onSave={handleSubmit}
        />
      )}
    </>
  );
}
