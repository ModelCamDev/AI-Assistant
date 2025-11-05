import type React from "react";
import { useAppSelector } from "../../redux/app/hooks";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps{
    children: React.ReactNode;
}

function AdminProtectedRoute({children}: ProtectedRouteProps) {
    const {isLoggedIn} = useAppSelector((state)=>state.admin);
    if (!isLoggedIn) {
        return <Navigate to={'/admin/login'} />
    }
    return ( <>{children}</> );
}

export default AdminProtectedRoute;