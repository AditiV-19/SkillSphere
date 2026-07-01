import { FaEnvelope, FaMapMarkerAlt, FaUserEdit } from "react-icons/fa";

export default function ProfileHeader({isEditing, setIsEditing, profile}) {

    return (

        <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="flex flex-col lg:flex-row lg:items-center gap-8">

                <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user?.username || "User")}&background=2563eb&color=fff`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />

                <div className="flex-1">

                    <h1 className="text-3xl font-bold">
                        {
                        profile.firstName && profile.lastName
                        ? `${profile.firstName} ${profile.lastName}`
                        : profile.user.username
                        }
                    </h1>

                    <p className="text-blue-600 font-semibold capitalize mt-1">
                        {profile.user?.role}
                    </p>

                    <div className="flex flex-wrap gap-6 mt-5 text-gray-500">

                        <div className="flex items-center gap-2">

                            <FaEnvelope />

                            <span>{profile.user?.email}</span>

                        </div>

                        <div className="flex items-center gap-2">

                            <FaMapMarkerAlt />

                            <span>India</span>

                        </div>

                    </div>

                </div>
                    

                    <button
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
                    onClick={() =>
                    setIsEditing(!isEditing)
                    }
                    >
                        {isEditing
                        ? "Save"
                        : "Edit Profile"}
                </button>

            </div>

        </div>

    );

}