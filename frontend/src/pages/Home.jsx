import { useNavigate } from "react-router-dom";

export default function Home(){

    const navigate = useNavigate();


    return (
        <section>

        <button onClick={() => navigate("/register")}>
            Register
        </button>
        <br />
        <button onClick={() => navigate("/login")}>
            Login
        </button>
         <br />
        <button onClick={() => navigate("/dashboard")}>
            Dashboard
        </button>
        
        </section>
        
    )
}