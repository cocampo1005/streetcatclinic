import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Prevents flashing before auth state is determined

  return user ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
