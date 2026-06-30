import { useState } from "react";

export default function SkillsCard({setProfile, isEditing, profile}) {

    const [newSkill, setNewSkill] = useState("");

    const addSkill = () => {
        if (newSkill && !profile.skills.includes(newSkill)) {
            setProfile({ ...profile, skills: [...profile.skills, newSkill] });
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile({
            ...profile,
            skills: profile.skills.filter((skill) => skill !== skillToRemove),
        });
    };

    return (

        <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Skills</h2>
                {isEditing && (
                    <div className="flex gap-2">
                        <input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            className="border rounded-xl px-4 py-2"
                            placeholder="Add a skill..."
                        />
                        <button onClick={addSkill} className="bg-blue-600 text-white px-4 py-2 rounded-xl">
                            Add
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {profile.skills?.length > 0 ? (
                    profile.skills.map((skill) => (
                        <span
                            key={skill}
                            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-2"
                        >
                            {skill}
                            {isEditing && (
                                <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-red-500">
                                    ×
                                </button>
                            )}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400">No skills added yet.</span>
                )}
            </div>
        </div>

    );

}