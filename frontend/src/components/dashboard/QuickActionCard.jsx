import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function QuickActionCard({
    title,
    description,
    icon: Icon,
    color,
    route
}) {

    const navigate = useNavigate();

    return (

        <button
            onClick={() => navigate(route)}
            className="w-full bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
        >

            <div className="flex justify-between items-center">

                <div className="flex items-center gap-5">

                    <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white`}>

                        <Icon size={24} />

                    </div>

                    <div>

                        <h3 className="text-lg font-semibold">

                            {title}

                        </h3>

                        <p className="text-gray-500 text-sm mt-1">

                            {description}

                        </p>

                    </div>

                </div>

                <FaArrowRight className="text-gray-400" />

            </div>

        </button>

    );

}