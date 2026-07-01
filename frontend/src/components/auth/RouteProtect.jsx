import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom";

export const RouteProtect = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ message: "Please login to access the page", from: location.pathname }}replace />;
    }

    return (
        <>
            {children}
        </>
    );
}