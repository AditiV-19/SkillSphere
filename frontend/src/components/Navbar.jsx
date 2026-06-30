import { FaBell } from "react-icons/fa";

export default function Navbar() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <header className="flex justify-between items-center mb-10">

            <div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {user?.username} 👋
                </h1>

                <p className="text-gray-500 mt-1">
                    Ready to build your freelance career today?
                </p>

            </div>

            <div className="flex items-center gap-5">

                <button className="relative p-3 rounded-full bg-white shadow hover:bg-gray-100 transition">

                    <FaBell size={18}/>

                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full"></span>

                </button>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow">

                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">

                        {user?.username?.charAt(0).toUpperCase()}

                    </div>

                    <div>

                        <p className="font-semibold">

                            {user?.username}

                        </p>

                        <p className="text-sm text-gray-500">

                            {user?.role}

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}