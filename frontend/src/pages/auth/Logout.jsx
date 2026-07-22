import { useNavigate } from "react-router-dom";
import socket from "../../socket";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    socket.disconnect();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );
};

export default Logout;