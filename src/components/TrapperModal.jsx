import React, { useState } from "react";
import { Checkmark, DeleteIcon } from "./svgs/Icons";
import uploadSignature from "../assets/images/upload-signature.png";
import { storage } from "../firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const TrapperModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    street: initialData.street || "",
    apartment: initialData.apartment || "",
    city: initialData.city || "",
    state: initialData.state || "FL",
    zip: initialData.zip || "",
    qualifies: initialData.qualifies || false,
    signature: initialData.signature || null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(initialData?.signature?.name || "");
  const [preview, setPreview] = useState(initialData?.signature || null);
  const [errors, setErrors] = useState({});

  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Validate the field and update errors
    if (!value.trim() && name !== "apartment") {
      setErrors((prev) => ({ ...prev, [name]: `${name} is required.` }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for valid input
    }
    console.log("Form Data: ", formData);
    console.log("Errors: ", errors);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0]; // Extract the dropped file

    if (file) {
      handleFileChange({ target: { files: [file] } }); // Call handleFileChange
    }
  };

  const handleClick = () => {
    document.getElementById("fileInput").click();
  };

  // Handle file validation and updates
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setErrors((prev) => ({ ...prev, signature: "Signature is required." }));
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        signature: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
      }));
      return;
    }

    // Validate file size
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      setErrors((prev) => ({
        ...prev,
        signature: "File size exceeds the maximum limit of 2MB.",
      }));
      return;
    }

    // If valid, update the state
    setFormData((prev) => ({ ...prev, signature: file }));
    setFileName(file.name);
    setErrors((prev) => ({ ...prev, signature: "" })); // Clear errors
    generatePreview(file);
  };

  // Generate preview for the image file
  const generatePreview = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result); // Set the preview URL
    };
    reader.readAsDataURL(file);
  };

  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "street",
    "city",
    "state",
    "zip",
    "signature",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final validation before submission
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field} is required.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let signatureUrl = formData.signature;

      // If a file was uploaded, upload it to Firebase Storage
      if (formData.signature instanceof File) {
        const storageRef = ref(
          storage,
          `signatures/${Date.now()}_${formData.signature.name}`
        );
        const snapshot = await uploadBytes(storageRef, formData.signature);
        signatureUrl = await getDownloadURL(snapshot.ref);
      }

      // Save the formData to Firestore, replacing the file with its URL
      const formDataToSave = {
        ...formData,
        signature: signatureUrl,
      };

      onSave(formDataToSave);
      onClose();
    } catch (error) {
      console.error("Error uploading file or saving data:", error);
      setErrors((prev) => ({
        ...prev,
        signature: "Failed to upload signature. Please try again.",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl py-8 px-16 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">
          {initialData.id ? "Edit Trapper" : "Add Trapper"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
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
              />
            </div>
            <div>
              <label>
                Phone Number <span className="text-errorRed">*</span>
              </label>
              {errors.phone && (
                <p className="text-errorRed text-xs">{errors.phone}</p>
              )}
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3">
              <label>
                Street Address <span className="text-errorRed">*</span>
              </label>
              {errors.street && (
                <p className="text-errorRed text-xs">{errors.street}</p>
              )}
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-2">
              <label>Apartment</label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-6">
              <label>
                City <span className="text-errorRed">*</span>
              </label>
              {errors.city && (
                <p className="text-errorRed text-xs">{errors.city}</p>
              )}
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-3">
              <label>
                State <span className="text-errorRed">*</span>
              </label>
              {errors.state && (
                <p className="text-errorRed text-xs">{errors.state}</p>
              )}
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-3">
              <label>
                Zip Code <span className="text-errorRed">*</span>
              </label>
              {errors.zip && (
                <p className="text-errorRed text-xs">{errors.zip}</p>
              )}
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label>
              Signature <span className="text-errorRed">*</span>
            </label>
            <div
              className={`rounded-lg p-4 text-center cursor-pointer ${
                fileName ? "border-none" : "border-dashed border-2"
              } ${
                isDragging
                  ? "border-primaryGreen bg-teal-50 cursor-grabbing"
                  : "border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              {preview ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setPreview(null);
                      setFileName("");
                      handleFileChange({ target: { files: [] } });
                    }}
                    className="text-secondaryGray hover:text-errorRed absolute top-2 right-2"
                    title="Delete Signature Image File"
                  >
                    <DeleteIcon />
                  </button>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-40 h-20 object-contain mx-auto mb-2 rounded"
                  />
                </div>
              ) : (
                <div>
                  <img
                    src={uploadSignature}
                    alt="Upload"
                    className="mx-auto mb-4"
                  />
                  <p className="text-sm">
                    Drag and Drop Image of Signature here or Choose File
                  </p>
                  <p className="text-xs text-secondaryGray">
                    Maximum File size: 2 MB
                  </p>
                  <p className="text-xs text-secondaryGray">
                    Supported Formats: .png, .jpg, .jpeg
                  </p>
                </div>
              )}
              <input
                id="fileInput"
                type="file"
                name="signature"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.signature && (
                <p className="text-errorRed mt-2 text-xs">{errors.signature}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex items-start">
              <p className="label">Qualifies for TIP</p>
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  name="qualifies"
                  checked={formData.qualifies}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="checkbox mt-[2px]">
                  <Checkmark />
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-tertiaryGreen"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-primaryGreen text-white hover:bg-secondaryGreen"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrapperModal;
