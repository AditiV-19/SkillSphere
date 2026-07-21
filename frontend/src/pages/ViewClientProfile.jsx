import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClientProfile, getReviewAnalytics } from "../services/api"; 

import DashboardLayout from "../components/dashboard/DashboardLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import SectionCard from "../components/profile/SectionCard";
import ReviewAnalytics from "../components/ReviewAnalytics";

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
} from "lucide-react";

export default function ViewClientProfile() {
  const { id } = useParams(); // Client Profile ID from URL
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getClientProfile(id);
      
      if (response.data.success) {
        const profileData = response.data.client;
        setProfile(profileData);

        // Safely get user ID whether it's populated or just a string reference
        const userId = profileData.user?._id || profileData.user;

        if (userId) {
          try {
            const analyticsResponse = await getReviewAnalytics(userId);
            setAnalytics(analyticsResponse.data.analytics);
          } catch (analyticsErr) {
            console.error("Failed to fetch analytics:", analyticsErr);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching client profile:", err);
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 mt-6 max-w-3xl mx-auto">
          <p className="font-semibold">{error || "Profile not found"}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Safe data extraction matching your ClientProfile structure
  const location = profile.location || {};
  const contactPerson = profile.contactPerson || {};
  const portfolio = profile.portfolio || {};
  const socials = profile.socials || {};
  const hiringPreferences = profile.hiringPreferences || {};
  
  const locationLine = [
    location.address,
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header - Read Only */}
        <ProfileHeader
          isEditing={false} // Always false for Admin viewing
          setIsEditing={() => {}}
          profile={profile}
          isShow={false} // Hides the edit button
          isProfileCompletion={false} // Hides completion bar
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard icon={Sparkles} title="About">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {profile.companyDescription || profile.about || "No description added yet."}
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
                    {profile.companySize
                      ? `${profile.companySize} employees`
                      : "—"}
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
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${contactPerson.email}`} className="hover:text-blue-600">
                        {contactPerson.email}
                      </a>
                    </p>
                  )}
                  {contactPerson.phone && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
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
          </div>

          {/* Right Column - Sidebar */}
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
                  <span className="font-medium text-slate-900 capitalize">
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
              <div className="space-y-3">
                {portfolio.website && (
                  <a
                    href={portfolio.website.startsWith('http') ? portfolio.website : `https://${portfolio.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-400" /> Website
                  </a>
                )}
                {portfolio.linkedin && (
                  <a
                    href={portfolio.linkedin.startsWith('http') ? portfolio.linkedin : `https://${portfolio.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <FaLinkedin className="w-4 h-4 text-slate-400" /> LinkedIn
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={socials.twitter.startsWith('http') ? socials.twitter : `https://${socials.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <FaTwitter className="w-4 h-4 text-slate-400" /> Twitter / X
                  </a>
                )}
                {socials.github && (
                  <a
                    href={socials.github.startsWith('http') ? socials.github : `https://${socials.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <FaGithub className="w-4 h-4 text-slate-400" /> GitHub
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <FaInstagram className="w-4 h-4 text-slate-400" /> Instagram
                  </a>
                )}
                {socials.facebook && (
                  <a
                    href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <FaFacebook className="w-4 h-4 text-slate-400" /> Facebook
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

            <SectionCard icon={MapPin} title="Location">
              {locationLine ? (
                <p className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{locationLine}</span>
                </p>
              ) : (
                <p className="text-sm text-slate-400">No location added yet.</p>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="mt-6">
            <ReviewAnalytics analytics={analytics} />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}