import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFreelancerById } from "../../services/api.js"; // 🚀 Connects directly to our single profile router

import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import ProfileHeader from "../../components/profile/ProfileHeader";
import SectionCard from "../../components/profile/SectionCard";

import { FaBriefcase, FaGithub, FaLinkedin } from "react-icons/fa";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Globe,
  FileText,
  Briefcase,
  GraduationCap,
  Languages as LanguagesIcon,
  Sparkles,
  AlertCircle
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Present";
  const d = new Date(date);
  if (isNaN(d)) return "Present";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function ViewFreelancerProfile() {
  const { id } = useParams(); // 🚀 Dynamically extract dynamic professional ID from route parametrics
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFreelancerProfile();
  }, [id]);

  const fetchFreelancerProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getFreelancerById(id);
      
      // Assumes extraction shape from the controller: res.data.freelancer
      setProfile(response.data?.freelancer || response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to parse target freelancer index.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (slot) => {
    try {
      // Slot dynamic hook connection
      // await bookFreelancerSlot(id, { slotId: slot._id });
      alert("Consultation slot locked and booked successfully!");
      fetchFreelancerProfile(); // Synchronize view state updates over network
    } catch (error) {
      console.error("Booking verification breakdown:", error);
      alert("Could not process booking parameters. Slot may be closed.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center text-slate-500 font-medium text-sm">
          Unpacking structural developer credentials...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md">
            <AlertCircle className="text-rose-500 mx-auto mb-3" size={32} />
            <h4 className="text-base font-bold text-slate-800">Profile Error</h4>
            <p className="text-slate-500 text-sm mt-1">{error || "Candidate profile index could not be isolated."}</p>
            <button onClick={() => navigate("/client/browse")} className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs">
              Return to Discovery
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate("/client/browse")} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition mb-6 uppercase tracking-wider"
        >
          <ChevronLeft size={16} />
          <span>Back to Talents</span>
        </button>

        {/* Dynamic Read-Only Header */}
        <ProfileHeader
          isEditing={false}
          setIsEditing={() => {}} // Disabled editing triggers safely
          profile={profile}
        />

        {/* Core Profile Parameters Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Main Context Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <SectionCard icon={Sparkles} title="About Professional">
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {profile.about || "No profile narrative documented by the independent contractor."}
              </p>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Experience History">
              {profile.experience?.length ? (
                <ul className="relative border-l-2 border-slate-200 ml-1.5">
                  {profile.experience.map((exp, i) => (
                    <li
                      key={i}
                      className={`relative pl-6 ${i !== profile.experience.length - 1 ? "pb-8" : ""}`}
                    >
                      <span className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <h3 className="font-semibold text-slate-900 text-sm">{exp.jobTitle}</h3>
                      <p className="text-xs text-slate-600 font-medium">{exp.company}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(exp.startDate)} — {exp.currentlyWorking ? "Present" : formatDate(exp.endDate)}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic">No verified professional timeline points cataloged.</p>
              )}
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Academic Metrics">
              {profile.education?.length ? (
                <ul className="relative border-l-2 border-slate-200 ml-1.5">
                  {profile.education.map((edu, i) => (
                    <li
                      key={i}
                      className={`relative pl-6 ${i !== profile.education.length - 1 ? "pb-8" : ""}`}
                    >
                      <span className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <h3 className="font-semibold text-slate-900 text-sm">{edu.degree}</h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {edu.institute}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {edu.startYear} — {edu.endYear || "Present"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic">No educational background landmarks submitted.</p>
              )}
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Certifications Portfolio">
              {profile.certifications?.length ? (
                <ul className="relative border-l-2 border-slate-200 ml-1.5">
                  {profile.certifications.map((cert, i) => (
                    <li
                      key={i}
                      className={`relative pl-6 ${i !== profile.certifications.length - 1 ? "pb-8" : ""}`}
                    >
                      <span className="absolute -left-1.75 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <p className="text-[10px] text-slate-400 font-medium">{formatDate(cert.issueDate)}</p>
                      <h3 className="font-semibold text-slate-900 text-sm mt-0.5">{cert.title}</h3>
                      <p className="text-xs text-slate-600 font-medium">{cert.issuedBy}</p>
                      {cert.certificateUrl && (
                        <a 
                          href={cert.certificateUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-blue-600 hover:underline mt-1.5 inline-block font-semibold"
                        >
                          Review Verification Document
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic">No external verification accreditations mapped.</p>
              )}
            </SectionCard>
          </div>

          {/* Sidebar Parameter Right Column */}
          <div className="space-y-6">
            
            <SectionCard title="Core Competencies">
              {profile.skills?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 border border-blue-100/60 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-xl"
                    >
                      {skill.name || skill} {skill.proficiency ? `• ${skill.proficiency}` : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic">No technical core competency stacks configured.</p>
              )}
            </SectionCard>

            <SectionCard icon={LanguagesIcon} title="Languages Provided">
              {profile.languages?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-xl"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic">No linguistic configurations defined.</p>
              )}
            </SectionCard>

            <SectionCard title="Direct Verification Links">
              <div className="space-y-2.5">
                {profile.portfolio?.github && (
                  <a href={profile.portfolio.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition">
                    <FaGithub size={16} /> GitHub Workspace
                  </a>
                )}
                {profile.portfolio?.linkedin && (
                  <a href={profile.portfolio.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition">
                    <FaLinkedin size={16} /> LinkedIn Credentials
                  </a>
                )}
                {profile.portfolio?.website && (
                  <a href={profile.portfolio.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition">
                    <Globe size={16} className="text-slate-400" /> Independent Domain
                  </a>
                )}
                {profile.portfolio?.resume && (
                  <a href={profile.portfolio.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition">
                    <FileText size={16} className="text-slate-400" /> Digital Curriculum Vitae
                  </a>
                )}
                {!profile.portfolio?.github && !profile.portfolio?.linkedin && !profile.portfolio?.website && !profile.portfolio?.resume && (
                  <p className="text-xs text-slate-400 font-medium italic">No external anchor networks locked to this profile index.</p>
                )}
              </div>
            </SectionCard>

            {/* Live Consultation Booking Sub-Card */}
            <SectionCard icon={Calendar} title="Schedule Consultation">
              {profile.availability?.slots?.length > 0 ? (
                <div className="space-y-3">
                  {profile.availability.slots.map((slot, index) => {
                    const startDate = new Date(slot.startTime);
                    const endDate = new Date(slot.endTime);
                    const start = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const end = endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs transition hover:bg-slate-100/50"
                      >
                        <div className="font-semibold text-slate-700 leading-normal">
                          <p>
                            {startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">{start} - {end}</p>
                        </div>

                        {slot.isBooked ? (
                          <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Booked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBooking(slot)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
                          >
                            Book Slot
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic">No interactive consultation slots provided at this interval.</p>
              )}
            </SectionCard>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}