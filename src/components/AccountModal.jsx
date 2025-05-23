import React, { useState, useEffect } from "react";
import { BoldPlus, EditIcon } from "./svgs/Icons";

export default function AccountModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "staff",
    title: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || "",
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        role: initialData.role || "",
        title: initialData.title || "",
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!formData.role.trim()) newErrors.role = "Role is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      await onSave(formData);
      setIsSuccess(true); // Show success message
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl py-12 px-16 w-full max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center text-primaryGreen gap-4 mb-8">
            {initialData ? <EditIcon size="36px" /> : <BoldPlus />}
            <h2 className="text-3xl font-bold text-primaryGray font-accent">
              {initialData ? "Edit Account" : "Add Account"}
            </h2>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <p className="text-green-600 font-semibold text-lg mb-4">
                ✅ Account successfully created!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-primaryGreen text-white px-4 py-2 rounded-lg hover:bg-secondaryGreen"
              >
                Okay
              </button>
            </div>
          ) : (
            <>
              <div>
                <label>
                  Email <span className="text-errorRed">*</span>
                </label>
                {errors.email && (
                  <p className="text-errorRed text-xs">{errors.email}</p>
                )}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full rounded-md"
                  disabled={!!initialData} // Disable email field when editing
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label>
                    First Name <span className="text-errorRed">*</span>
                  </label>
                  {errors.firstName && (
                    <p className="text-errorRed text-xs">{errors.firstName}</p>
                  )}
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 w-full rounded-md"
                  />
                </div>

                <div>
                  <label>
                    Last Name <span className="text-errorRed">*</span>
                  </label>
                  {errors.lastName && (
                    <p className="text-errorRed text-xs">{errors.lastName}</p>
                  )}
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 w-full rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 w-full rounded-md"
                  />
                </div>

                <div>
                  <label>
                    Role <span className="text-errorRed">*</span>
                  </label>
                  {errors.role && (
                    <p className="text-errorRed text-xs">{errors.role}</p>
                  )}
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 w-full rounded-md"
                  >
                    <option value="staff">Staff</option>
                    <option value="trapper">Trapper</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-cyan-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-primaryGreen text-white px-4 py-2 rounded-lg flex items-center ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-secondaryGreen"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : initialData ? (
                    "Save Changes"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
