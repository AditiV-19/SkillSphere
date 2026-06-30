import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { dashboardContent } from "../../data/dashboardContent";

export default function HeroBanner() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const role = user?.role || "freelancer";

    const hero = dashboardContent[role].hero;

    return (

        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 p-10 text-white shadow-xl">

            <div className="max-w-2xl">

               <h1 className="text-4xl font-bold">
                    Welcome back, {user?.username}! 👋
                </h1>

                <p className="mt-4 text-lg text-blue-100">
                    {hero.subtitle}
                </p>

                <div className="mt-8 flex gap-4">
                    <button 
                        className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
                        onClick={() => navigate(hero.primaryRoute)}
                    >
                        {hero.primaryButton}
                    </button>

                    <button 
                        className="flex items-center gap-2 border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-600 transition"
                        onClick={() => navigate(hero.secondaryRoute)}
                    >
                        {hero.secondaryButton}
                    </button>

                </div>

            </div>

            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-2xl"></div>

            <div className="absolute right-20 bottom-0 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>

        </div>

    );

}