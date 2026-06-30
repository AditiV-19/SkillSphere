import { useState, useEffect } from "react";
import { getProfile } from "../services/api.js";

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

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

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
{
    profile.user?.role === "freelancer" ? (

        <>
            <AboutCard

                setProfile={setProfile}

                isEditing={isEditing}

                profile={profile} 

            />
            <SkillsCard

            setProfile={setProfile}

            isEditing={isEditing}

            profile={profile} 

            />
            <ExperienceCard
            setProfile={setProfile}

            isEditing={isEditing}

            profile={profile} 
            />

            <EducationCard
            setProfile={setProfile}

            isEditing={isEditing}

            profile={profile} 
            />

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