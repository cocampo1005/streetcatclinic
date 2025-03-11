import React, { useState } from "react";
import CsvUploader from "../components/CsvUploader";
import { useNavigate } from "react-router-dom";
import { LockIcon, LogoutIcon } from "../components/svgs/Icons";
import { useAuth } from "../contexts/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase-config";
import TrapperUploader from "../components/TrapperUploader";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setResetError(null);
    } catch (error) {
      console.error("Error sending reset email:", error);
      setResetError(error.message);
    }
  };

  // Format the date in a more readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

      <div className="flex flex-col md:flex-row">
        {/* User Information Section */}
        <section className="p-8 w-full">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">User Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-lg font-medium capitalize">{user?.role}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="text-lg font-medium">{user?.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="text-lg font-medium">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">
                Password Management
              </h3>
              <button
                onClick={handleResetPassword}
                className="flex gap-2 items-center justify-center bg-primaryGreen text-primaryWhite px-4 py-2 rounded-lg hover:bg-secondaryGreen transition"
              >
                <LockIcon />
                <span className="text-lg">Reset Password</span>
              </button>

              {resetSent && (
                <div className="mt-4 p-3 bg-cyan-100 text-primaryGreen rounded-lg">
                  {`Password to reset email sent! Please check your inbox at ${user.email}.`}
                </div>
              )}

              {resetError && (
                <div className="mt-4 p-3 bg-red-100 text-errorRed rounded-lg">
                  Error: {resetError}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CSV Uploader Section */}
        {/* <section className="p-8 w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Import Data</h2>
            <CsvUploader />
          </div>
        </section> */}

        {/* Trapper Uploader Section */}
        {/* <section className="p-8 w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Upload Trappers</h2>
            <TrapperUploader />
          </div>
        </section> */}
      </div>
    </>
  );
}
