import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import NavPanel from "./components/NavPanel";
import NewEntryPage from "./pages/NewEntryPage";
import TrappersPage from "./pages/TrappersPage";
import RecordsPage from "./pages/RecordsPage";
import FormsPage from "./pages/FormsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Navbar */}
        <NavPanel />

        {/* Main Content */}
        <main className="flex-1 bg-tirtiaryGray ml-56">
          <Routes>
            <Route path="/" element={<NewEntryPage />} />
            <Route path="/trappers" element={<TrappersPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
