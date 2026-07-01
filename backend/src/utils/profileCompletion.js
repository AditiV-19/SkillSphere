export const calculateProfileCompletion = (profile) => {
    const fields = [
        profile.firstName,
        profile.lastName,
        profile.phone,
        profile.dateOfBirth,
        profile.gender,
        profile.location,
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
        profile.portfolio?.resume,
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
};