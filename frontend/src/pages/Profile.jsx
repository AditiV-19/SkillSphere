import { useState } from "react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import ProfileHeader from "../components/profile/ProfileHeader";
import AboutCard from "../components/profile/AboutCard";
import SkillsCard from "../components/profile/SkillsCard";
import ExperienceCard from "../components/profile/ExperienceCard";
import EducationCard from "../components/profile/EducationCard";
// import PortfolioCard from "./components/profile/PortfolioCard";
// import AvailabilityCard from "./components/profile/AvailabilityCard";
// import CompanyCard from "./components/profile/CompanyCard";
// import AdminInfoCard from "./components/profile/AdminInfoCard";

export default function Profile() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [isEditing, setIsEditing] = useState(false);

const [profileData, setProfileData] = useState({

    username: user.username,

    email: user.email,

    about: "",

    skills: [],

    experience: [],

    education: []

});

    return (

        <DashboardLayout>

            <div className="space-y-8">

               <ProfileHeader
               user={user}

                isEditing={isEditing}

                setIsEditing={setIsEditing}
                />
{
    user?.role === "freelancer" ? (

        <>
            <AboutCard

                profileData={profileData}

                setProfileData={setProfileData}

                isEditing={isEditing}

            />
            <SkillsCard

            profileData={profileData}

            setProfileData={setProfileData}

            isEditing={isEditing}

            />
            <ExperienceCard />
            <EducationCard />
            {/* <PortfolioCard /> */}
        </>

    ) : user?.role === "client" ? (

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