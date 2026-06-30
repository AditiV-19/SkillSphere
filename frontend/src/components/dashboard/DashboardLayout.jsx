import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

export default function DashboardLayout({children}) {
    return (

        <div className="min-h-screen bg-slate-100 flex">

            <Sidebar />

            <main className="flex-1 p-10">

                <Navbar />

                {children}

            </main>

        </div>

    );

}