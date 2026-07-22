import { useState, useRef } from "react";
import { 
  X, Plus, Trash2, Camera, Save, Pencil, 
  Calendar, Clock, CalendarX2, User 
} from "lucide-react";
import { uploadProfileImage, uploadResumeToServer } from "../../services/api.js";

//-------------HELPERS-------------------

const formatSlotDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

const formatSlotTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const groupByDate = (slots) => {
  if (!slots) return [];
  const groups = {};
  slots.forEach((slot) => {
    if (!slot.startTime) return;
    const key = new Date(slot.startTime).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
  });
  return Object.entries(groups).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );
};

// Returns a YYYY-MM-DDTHH:mm string based on local time for the HTML input min attribute
const toLocalDatetimeInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const formatDate = (date) => {
  if (!date) return "Present";
  const d = new Date(date);
  if (isNaN(d)) return "Present";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const toInputDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

const emptyExperience = () => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
});

const emptyEducation = () => ({
  degree: "",
  institute: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
});

const emptyCertification = () => ({
  title: "",
  issuedBy: "",
  issueDate: "",
  certificateUrl: "",
});

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const TABS = [
  "Personal",
  "Professional",
  "Experience",
  "Education",
  "Portfolio",
  "Certifications",
];

//-------------UI COMPONENTS-------------------

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function SkillInputList({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState({
    name: "",
    proficiency: "intermediate",
    yearsOfExperience: 0,
  });

  const addTag = () => {
    if (!draft.name.trim()) return;
    const skillName = draft.name.trim();
    if (items.some((item) => item.name.toLowerCase() === skillName.toLowerCase())) return;
    onChange([...items, { ...draft }]);
    setDraft({ name: "", proficiency: "intermediate", yearsOfExperience: 0 });
  };

  const removeSkill = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item) => (
          <span
            key={item.name}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
          >
            {item.name} ({item.proficiency}, {item.yearsOfExperience}y)
            <button type="button" onClick={() => removeSkill(items.indexOf(item))} className="hover:text-blue-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Skill name"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={draft.proficiency}
          onChange={(e) => setDraft({ ...draft, proficiency: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            value={draft.yearsOfExperience}
            onChange={(e) =>
              setDraft({ ...draft, yearsOfExperience: parseInt(e.target.value) || 0 })
            }
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="button" onClick={addTag} className="bg-blue-600 text-white px-3 rounded-lg">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TagInputList({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setDraft("");
  };

  const removeTag = (tag) => onChange(items.filter((t) => t !== tag));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button type="button" onClick={addTag} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

//-------------MAIN COMPONENT-------------------

export default function EditProfileModal({ profile, onClose, onSave }) {
  const initials = (first = "", last = "", user = `${profile.user?.username || ""}`) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || `${user.charAt(0)}`.toUpperCase();

  const [form, setForm] = useState({
    ...profile,
    dateOfBirth: toInputDate(profile.dateOfBirth),
    experience: profile.experience?.length ? [...profile.experience] : [],
    education: profile.education?.length ? [...profile.education] : [],
    certifications: profile.certifications?.length ? [...profile.certifications] : [],
    portfolio: { ...profile.portfolio },
  });

  const [activeTab, setActiveTab] = useState("Personal");
  const [saving, setSaving] = useState(false);

  // Availability Slot States
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [slotError, setSlotError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updatePortfolio = (field, value) =>
    setForm((prev) => ({ ...prev, portfolio: { ...prev.portfolio, [field]: value } }));
  const updateSkills = (value) => update("skills", value);

  // Experience, Education, Certifications
  const updateExperience = (index, field, value) => {
    const next = [...form.experience];
    next[index] = { ...next[index], [field]: value };
    if (field === "currentlyWorking" && value) next[index].endDate = "";
    update("experience", next);
  };
  const addExperience = () => update("experience", [...form.experience, emptyExperience()]);
  const removeExperience = (index) => update("experience", form.experience.filter((_, i) => i !== index));

  const updateEducation = (index, field, value) => {
    const next = [...form.education];
    next[index] = { ...next[index], [field]: value };
    update("education", next);
  };
  const addEducation = () => update("education", [...form.education, emptyEducation()]);
  const removeEducation = (index) => update("education", form.education.filter((_, i) => i !== index));

  const updateCertification = (index, field, value) => {
    const next = [...form.certifications];
    next[index] = { ...next[index], [field]: value };
    update("certifications", next);
  };
  const addCertification = () => update("certifications", [...form.certifications, emptyCertification()]);
  const removeCertification = (index) => update("certifications", form.certifications.filter((_, i) => i !== index));

  // File Uploads
  const [preview, setPreview] = useState(profile.profilePicture || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // ADDED: index parameter to identify which certification is being updated
  const handleFileChange = async (e, type, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profile") {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    } else if (type === "resume") {
      try {
        const response = await uploadResumeToServer(file);
        updatePortfolio("resume", response.data.url);
      } catch (error) {
        console.error("Resume upload failed", error);
      }
    } else if (type === "certificate") {
      try {
        // Reusing uploadResumeToServer for uploading the certificate document
        const response = await uploadResumeToServer(file);
        updateCertification(index, "certificateUrl", response.data.url);
      } catch (error) {
        console.error("Certificate upload failed", error);
      }
    }
  };

  // Slot Management Logic
  const handleAddSlotSubmit = () => {
    if (!newSlotStart || !newSlotEnd) {
      setSlotError("Pick both a start and end time");
      return;
    }
    if (new Date(newSlotEnd) <= new Date(newSlotStart)) {
      setSlotError("End time must be after start time");
      return;
    }
    setSlotError("");

    const newSlot = {
      startTime: new Date(newSlotStart).toISOString(),
      endTime: new Date(newSlotEnd).toISOString(),
      isBooked: false,
    };

    update("availability", {
      ...form.availability,
      slots: [...(form.availability?.slots || []), newSlot],
    });

    setNewSlotStart("");
    setNewSlotEnd("");
    setIsAddingSlot(false);
  };

  const removeSlot = (slotToRemove) => {
    if (slotToRemove.isBooked) return; 
    const newSlots = form.availability.slots.filter((slot) => slot !== slotToRemove);
    update("availability", { ...form.availability, slots: newSlots });
  };

  const groupedSlots = groupByDate(form.availability?.slots || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = profile.profilePicture;
      if (selectedImage) {
        const res = await uploadProfileImage(selectedImage);
        imageUrl = res.data.imageUrl;
      }
      await onSave({ ...form, profilePicture: imageUrl });
      onClose();
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-600">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white hover:bg-blue-700 rounded-full p-1.5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          
          {/* PERSONAL TAB */}
          {activeTab === "Personal" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden ring-2 ring-blue-200 shrink-0">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-700 font-semibold">{initials(form.firstName, form.lastName)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <Field label="Profile picture URL">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={preview}
                        onChange={(e) => update("profilePicture", e.target.value)}
                        placeholder="https://..."
                        className={inputClass}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e, "profile")}
                        accept="image/*"
                        className="hidden"
                      />
                      <button type="button" onClick={() => fileInputRef.current.click()} className="px-3 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First name">
                  <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Last name">
                  <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Date of birth">
                  <input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender">
                  <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inputClass}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Location">
                  <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State, Country" className={inputClass} />
                </Field>
              </div>
            </div>
          )}

          {/* PROFESSIONAL TAB */}
          {activeTab === "Professional" && (
            <div className="space-y-6">
              <Field label="Headline">
                <input type="text" value={form.headline} onChange={(e) => update("headline", e.target.value)} placeholder="e.g. Full-Stack Developer | React & Node.js Specialist" className={inputClass} />
              </Field>

              <Field label="About">
                <textarea value={form.about} onChange={(e) => update("about", e.target.value)} rows={5} placeholder="Tell clients about your experience and what you do best..." className={inputClass} />
              </Field>

              <Field label="Availability Status">
                <select
                  value={form.availability?.status || "available"}
                  onChange={(e) => update("availability", { ...form.availability, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </Field>

              {/* SLOTS MANAGEMENT UI */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-600" />
                      My Availability Slots
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Slots clients can book directly onto your calendar</p>
                  </div>
                  {!isAddingSlot && (
                    <button
                      type="button"
                      onClick={() => setIsAddingSlot(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus size={14} /> Add slot
                    </button>
                  )}
                </div>

                {isAddingSlot && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">New slot</p>
                      <button type="button" onClick={() => setIsAddingSlot(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-500">Starts</span>
                        <input
                          type="datetime-local"
                          value={newSlotStart}
                          min={toLocalDatetimeInputValue(new Date())}
                          onChange={(e) => setNewSlotStart(e.target.value)}
                          className="mt-1 w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-500">Ends</span>
                        <input
                          type="datetime-local"
                          value={newSlotEnd}
                          min={newSlotStart || toLocalDatetimeInputValue(new Date())}
                          onChange={(e) => setNewSlotEnd(e.target.value)}
                          className="mt-1 w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </label>
                    </div>

                    {slotError && <p className="text-xs font-medium text-rose-500">{slotError}</p>}

                    <button
                      type="button"
                      onClick={handleAddSlotSubmit}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
                    >
                      <Plus size={14} /> Add to calendar
                    </button>
                  </div>
                )}

                {groupedSlots.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <CalendarX2 size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No upcoming slots added.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedSlots.map(([dateKey, daySlots]) => (
                      <div key={dateKey}>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          {formatSlotDate(dateKey)}
                        </p>
                        <div className="space-y-2">
                          {daySlots.map((slot, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <Clock size={14} className="text-slate-400 shrink-0" />
                                <span className="text-sm font-semibold text-slate-700">
                                  {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                                </span>

                                {slot.isBooked ? (
                                  <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <User size={10} />
                                    {slot.bookedBy?.companyName || "Booked"}
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Open
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSlot(slot)}
                                disabled={slot.isBooked}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
                                title={slot.isBooked ? "Booked slots cannot be removed here" : "Remove slot"}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SkillInputList label="Skills" items={form.skills} onChange={updateSkills} placeholder="Add a skill and press Enter" />
              <TagInputList label="Languages" items={form.languages} onChange={(v) => update("languages", v)} placeholder="Add a language and press Enter" />
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === "Experience" && (
            <div className="space-y-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                  <button type="button" onClick={() => removeExperience(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                    <Field label="Job title">
                      <input type="text" value={exp.jobTitle} onChange={(e) => updateExperience(i, "jobTitle", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Company">
                      <input type="text" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <Field label="Start date">
                      <input type="date" value={toInputDate(exp.startDate)} onChange={(e) => updateExperience(i, "startDate", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="End date">
                      <input type="date" value={toInputDate(exp.endDate)} disabled={exp.currentlyWorking} onChange={(e) => updateExperience(i, "endDate", e.target.value)} className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <input type="checkbox" checked={exp.currentlyWorking} onChange={(e) => updateExperience(i, "currentlyWorking", e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    I currently work here
                  </label>
                  <Field label="Description">
                    <textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={3} className={inputClass} />
                  </Field>
                </div>
              ))}
              <button type="button" onClick={addExperience} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                <Plus className="w-4 h-4" /> Add experience
              </button>
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === "Education" && (
            <div className="space-y-4">
              {form.education.map((edu, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                  <button type="button" onClick={() => removeEducation(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                    <Field label="Degree">
                      <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Institute">
                      <input type="text" value={edu.institute} onChange={(e) => updateEducation(i, "institute", e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Field of study">
                      <input type="text" value={edu.fieldOfStudy} onChange={(e) => updateEducation(i, "fieldOfStudy", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Start year">
                      <input type="number" value={edu.startYear} onChange={(e) => updateEducation(i, "startYear", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="End year">
                      <input type="number" value={edu.endYear} onChange={(e) => updateEducation(i, "endYear", e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEducation} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                <Plus className="w-4 h-4" /> Add education
              </button>
            </div>
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === "Portfolio" && (
            <div className="space-y-4">
              <Field label="GitHub">
                <input type="text" value={form.portfolio.github} onChange={(e) => updatePortfolio("github", e.target.value)} placeholder="https://github.com/username" className={inputClass} />
              </Field>
              <Field label="LinkedIn">
                <input type="text" value={form.portfolio.linkedin} onChange={(e) => updatePortfolio("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" className={inputClass} />
              </Field>
              <Field label="Website">
                <input type="text" value={form.portfolio.website} onChange={(e) => updatePortfolio("website", e.target.value)} placeholder="https://yourdomain.com" className={inputClass} />
              </Field>
              <Field label="Resume">
                <div className="flex gap-2">
                  <input type="text" value={form.portfolio.resume} onChange={(e) => updatePortfolio("resume", e.target.value)} placeholder="https://..." className={inputClass} />
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, "resume")} accept="application/pdf" className="hidden" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current.click()} 
                    title="Upload Resume"
                    className="px-3 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => updatePortfolio("resume", "")} 
                    title="Clear Resume"
                    className="px-3 rounded-lg border border-slate-300 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Field>
            </div>
          )}

          {/* CERTIFICATIONS TAB */}
          {activeTab === "Certifications" && (
            <div className="space-y-4">
              {form.certifications.map((cert, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                  <button type="button" onClick={() => removeCertification(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                    <Field label="Title">
                      <input type="text" value={cert.title || ""} onChange={(e) => updateCertification(i, "title", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Issued by">
                      <input type="text" value={cert.issuedBy || ""} onChange={(e) => updateCertification(i, "issuedBy", e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Issue date">
                      <input type="date" value={toInputDate(cert.issueDate)} onChange={(e) => updateCertification(i, "issueDate", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Certificate URL">
                      <div className="flex gap-2">
                        <input type="text" value={cert.certificateUrl || ""} onChange={(e) => updateCertification(i, "certificateUrl", e.target.value)} placeholder="https://..." className={inputClass} />
                        <input 
                          type="file" 
                          id={`cert-file-${i}`} 
                          onChange={(e) => handleFileChange(e, "certificate", i)} 
                          accept="application/pdf,image/*" 
                          className="hidden" 
                        />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById(`cert-file-${i}`).click()} 
                          title="Upload Certificate"
                          className="px-3 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => updateCertification(i, "certificateUrl", "")} 
                          title="Clear Certificate URL"
                          className="px-3 rounded-lg border border-slate-300 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCertification} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                <Plus className="w-4 h-4" /> Add certification
              </button>
            </div>
          )}
        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}