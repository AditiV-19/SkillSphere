import { useState, useRef } from "react";
import { X, Plus, Trash2, Camera, Save, Pencil } from "lucide-react";

import { uploadProfileImage } from "../../services/api.js";

//-------------FUNCTIONS-------------------

//sets ui for the label and input field
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

//updates the list of tags for skills and languages
function TagInputList({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim();
    if (!value) return;
    if (items.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...items, value]);
    setDraft("");
  };

  const removeTag = (tag) => onChange(items.filter((t) => t !== tag));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-blue-900"
            >
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
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const TABS = [
  "Personal",
  "Professional",
  "Experience",
  "Education",
  "Portfolio",
];

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

//-------------MAIN FUNCTION-------------------

export default function EditProfileModal({ profile, onClose, onSave }) {
  const initials = (first = "", last = "", user = `${profile.user.username}`) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() ||
    `${user.charAt(0)}`.toUpperCase();

  const [form, setForm] = useState({
    ...profile,
    dateOfBirth: toInputDate(profile.dateOfBirth),
    experience: profile.experience?.length ? [...profile.experience] : [],
    education: profile.education?.length ? [...profile.education] : [],
    portfolio: { ...profile.portfolio },
  });

  const [activeTab, setActiveTab] = useState("Personal");
  const [saving, setSaving] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const updatePortfolio = (field, value) =>
    setForm((prev) => ({
      ...prev,
      portfolio: { ...prev.portfolio, [field]: value },
    }));

  const updateExperience = (index, field, value) => {
    const next = [...form.experience];
    next[index] = { ...next[index], [field]: value };
    if (field === "currentlyWorking" && value) next[index].endDate = "";
    update("experience", next);
  };
  const addExperience = () =>
    update("experience", [...form.experience, emptyExperience()]);
  const removeExperience = (index) =>
    update(
      "experience",
      form.experience.filter((_, i) => i !== index),
    );

  const updateEducation = (index, field, value) => {
    const next = [...form.education];
    next[index] = { ...next[index], [field]: value };
    update("education", next);
  };
  const addEducation = () =>
    update("education", [...form.education, emptyEducation()]);
  const removeEducation = (index) =>
    update(
      "education",
      form.education.filter((_, i) => i !== index),
    );

    //Upload Profile Image
  const [preview, setPreview] = useState(profile.profilePicture || "");
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      let imageUrl = profile.profilePicture;

      if (selectedImage) {
        const res = await uploadProfileImage(selectedImage);

        imageUrl = res.data.imageUrl;
      }
      console.log("Image URL:", imageUrl);
      await onSave({
        ...form,
        profilePicture: imageUrl,
      });

      onClose();
    } catch (error) {
      console.log("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-600">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white hover:bg-blue-700 rounded-full p-1.5 transition-colors"
          >
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          {activeTab === "Personal" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden ring-2 ring-blue-200 shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-700 font-semibold">
                      {initials(form.firstName, form.lastName)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Field label="Profile picture URL">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={preview}
                        onChange={(e) =>
                          update("profilePicture", e.target.value)
                        }
                        placeholder="https://..."
                        className={inputClass}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()} // Clicks the hidden input
                        className="px-3 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First name">
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Date of birth">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender">
                  <select
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Location">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="City, State, Country"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          )}

          {activeTab === "Professional" && (
            <div className="space-y-4">
              <Field label="Headline">
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => update("headline", e.target.value)}
                  placeholder="e.g. Full-Stack Developer | React & Node.js Specialist"
                  className={inputClass}
                />
              </Field>

              <Field label="About">
                <textarea
                  value={form.about}
                  onChange={(e) => update("about", e.target.value)}
                  rows={5}
                  placeholder="Tell clients about your experience and what you do best..."
                  className={inputClass}
                />
              </Field>

              <Field label="Availability">
                <select
                  value={form.availability}
                  onChange={(e) => update("availability", e.target.value)}
                  className={inputClass}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </Field>

              <TagInputList
                label="Skills"
                items={form.skills}
                onChange={(v) => update("skills", v)}
                placeholder="Add a skill and press Enter"
              />

              <TagInputList
                label="Languages"
                items={form.languages}
                onChange={(v) => update("languages", v)}
                placeholder="Add a language and press Enter"
              />
            </div>
          )}

          {activeTab === "Experience" && (
            <div className="space-y-4">
              {form.experience.map((exp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 p-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                    <Field label="Job title">
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) =>
                          updateExperience(i, "jobTitle", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Company">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(i, "company", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <Field label="Start date">
                      <input
                        type="date"
                        value={toInputDate(exp.startDate)}
                        onChange={(e) =>
                          updateExperience(i, "startDate", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="End date">
                      <input
                        type="date"
                        value={toInputDate(exp.endDate)}
                        disabled={exp.currentlyWorking}
                        onChange={(e) =>
                          updateExperience(i, "endDate", e.target.value)
                        }
                        className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) =>
                        updateExperience(
                          i,
                          "currentlyWorking",
                          e.target.checked,
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    I currently work here
                  </label>
                  <Field label="Description">
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(i, "description", e.target.value)
                      }
                      rows={3}
                      className={inputClass}
                    />
                  </Field>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" /> Add experience
              </button>
            </div>
          )}

          {activeTab === "Education" && (
            <div className="space-y-4">
              {form.education.map((edu, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 p-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                    <Field label="Degree">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(i, "degree", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Institute">
                      <input
                        type="text"
                        value={edu.institute}
                        onChange={(e) =>
                          updateEducation(i, "institute", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Field of study">
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) =>
                          updateEducation(i, "fieldOfStudy", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Start year">
                      <input
                        type="number"
                        value={edu.startYear}
                        onChange={(e) =>
                          updateEducation(i, "startYear", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="End year">
                      <input
                        type="number"
                        value={edu.endYear}
                        onChange={(e) =>
                          updateEducation(i, "endYear", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" /> Add education
              </button>
            </div>
          )}

          {activeTab === "Portfolio" && (
            <div className="space-y-4">
              <Field label="GitHub">
                <input
                  type="text"
                  value={form.portfolio.github}
                  onChange={(e) => updatePortfolio("github", e.target.value)}
                  placeholder="https://github.com/username"
                  className={inputClass}
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  type="text"
                  value={form.portfolio.linkedin}
                  onChange={(e) => updatePortfolio("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className={inputClass}
                />
              </Field>
              <Field label="Website">
                <input
                  type="text"
                  value={form.portfolio.website}
                  onChange={(e) => updatePortfolio("website", e.target.value)}
                  placeholder="https://yourdomain.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Resume URL">
                <input
                  type="text"
                  value={form.portfolio.resume}
                  onChange={(e) => updatePortfolio("resume", e.target.value)}
                  placeholder="https://link-to-your-resume.pdf"
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </form>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
