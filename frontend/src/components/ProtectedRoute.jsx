import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {

        const user = JSON.parse(localStorage.getItem("user"));

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but wrong role
    if (!allowedRoles?.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    // Correct role
    return children;
}