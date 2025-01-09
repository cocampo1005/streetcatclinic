import React, { useEffect, useState } from "react";
import { BoldPlus, Checkmark, DeleteIcon, EditIcon, Plus } from "./svgs/Icons";
import uploadSignature from "../assets/images/upload-signature.png";
import { storage } from "../firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useTrappers } from "../contexts/TrappersContext";

const TrapperModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const { trappers } = useTrappers();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: {
      street: initialData.address?.street || "",
      apartment: initialData.address?.apartment || "",
      city: initialData.address?.city || "",
      state: initialData.address?.state || "FL",
      zip: initialData.address?.zip || "",
    },
    code: initialData.code || "",
    trapperId: initialData.trapperId || "",
    qualifies: initialData.qualifies || false,
    signature: initialData.signature || null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(initialData?.signature?.name || "");
  const [preview, setPreview] = useState(initialData?.signature || null);
  const [errors, setErrors] = useState({});

  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  console.log("Initial Data:", initialData);

  const getNextTrapperId = (trappers) => {
    if (trappers.length === 0) return "1"; // Default to "1" if no trappers exist
    const lastTrapper = trappers[trappers.length - 1]; // Get the last trapper
    return (parseInt(lastTrapper.trapperId, 10) + 1).toString(); // Increment and return as a string
  };

  // Set the default trapperId when the component mounts
  useEffect(() => {
    if (!initialData.trapperId) {
      const nextTrapperId = getNextTrapperId(trappers);
      console.log(initialData);

      setFormData((prevData) => ({
        ...prevData,
        trapperId: nextTrapperId,
      }));
    }
  }, [initialData, trappers]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested updates for `address` fields
    if (["street", "apartment", "city", "state", "zip"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      // Handle all other fields
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Validate required fields and update errors
    if (!value.trim() && name !== "apartment") {
      setErrors((prev) => ({ ...prev, [name]: `${name} is required.` }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for valid input
    }
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
    "address.street",
    "address.city",
    "address.state",
    "address.zip",
    "code",
    "trapperId",
  ];

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, key) => acc && acc[key], obj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data before validation:", formData);

    // Final validation before submission
    const newErrors = {};

    // Validate required fields, including nested properties
    requiredFields.forEach((field) => {
      const value = getNestedValue(formData, field);
      if (!value) {
        newErrors[field] = `${field} is required.`;
      }
    });

    // Handle errors for nested address fields explicitly
    if (!formData.address.street) {
      newErrors["address.street"] = "Street address is required.";
    }
    if (!formData.address.city) {
      newErrors["address.city"] = "City is required.";
    }
    if (!formData.address.state) {
      newErrors["address.state"] = "State is required.";
    }
    if (!formData.address.zip) {
      newErrors["address.zip"] = "ZIP code is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
      setErrors(newErrors);
      return;
    }

    try {
      let signatureUrl = formData.signature;

      // If a file was uploaded, upload it to Firebase Storage
      if (formData.signature instanceof File) {
        console.log(
          "Uploading file to Firebase Storage:",
          formData.signature.name
        );
        const storageRef = ref(
          storage,
          `signatures/${Date.now()}_${formData.signature.name}`
        );
        const snapshot = await uploadBytes(storageRef, formData.signature);
        console.log("File uploaded, Firebase Storage snapshot:", snapshot);
        signatureUrl = await getDownloadURL(snapshot.ref);
        console.log("Generated file URL:", signatureUrl);
      }

      // Save the formData to Firestore, replacing the file with its URL
      const formDataToSave = {
        ...formData,
        signature: signatureUrl,
      };
      console.log("Data to save to Firestore:", formDataToSave);

      await onSave(formDataToSave);
      console.log("Data saved to Firestore successfully!");
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
      <div className="bg-white rounded-3xl py-12 px-16 w-full max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center text-primaryGreen">
              {initialData.id ? <EditIcon size="36px" /> : <BoldPlus />}
              <h2 className="text-3xl font-bold text-primaryGray font-accent pl-2">
                {initialData.id ? "Edit Trapper" : "Add Trapper"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <label>
                  Trapper ID <span className="text-errorRed">*</span>
                </label>
                {errors.trapperId && (
                  <p className="text-errorRed text-xs">{errors.trapperId}</p>
                )}
                <input
                  type="text"
                  name="trapperId"
                  value={formData.trapperId}
                  onChange={handleInputChange}
                  className="max-w-14"
                />
              </div>
              <div className="flex flex-col items-end">
                <label>
                  Trapper Code <span className="text-errorRed">*</span>
                </label>
                {errors.code && (
                  <p className="text-errorRed text-xs">{errors.code}</p>
                )}
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="max-w-20"
                />
              </div>
            </div>
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
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-2">
              <label>Apartment</label>
              <input
                type="text"
                name="apartment"
                value={formData.address.apartment}
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
                value={formData.address.city}
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
                value={formData.address.state}
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
                value={formData.address.zip}
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
              className="py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-green-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-primaryGreen text-white hover:bg-secondaryGreen"
            >
              {initialData.id ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrapperModal;
