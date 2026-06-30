import { FaBriefcase } from "react-icons/fa";

export default function ExperienceCard() {

    // Temporary data
    const experiences = [
        {
            jobTitle: "Frontend Developer",
            company: "ABC Technologies",
            duration: "Jan 2024 - Present",
            description:
                "Developed responsive React applications using Tailwind CSS and REST APIs."
        },
        {
            jobTitle: "Web Development Intern",
            company: "XYZ Solutions",
            duration: "Jun 2023 - Dec 2023",
            description:
                "Built responsive websites and collaborated with senior developers."
        }
    ];

    return (

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

    );

}