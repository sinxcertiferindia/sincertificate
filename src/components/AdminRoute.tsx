import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type AdminRouteProps = {
  children: JSX.Element;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname || "/admin" }}
      />
    );
  }

  return children;
};

export default AdminRoute;

