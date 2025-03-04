import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import NavPanel from "./components/NavPanel";
import NewEntryPage from "./pages/NewEntryPage";
import TrappersPage from "./pages/TrappersPage";
import RecordsPage from "./pages/RecordsPage";
import FormsPage from "./pages/FormsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PrivateRoute from "./pages/PrivateRoute";
import AccountsPage from "./pages/AccountsPage";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="flex h-screen">
      {/* Conditionally rendered NavPanel */}
      {!hideNav && <NavPanel />}

      {/* Main Content */}
      <main className={`flex-1 bg-tirtiaryGray ${!hideNav ? "ml-56" : ""}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignupPage />} />{" "}
          <Route path="/login" element={<LoginPage />} />
          {/* Protected Routes */}
          <Route
            path="/"
            element={<PrivateRoute element={<NewEntryPage />} />}
          />
          <Route
            path="/trappers"
            element={<PrivateRoute element={<TrappersPage />} />}
          />
          <Route
            path="/records"
            element={<PrivateRoute element={<RecordsPage />} />}
          />
          <Route
            path="/forms"
            element={<PrivateRoute element={<FormsPage />} />}
          />
          <Route
            path="/profile"
            element={<PrivateRoute element={<ProfilePage />} />}
          />
          <Route
            path="/accounts"
            element={<PrivateRoute element={<AccountsPage />} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
