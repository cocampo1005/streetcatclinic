import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase-config";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`A password reset link has been sent to ${email}`);
      setEmailSent(true); // Hide input and show only the message
    } catch (error) {
      setError("Failed to send reset email. Please check the email entered.");
      console.error("Error sending password reset email:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl py-8 px-12 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-primaryGray text-center mb-4">
          Reset Password
        </h2>

        {emailSent ? (
          // Show confirmation message after sending
          <p className="text-primaryGreen text-sm text-center mb-6">
            {message}
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter your email below, and we’ll send you a reset link.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {error && (
                <p className="text-errorRed text-sm text-center">{error}</p>
              )}

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-cyan-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-primaryGreen text-white hover:bg-secondaryGreen"
                >
                  Send Reset Email
                </button>
              </div>
            </form>
          </>
        )}

        {/* Close button (only shown after email is sent) */}
        {emailSent && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-cyan-100"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
