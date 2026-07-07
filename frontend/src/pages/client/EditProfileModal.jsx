import { useState, useRef } from "react";
import { X, Plus, Save, Pencil } from "lucide-react";

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

//updates a list of free-text tags (used for preferred languages)
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

const TABS = ["Company", "Contact", "Location", "Hiring", "Socials"];

const COMPANY_TYPES = [
  "Startup",
  "Agency",
  "Enterprise",
  "Individual",
  "Government",
  "NGO",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Gaming",
  "Retail",
  "Marketing",
  "Construction",
  "Other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

//-------------MAIN FUNCTION-------------------

export default function EditProfileModal({ profile, onClose, onSave }) {
  const initials = (companyName = profile.companyName || "") =>
    companyName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "C";

  const [form, setForm] = useState({
    ...profile,
    location: { country: "", state: "", city: "", address: "", ...profile.location },
    contactPerson: {
      name: "",
      designation: "",
      email: "",
      phone: "",
      ...profile.contactPerson,
    },
    portfolio: { website: "", linkedin: "", ...profile.portfolio },
    socials: {
      twitter: "",
      github: "",
      instagram: "",
      facebook: "",
      ...profile.socials,
    },
    hiringPreferences: {
      remoteOnly: false,
      preferredExperienceLevel: "",
      preferredLanguages: [],
      ...profile.hiringPreferences,
    },
  });

  const [activeTab, setActiveTab] = useState("Company");
  const [saving, setSaving] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateNested = (section, field, value) =>
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

  //Company logo upload
  const [preview, setPreview] = useState(profile.companyLogo || "");
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
      let logoUrl = profile.companyLogo;

      if (selectedImage) {
        const res = await uploadProfileImage(selectedImage);
        logoUrl = res.data.imageUrl;
      }

      // Mongoose enum fields reject "" — convert empty selections to undefined
      // so the field is simply omitted instead of failing validation.
      await onSave({
        ...form,
        companyLogo: logoUrl,
        companyType: form.companyType || undefined,
        industry: form.industry || undefined,
        companySize: form.companySize || undefined,
        hiringPreferences: {
          ...form.hiringPreferences,
          preferredExperienceLevel:
            form.hiringPreferences.preferredExperienceLevel || undefined,
        },
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
          <h2 className="text-lg font-semibold text-white">Edit Company Profile</h2>
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
          {activeTab === "Company" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden ring-2 ring-blue-200 shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-700 font-semibold">
                      {initials(form.companyName)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Field label="Company logo URL">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={preview}
                        onChange={(e) => {
                          setPreview(e.target.value);
                          update("companyLogo", e.target.value);
                        }}
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
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="px-3 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              <Field label="Company name">
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Company description">
                <textarea
                  value={form.companyDescription}
                  onChange={(e) => update("companyDescription", e.target.value)}
                  rows={4}
                  maxLength={1500}
                  placeholder="Tell freelancers about your company..."
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-400">
                  {(form.companyDescription || "").length}/1500
                </p>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Company type">
                  <select
                    value={form.companyType || ""}
                    onChange={(e) => update("companyType", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select type</option>
                    {COMPANY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Industry">
                  <select
                    value={form.industry || ""}
                    onChange={(e) => update("industry", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Founded year">
                  <input
                    type="number"
                    value={form.foundedYear || ""}
                    onChange={(e) =>
                      update("foundedYear", parseInt(e.target.value) || 0)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Company size">
                  <select
                    value={form.companySize || ""}
                    onChange={(e) => update("companySize", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isHiring}
                  onChange={(e) => update("isHiring", e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Currently hiring
              </label>
            </div>
          )}

          {activeTab === "Contact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact name">
                  <input
                    type="text"
                    value={form.contactPerson.name}
                    onChange={(e) =>
                      updateNested("contactPerson", "name", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Designation">
                  <input
                    type="text"
                    value={form.contactPerson.designation}
                    onChange={(e) =>
                      updateNested(
                        "contactPerson",
                        "designation",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. HR Manager"
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <input
                    type="email"
                    value={form.contactPerson.email}
                    onChange={(e) =>
                      updateNested("contactPerson", "email", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    value={form.contactPerson.phone}
                    onChange={(e) =>
                      updateNested("contactPerson", "phone", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          )}

          {activeTab === "Location" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country">
                  <input
                    type="text"
                    value={form.location.country}
                    onChange={(e) =>
                      updateNested("location", "country", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="State">
                  <input
                    type="text"
                    value={form.location.state}
                    onChange={(e) =>
                      updateNested("location", "state", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City">
                  <input
                    type="text"
                    value={form.location.city}
                    onChange={(e) =>
                      updateNested("location", "city", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Address">
                  <input
                    type="text"
                    value={form.location.address}
                    onChange={(e) =>
                      updateNested("location", "address", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          )}

          {activeTab === "Hiring" && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.hiringPreferences.remoteOnly}
                  onChange={(e) =>
                    updateNested(
                      "hiringPreferences",
                      "remoteOnly",
                      e.target.checked,
                    )
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remote only
              </label>

              <Field label="Preferred experience level">
                <select
                  value={form.hiringPreferences.preferredExperienceLevel || ""}
                  onChange={(e) =>
                    updateNested(
                      "hiringPreferences",
                      "preferredExperienceLevel",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="">No preference</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </Field>

              <TagInputList
                label="Preferred languages"
                items={form.hiringPreferences.preferredLanguages}
                onChange={(v) =>
                  updateNested("hiringPreferences", "preferredLanguages", v)
                }
                placeholder="Add a language and press Enter"
              />
            </div>
          )}

          {activeTab === "Socials" && (
            <div className="space-y-4">
              <Field label="Website">
                <input
                  type="text"
                  value={form.portfolio.website}
                  onChange={(e) =>
                    updateNested("portfolio", "website", e.target.value)
                  }
                  placeholder="https://yourcompany.com"
                  className={inputClass}
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  type="text"
                  value={form.portfolio.linkedin}
                  onChange={(e) =>
                    updateNested("portfolio", "linkedin", e.target.value)
                  }
                  placeholder="https://linkedin.com/company/..."
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Twitter / X">
                  <input
                    type="text"
                    value={form.socials.twitter}
                    onChange={(e) =>
                      updateNested("socials", "twitter", e.target.value)
                    }
                    placeholder="https://x.com/..."
                    className={inputClass}
                  />
                </Field>
                <Field label="GitHub">
                  <input
                    type="text"
                    value={form.socials.github}
                    onChange={(e) =>
                      updateNested("socials", "github", e.target.value)
                    }
                    placeholder="https://github.com/..."
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Instagram">
                  <input
                    type="text"
                    value={form.socials.instagram}
                    onChange={(e) =>
                      updateNested("socials", "instagram", e.target.value)
                    }
                    placeholder="https://instagram.com/..."
                    className={inputClass}
                  />
                </Field>
                <Field label="Facebook">
                  <input
                    type="text"
                    value={form.socials.facebook}
                    onChange={(e) =>
                      updateNested("socials", "facebook", e.target.value)
                    }
                    placeholder="https://facebook.com/..."
                    className={inputClass}
                  />
                </Field>
              </div>
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