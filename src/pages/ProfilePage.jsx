import React from "react";
import CsvUploader from "../components/CsvUploader";
import { useNavigate } from "react-router-dom";
import { LogoutIcon } from "../components/svgs/Icons";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Profile</h1>
        <button
          onClick={handleLogout}
          className="flex gap-2 bg-primaryWhite font-bold text-errorRed border-2 border-errorRed px-4 py-2 rounded-lg hover:bg-errorRed transition hover:text-primaryWhite"
        >
          <LogoutIcon />
          Logout
        </button>
      </header>
      <section className="p-8">
        <CsvUploader />
      </section>
    </>
  );
}
