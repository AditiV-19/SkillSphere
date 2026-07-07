import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/api.js";

import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ProfileHeader from "../../components/profile/ProfileHeader";
import SectionCard from "../../components/profile/SectionCard";
import EditProfileModal from "./EditProfileModal.jsx";

import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Users,
  Sparkles,
  BarChart3,
  Star,
} from "lucide-react";

export default function ClientProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const handleSubmit = async (formData) => {
    try {
      const response = await updateProfile(formData, "client");

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
      const response = await getProfile("client");

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

  const location = profile.location || {};
  const contactPerson = profile.contactPerson || {};
  const portfolio = profile.portfolio || {};
  const socials = profile.socials || {};
  const hiringPreferences = profile.hiringPreferences || {};
  const stats = profile.stats || {};

  const locationLine = [location.address, location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

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
                {profile.companyDescription || "No description added yet."}
              </p>
            </SectionCard>

            <SectionCard icon={Building2} title="Company Details">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-slate-400">Company type</p>
                  <p className="font-medium text-slate-900">
                    {profile.companyType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Industry</p>
                  <p className="font-medium text-slate-900">
                    {profile.industry || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Founded</p>
                  <p className="font-medium text-slate-900">
                    {profile.foundedYear || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Company size</p>
                  <p className="font-medium text-slate-900">
                    {profile.companySize ? `${profile.companySize} employees` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <span
                    className={`inline-block mt-0.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      profile.isHiring
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {profile.isHiring ? "Currently hiring" : "Not hiring"}
                  </span>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Phone} title="Contact Person">
              {contactPerson.name ||
              contactPerson.email ||
              contactPerson.phone ? (
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-slate-900">
                    {contactPerson.name || "—"}
                    {contactPerson.designation && (
                      <span className="font-normal text-slate-500">
                        {" "}
                        · {contactPerson.designation}
                      </span>
                    )}
                  </h3>
                  {contactPerson.email && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {contactPerson.email}
                    </p>
                  )}
                  {contactPerson.phone && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {contactPerson.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No contact person added yet.
                </p>
              )}
            </SectionCard>

            <SectionCard icon={MapPin} title="Location">
              {locationLine ? (
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {locationLine}
                </p>
              ) : (
                <p className="text-sm text-slate-400">No location added yet.</p>
              )}
            </SectionCard>
          </div>

          {/* right column */}
          <div className="space-y-6">
            <SectionCard icon={Users} title="Hiring Preferences">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Remote only</span>
                  <span className="font-medium text-slate-900">
                    {hiringPreferences.remoteOnly ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Preferred level</span>
                  <span className="font-medium text-slate-900">
                    {hiringPreferences.preferredExperienceLevel || "Any"}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 mb-1.5">Preferred languages</p>
                  {hiringPreferences.preferredLanguages?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {hiringPreferences.preferredLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">None specified.</p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Links">
              <div className="space-y-2">
                {portfolio.website && (
                  <a
                    href={portfolio.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
                {portfolio.linkedin && (
                  <a
                    href={portfolio.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaLinkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaTwitter className="w-4 h-4" /> Twitter / X
                  </a>
                )}
                {socials.github && (
                  <a
                    href={socials.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaGithub className="w-4 h-4" /> GitHub
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaInstagram className="w-4 h-4" /> Instagram
                  </a>
                )}
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <FaFacebook className="w-4 h-4" /> Facebook
                  </a>
                )}
                {!portfolio.website &&
                  !portfolio.linkedin &&
                  !socials.twitter &&
                  !socials.github &&
                  !socials.instagram &&
                  !socials.facebook && (
                    <p className="text-sm text-slate-400">
                      No links added yet.
                    </p>
                  )}
              </div>
            </SectionCard>

            <SectionCard icon={BarChart3} title="Stats">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                <div>
                  <p className="text-slate-400">Gigs posted</p>
                  <p className="font-semibold text-slate-900">
                    {stats.gigsPosted ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Active projects</p>
                  <p className="font-semibold text-slate-900">
                    {stats.activeProjects ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Completed projects</p>
                  <p className="font-semibold text-slate-900">
                    {stats.completedProjects ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Freelancers hired</p>
                  <p className="font-semibold text-slate-900">
                    {stats.freelancersHired ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Total spent</p>
                  <p className="font-semibold text-slate-900">
                    ${(stats.totalSpent ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Repeat hires</p>
                  <p className="font-semibold text-slate-900">
                    {stats.repeatHires ?? 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-900">
                  {profile.averageRating?.toFixed(1) ?? "0.0"}
                </span>
                <span className="text-sm text-slate-400">
                  ({profile.totalReviews ?? 0} reviews)
                </span>
              </div>
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