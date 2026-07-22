export const calculateFreelancerProfileCompletion = (profile) => {
    if (!profile) return 0;

    const fields = [
        profile.firstName !== 'User',
        profile.lastName !== 'Name',
        profile.phone !== '123-456-7890',
        profile.dateOfBirth,
        profile.gender,
        profile.location !== 'India',
        profile.profilePicture,
        profile.headline,
        profile.about,
        profile.skills?.length > 0,
        profile.languages?.length > 0,
        profile.experience?.length > 0,
        profile.education?.length > 0,
        profile.portfolio?.github,
        profile.portfolio?.linkedin,
        profile.portfolio?.website,
        profile.portfolio?.resume
    ];

    const filled = fields.filter(Boolean).length;
    return fields.length === 0 ? 0 : Math.round((filled / fields.length) * 100);
};

export const calculateClientProfileCompletion = (profile) => {
    if (!profile) return 0;

    const fields = [
        profile.companyName !== 'UserName',
        profile.companyDescription,
        profile.companyLogo,
        profile.companyType,
        profile.industry,
        profile.foundedYear > 0,
        profile.companySize,
        profile.location?.country,
        profile.location?.state,
        profile.location?.city,
        profile.location?.address,
        profile.contactPerson?.name,
        profile.contactPerson?.designation,
        profile.contactPerson?.email,
        profile.contactPerson?.phone,
        profile.portfolio?.website,
        profile.portfolio?.linkedin,
    ];

    const filled = fields.filter(Boolean).length;
    return fields.length === 0 ? 0 : Math.round((filled / fields.length) * 100);
};

export const calculateProfileCompletion = (profile) => {
    if (!profile || !profile?.user?.role) return 0;

    const normalizedRole = profile.user.role.toLowerCase();

    if (normalizedRole === "freelancer") {
        return calculateFreelancerProfileCompletion(profile);
    } 
    
    if (normalizedRole === "client") {
        return calculateClientProfileCompletion(profile);
    }

    return 100; 
};