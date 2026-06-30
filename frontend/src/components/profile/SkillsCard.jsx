export default function SkillsCard() {

    // Temporary data
    const skills = [
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "JavaScript",
        "Tailwind CSS",
        "Git",
        "C++"
    ];

    return (

        <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">

                    Skills

                </h2>

                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition"
                >
                    + Add Skill
                </button>

            </div>

            <div className="flex flex-wrap gap-3">

                {skills.map((skill) => (

                    <span
                        key={skill}
                        className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-600 hover:text-white transition cursor-pointer"
                    >
                        {skill}
                    </span>

                ))}

            </div>

        </div>

    );

}