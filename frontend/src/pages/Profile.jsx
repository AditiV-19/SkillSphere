import { useState, useEffect } from "react";
import { getProfile } from "../services/api.js";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import ProfileHeader from "../components/profile/ProfileHeader";

// import PortfolioCard from "./components/profile/PortfolioCard";
// import AvailabilityCard from "./components/profile/AvailabilityCard";
// import CompanyCard from "./components/profile/CompanyCard";
// import AdminInfoCard from "./components/profile/AdminInfoCard";


import { FaBriefcase } from "react-icons/fa";

export default function Profile() {

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    // Skills
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
    
    //Experience
    const [experiences, setExperiences] = useState([])

    useEffect(() => {

        fetchProfile();

    }, []);

    const fetchProfile = async () => {

        try {

            const response = await getProfile();

            console.log(response.data);

setProfile(response.data);

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    };
    if (loading) {

    return (

        <div className="p-10">

            Loading...

        </div>

    );

}

    return (

        <DashboardLayout>

            <div className="space-y-8">

               <ProfileHeader

                isEditing={isEditing}

                setIsEditing={setIsEditing}

                profile={profile} 
                />


            {/* About */}
             <div className="bg-white rounded-3xl shadow-sm p-8">

            <h2 className="text-xl font-bold mb-4">

                About

            </h2>

           {
isEditing ?

(

<textarea

className="w-full border rounded-xl p-4"

value={profile.about}

onChange={(e)=>

setProfile({

...profile,

about:e.target.value

})

}

/>

)

:

(

<p>

{profile.about ||

"Tell clients about yourself."}

</p>

)
}

        </div>
{
    profile.user?.role === "freelancer" ? (

        <>
         {/* Skills */}
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

                    {/* Experience */}
                    <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">
                    Experience
                </h2>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition">
                    + Add Experience
                </button>

            </div>

            <div className="space-y-6">

                {experiences.map((experience, index) => (

                    <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-6 relative"
                    >

                        <div className="absolute -left-3 top-2 w-5 h-5 bg-blue-500 rounded-full"></div>

                        <div className="flex items-center gap-3">

                            <FaBriefcase className="text-blue-600 text-xl" />

                            <h3 className="text-xl font-semibold">

                                {experience.jobTitle}

                            </h3>

                        </div>

                        <p className="text-blue-600 font-medium mt-1">

                            {experience.company}

                        </p>

                        <p className="text-gray-500 text-sm mt-1">

                            {experience.duration}

                        </p>

                        <p className="text-gray-600 mt-3 leading-7">

                            {experience.description}

                        </p>

                    </div>

                ))}

            </div>

        </div>

            {/* Education */}
             <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">
                    Education
                </h2>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition">
                    + Add Education
                </button>

            </div>

            <div className="space-y-6">

                { profile.education.length>0 ? (
                    profile.education.map((item, index) => (

                    <div
                        key={index}
                        className="border-l-4 border-green-500 pl-6 relative"
                    >

                        <div className="absolute -left-3 top-2 w-5 h-5 rounded-full bg-green-500"></div>

                        <div className="flex items-center gap-3">

                            <FaGraduationCap className="text-green-600 text-xl" />

                            <h3 className="text-xl font-semibold">
                                {item.degree}
                            </h3>

                        </div>

                        <p className="text-green-600 mt-1">
                            {item.institute}
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                            {item.duration}
                        </p>

                        <p className="text-gray-600 mt-3">
                            {item.description}
                        </p>

                    </div>

                ))
            ): (
                <span className="text-gray-400">Add your education background</span>
            )}

            </div>

        </div>

            {/* <PortfolioCard /> */}
        </>

    ) : profile.user?.role === "client" ? (

        <>
            <CompanyCard />
        </>

    ) : (

        <>
            <AdminInfoCard />
        </>

    )
}

            </div>

        </DashboardLayout>

    );

}