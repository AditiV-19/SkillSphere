import { FaGraduationCap } from "react-icons/fa";

export default function EducationCard() {

    const education = [
        {
            degree: "Bachelor of Technology",
            institute: "Your College Name",
            duration: "2024 - 2028",
            description:
                "Computer Science and Engineering"
        }
    ];

    return (

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

                {education.map((item, index) => (

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

                ))}

            </div>

        </div>

    );

}