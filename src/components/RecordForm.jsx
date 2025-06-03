import React, { useEffect, useState } from "react";
import MultiSelect from "../components/MultiSelectInput";
import EditableSelect from "../components/EditableSelect";
import { Checkmark, NoCert } from "../components/svgs/Icons";
import qualified from "../assets/icons/qualified-icon.png";
import notQualified from "../assets/icons/not-qualified-icon.png";
import { useTrappers } from "../contexts/TrappersContext";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { NewEntryIcon } from "./svgs/NavIcons";
import useRecords from "../hooks/useRecords";
import { generateMDASTIPFormPDF } from "../utils/pdfGenerator";
import { db, storage } from "../firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useDosageCalculation } from "../hooks/useDosageCalculations";
import { validateTIPEligibility } from "../utils/validateTIPEligibility";

// Helper function to format date with slashes (MM/DD/YYYY)
const formatDateWithSlashes = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

// Categories for dropdown options
const categories = [
  "services",
  "surgeriesPerformed",
  "surgicalNotes",
  "catColors",
  "breeds",
  "estimatedAges",
  "additionalDrugs",
  "outcomes",
];

export default function RecordForm({ initialData = {}, onClose }) {
  const { trappers } = useTrappers();
  const { createRecord, updateRecord } = useRecords();

  // Dropdown data states
  const [dropdowns, setDropdowns] = useState(
    categories.reduce((acc, category) => ({ ...acc, [category]: [] }), {})
  );

  //Modal and processing status states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");
  const [pdfStatus, setPdfStatus] = useState("idle");

  // Stores the default date and catId in sessionStorage
  const defaultDate =
    sessionStorage.getItem("intakePickupDate") ||
    formatDateWithSlashes(new Date());
  const defaultCatId = sessionStorage.getItem("catId") || `${defaultDate}- `;

  // Override TIP qualifications state
  const [overrideQualificationsActive, setOverrideQualificationsActive] =
    useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    trapper: initialData.trapper || "",
    intakePickupDate: initialData.intakePickupDate || defaultDate,
    intakeTimestamp: initialData.intakeTimestamp
      ? initialData.intakeTimestamp instanceof Timestamp
        ? initialData.intakeTimestamp
        : Timestamp.fromDate(new Date(initialData.intakeTimestamp))
      : Timestamp.fromDate(new Date(defaultDate)),
    service: initialData.service || "",
    catId: initialData.catId || defaultCatId,
    catNumber: initialData.catNumber || null,
    crossStreet: initialData.crossStreet || "",
    crossZip: initialData.crossZip || "",
    microchip: initialData.microchip || false,
    microchipNumber: initialData.microchipNumber || "",
    rabies: initialData.rabies || false,
    rabiesWithoutCertificate: initialData.rabiesWithoutCertificate || false,
    FVRCP: initialData.FVRCP || false,
    FeLVFIV: initialData.FeLVFIV || "",
    weight: initialData.weight || "",
    additionalDrug: initialData.additionalDrug || "",
    dosage: initialData.dosage || "",
    catName: initialData.catName || "",
    age: initialData.age || "",
    additionalNotes: initialData.additionalNotes || "",
    sex: initialData.sex || "",
    breed: initialData.breed || "",
    color: initialData.color || [],
    surgeriesPerformed: initialData.surgeriesPerformed || [],
    surgicalNotes: initialData.surgicalNotes || "",
    veterinarian: initialData.veterinarian || "Toscano-17161",
    outcome: initialData.outcome || "Alive",
    qualifiesForTIP: false,
  });

  // Fetch dropdown options from Firestore
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const newDropdowns = { ...dropdowns };

        await Promise.all(
          categories.map(async (category) => {
            const docRef = doc(db, `dropdownOptions`, category);
            const docSnap = await getDoc(docRef);

            newDropdowns[category] = docSnap.exists()
              ? docSnap.data().options
              : [];
          })
        );

        setDropdowns(newDropdowns);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      } finally {
      }
    };

    fetchDropdowns();
  }, []);

  // Automatically generate catNumber when catId changes
  useEffect(() => {
    if (formData.catId) {
      const trimmedCatId = formData.catId.trim();
      const match = trimmedCatId.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})- (\d+)$/
      );
      if (match) {
        let [, month, day, year, number] = match;

        // Convert 2-digit year to 4-digit year (assume 20XX)
        if (year.length === 2) {
          year = `20${year}`;
        }

        // Ensure number suffix is always 3 digits (pad with leading zeros)
        const paddedNumber = number.padStart(3, "0"); // "2" → "002", "12" → "012"

        const newCatNumber = parseInt(
          `${year}${month.padStart(2, "0")}${day.padStart(
            2,
            "0"
          )}${paddedNumber}`,
          10
        );
        setFormData((prev) => ({ ...prev, catNumber: newCatNumber }));
      }
    }
  }, [formData.catId]);

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updatedValue = type === "checkbox" ? checked : value;
    let updatedIntakeTimestamp = formData.intakeTimestamp;

    // If changing intakePickupDate, update intakeTimestamp and sessionStorage values
    if (name === "intakePickupDate") {
      sessionStorage.setItem("intakePickupDate", value);
      const newCatId = `${value}- `;
      sessionStorage.setItem("catId", newCatId);

      setFormData((prev) => ({
        ...prev,
        intakePickupDate: value,
        intakeTimestamp: Timestamp.fromDate(new Date(value)),
        catId: newCatId,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
      intakeTimestamp: updatedIntakeTimestamp,
    }));
  };

  // Trapper change logic
  const handleTrapperChange = (e) => {
    const selectedId = e.target.value;
    const trapper = trappers.find((t) => t.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      trapper: trapper || "",
    }));
  };

  // Update sex based on surgeries performed
  useEffect(() => {
    if (formData.surgeriesPerformed.includes("Neuter (Male)")) {
      setFormData((prev) => ({
        ...prev,
        sex: "Male",
      }));
    } else if (formData.surgeriesPerformed.includes("Spay (Female)")) {
      setFormData((prev) => ({
        ...prev,
        sex: "Female",
      }));
    }
  }, [formData.surgeriesPerformed]);

  // Use the hook to calculate dosage based on weight and drug
  const calculatedDosage = useDosageCalculation(
    formData.weight,
    formData.additionalDrug
  );

  // Update formData when calculatedDosage changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dosage: calculatedDosage,
    }));
  }, [calculatedDosage]);

  // Check if the record qualifies for TIP
  useEffect(() => {
    const trapperQualifies = formData.trapper && formData.trapper.qualifies;
    const serviceQualifies = formData.service === "MD-TNVR";

    setFormData((prev) => ({
      ...prev,
      qualifiesForTIP: trapperQualifies && serviceQualifies,
    }));
  }, [formData.trapper, formData.service]);

  // Microchip change handler
  const handleMicrochipChange = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      microchip: isChecked,
      microchipNumber: isChecked ? prev.microchipNumber : "",
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsModalOpen(true);
    setModalType("processing");
    setModalMessage("Saving record...");

    try {
      let recordRef;

      if (initialData && initialData.id) {
        // Update an existing ecord
        await updateRecord(initialData.id, formData);
        recordRef = initialData.id;
        setModalMessage("Record updated successfully!");
        setModalType("success");
      } else {
        // Create a new record
        let pdfUrl = null;

        if (formData.qualifiesForTIP) {
          const validationErrors = validateTIPEligibility(formData);
          if (validationErrors.length > 0) {
            setModalType("error");
            setModalMessage(
              <>
                <p className="text-lg text-center font-bold mb-2">
                  ❌ Cannot generate TIP PDF
                </p>
                <p className="text-center">
                  The following fields are required for TIP PDF generation:
                </p>
                <p>{validationErrors.join("\n")}</p>
                <p className="text-center mt-2">
                  Please fill out all required fields and try again.
                </p>
              </>
            );
            setIsModalOpen(true);
            setPdfStatus("error");
            return;
          }

          setPdfStatus("generating");
          setModalMessage("📄 Generating TIP PDF...");

          try {
            const pdfBlob = await generateMDASTIPFormPDF(formData);
            if (!pdfBlob) throw new Error("PDF blob is null");

            setPdfStatus("uploading");
            setModalMessage("⬆ Uploading TIP PDF to Firebase...");

            // Use intakeTimestamp for naming, falling back to current date if necessary
            const intakeDate = formData.intakeTimestamp?.toDate();

            if (!intakeDate) {
              console.error(
                "Record is missing intakeTimestamp, cannot generate PDF with date-based naming.",
                formData
              );
              throw new Error("Missing Intake Date for PDF naming.");
            }

            const year = intakeDate.getFullYear();
            const month = String(intakeDate.getMonth() + 1).padStart(2, "0");
            const safeCatId = formData.catId.replace(/\//g, "_");

            const pdfPath = `pdfs/${year}-${month}/${safeCatId}_MDAS_TIP_Form.pdf`;
            const pdfRef = ref(storage, pdfPath);
            await uploadBytes(pdfRef, pdfBlob);
            pdfUrl = await getDownloadURL(pdfRef);

            setPdfStatus("completed");
            setModalMessage("✅ PDF successfully generated and uploaded!");
          } catch (pdfError) {
            console.error("❌ Error generating/uploading PDF:", pdfError);
            setPdfStatus("error");
            setModalMessage(
              "❌ Failed to generate PDF. Please fix the error and try again."
            );
            setModalType("error");
            return;
          }
        }

        // ✅ Create the record last (with or without pdfUrl)
        setModalMessage("💾 Saving record...");
        const docRef = await createRecord({
          ...formData,
          ...(pdfUrl ? { pdfUrl } : {}),
        });

        setModalMessage("✅ Record created successfully!");
        setModalType("success");

        // Store the default date and catId in sessionStorage
        const resetDate =
          sessionStorage.getItem("intakePickupDate") ||
          formatDateWithSlashes(new Date());
        const resetCatId = sessionStorage.getItem("catId") || `${resetDate}- `;

        // Reset fields to defaults
        setFormData((prev) => ({
          ...prev,
          trapper: "",
          intakePickupDate: resetDate,
          intakeTimestamp: Timestamp.fromDate(new Date(resetDate)),
          service: "",
          catId: resetCatId,
          catNumber: null,
          crossStreet: "",
          crossZip: "",
          microchip: false,
          microchipNumber: "",
          rabies: false,
          rabiesWithoutCertificate: false,
          FVRCP: false,
          FeLVFIV: "",
          weight: "",
          additionalDrug: "",
          dosage: "",
          catName: "",
          age: "",
          additionalNotes: "",
          sex: "",
          breed: "",
          color: [],
          surgeriesPerformed: [],
          surgicalNotes: "",
          veterinarian: "",
          outcome: "",
          qualifiesForTIP: false,
        }));
      }
      setModalType("success");
    } catch (error) {
      console.error("Error submitting record:", error);
      setModalMessage(
        "An error occurred while saving the record. Please try again."
      );
      setModalType("error");
      setIsModalOpen(true);
      setPdfStatus("error");
    }
  };

  return (
    <>
      {/* Modal UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-cyan-950 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white max-w-[60%] rounded-3xl py-8 px-16 flex flex-col justify-center items-center">
            {/* Modal Title */}
            <h2
              className={`text-3xl pb-4 font-bold ${
                modalType === "error"
                  ? "text-errorRed"
                  : modalType === "success"
                  ? "text-primaryGreen"
                  : "text-primaryGray"
              }`}
            >
              {modalType === "processing"
                ? "Processing"
                : modalType === "error"
                ? "Error"
                : "Success"}
            </h2>

            {/* Modal Message / PDF Status */}
            {modalType === "processing" ? (
              <>
                {/* Only show PDF messages if the entry qualifies for TIP */}
                {formData.qualifiesForTIP ? (
                  <>
                    {pdfStatus === "generating" && (
                      <p className="text-primaryGray text-lg">
                        📄 Generating PDF, please wait...
                      </p>
                    )}
                    {pdfStatus === "uploading" && (
                      <p className="text-primaryGray text-lg">
                        ⬆ Uploading PDF to database...
                      </p>
                    )}
                    {pdfStatus === "completed" && (
                      <p className="text-primaryGray text-lg">
                        ✅ PDF successfully generated and uploaded!
                      </p>
                    )}
                    {pdfStatus === "error" && (
                      <p className="text-errorRed text-lg">
                        ❌ Failed to generate PDF. Please try again.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-primaryGray text-lg">
                    💾 Saving record...
                  </p>
                )}
              </>
            ) : (
              <div className="mt-2 pb-4">{modalMessage}</div>
            )}

            {/* Close Button */}
            {(modalType === "success" || modalType === "error") && (
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (modalType === "success" && onClose) onClose();
                }}
                className="mt-4 px-10 py-2 bg-primaryGreen text-white rounded-lg"
              >
                Okay
              </button>
            )}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-flow-col gap-6 mb-6">
          {/* Trapper */}
          <div>
            <label htmlFor="trapper">Trapper</label>
            <select
              id="trapper"
              name="trapper"
              value={formData.trapper.id || ""}
              className={
                formData.trapper ? "text-primaryGray" : "text-gray-400"
              }
              onChange={handleTrapperChange}
            >
              <option value="" disabled hidden>
                Select a trapper
              </option>
              {trappers.map((currTrapper) => (
                <option
                  key={currTrapper.id}
                  value={currTrapper.id}
                  className="text-primaryGray"
                >
                  {currTrapper.trapperId} - {currTrapper.firstName}{" "}
                  {currTrapper.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Date */}
          <div>
            <label htmlFor="intakePickupDate">Intake / Pickup Date</label>
            <input
              id="intakePickupDate"
              name="intakePickupDate"
              type="text"
              value={formData.intakePickupDate}
              placeholder="Enter Date"
              onChange={handleFieldChange}
            />
          </div>

          {/* Service */}
          <div>
            <label htmlFor="service">Service</label>
            <select
              id="service"
              name="service"
              value={formData.service}
              className={
                formData.service ? "text-primaryGray" : "text-gray-400"
              }
              onChange={handleFieldChange}
            >
              <option value="" disabled hidden>
                Select a service
              </option>
              {dropdowns.services.map((currService, index) => (
                <option
                  key={index}
                  value={currService}
                  className="text-primaryGray"
                >
                  {currService}
                </option>
              ))}
            </select>
          </div>

          {/* Cat ID */}
          <div>
            <label htmlFor="catId">Cat ID</label>
            <input
              id="catId"
              name="catId"
              type="text"
              value={formData.catId}
              placeholder="Enter Cat ID"
              onChange={handleFieldChange}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="flex gap-6 mb-6">
          <div className="w-3/5 flex flex-col">
            <div className="flex gap-6">
              {/* TNR - Cross Street */}
              <div className="w-full min-w-[143px]">
                <label htmlFor="crossStreet">TNR - Cross Street</label>
                <input
                  id="crossStreet"
                  name="crossStreet"
                  type="text"
                  value={formData.crossStreet}
                  placeholder="Enter cross street"
                  onChange={handleFieldChange}
                />
              </div>
              {/* Zip Code */}
              <div className="min-w-28">
                <label htmlFor="crossZip">Zip Code</label>
                <input
                  id="crossZip"
                  name="crossZip"
                  type="text"
                  value={formData.crossZip}
                  placeholder="Enter zip"
                  onChange={handleFieldChange}
                />
              </div>
              {/* Microchip */}
              <div className="min-w-40">
                <div className="flex items-center">
                  <label className="pr-3" htmlFor="microchip">
                    Microchip
                  </label>
                  <label className="custom-checkbox">
                    <input
                      name="microchip"
                      type="checkbox"
                      className="hidden"
                      checked={formData.microchip}
                      onChange={handleMicrochipChange}
                    />
                    <span className="checkbox">
                      <Checkmark />
                    </span>
                  </label>
                </div>
                <input
                  id="microchipNumber"
                  name="microchipNumber"
                  type="text"
                  placeholder={
                    formData.microchip ? "Enter microchip #" : "No microchip"
                  }
                  disabled={!formData.microchip} // Disable if microchip checkbox is unchecked
                  value={formData.microchipNumber}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
          </div>

          {/* Check Boxes */}
          <div className="flex flex-col justify-between w-2/5 h-[70px]">
            <div className="flex justify-between">
              <div className="flex items-start">
                <p className="label">Rabies</p>
                <label className="custom-checkbox">
                  <input
                    name="rabies"
                    type="checkbox"
                    checked={formData.rabies}
                    onChange={handleFieldChange}
                    className="hidden"
                  />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label mr-1">Rabies</p>
                <NoCert />
                <label className="custom-checkbox">
                  <input
                    name="rabiesWithoutCertificate"
                    type="checkbox"
                    checked={formData.rabiesWithoutCertificate}
                    onChange={handleFieldChange}
                    className="hidden"
                  />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
              <div className="flex items-start">
                <p className="label">FVRCP</p>
                <label className="custom-checkbox">
                  <input
                    name="FVRCP"
                    type="checkbox"
                    checked={formData.FVRCP}
                    onChange={handleFieldChange}
                    className="hidden"
                  />
                  <span className="checkbox mt-[2px]">
                    <Checkmark />
                  </span>
                </label>
              </div>
            </div>

            {/* FelV/FIV Options */}
            <div className="flex justify-between items-end">
              <div className="flex w-full">
                <p className="text-labelGray font-bold block mr-3">FeLV/FIV</p>
                <div className="flex w-full justify-between">
                  {["- / -", "+ / -", "- / +"].map((text, index) => (
                    <button
                      key={index}
                      className={`rounded-full px-4 text-sm font-bold border border-secondaryGray 
                        ${
                          formData.FeLVFIV === text
                            ? "bg-primaryGreen text-white border-primaryGreen"
                            : "text-labelGray hover:border-primaryGreen hover:text-primaryGreen"
                        }
                        transition`}
                      type="button"
                      name="FeLVFIV"
                      value={text}
                      onClick={handleFieldChange}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="flex gap-6 mb-6">
          <div className="w-3/5">
            {/* Surgeries Performed */}
            <MultiSelect
              label="Services Performed"
              options={dropdowns.surgeriesPerformed}
              placeholder="Select services"
              value={formData.surgeriesPerformed}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  surgeriesPerformed: selected,
                }))
              }
            />
          </div>
          <div className="w-2/5 flex gap-6">
            {/* Weight */}
            <div className="min-w-28">
              <label htmlFor="weight" className="block">
                Weight
              </label>
              <div className="relative">
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  value={formData.weight}
                  onChange={handleFieldChange}
                />
                <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                  lbs
                </span>
              </div>
            </div>

            {/* Additional Drugs */}
            <div className="w-full min-w-[130px]">
              <label htmlFor="additionalDrug">Additional Drugs</label>
              <select
                id="additionalDrug"
                name="additionalDrug"
                value={formData.additionalDrug}
                className={
                  formData.additionalDrug ? "text-primaryGray" : "text-gray-400"
                }
                onChange={handleFieldChange}
              >
                <option value="" disabled hidden>
                  Select a drug
                </option>
                {dropdowns.additionalDrugs.map((drug, index) => (
                  <option key={index} value={drug} className="text-primaryGray">
                    {drug}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosage */}
            <div className="min-w-28">
              <label htmlFor="dosage" className="block">
                Dosage
              </label>
              <div className="relative">
                <input
                  id="dosage"
                  name="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={handleFieldChange}
                />
                <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                  mls
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fourth Row */}
        <div className="flex gap-6 mb-6">
          {/* Surgical Notes */}
          <div className="w-3/5">
            <label htmlFor="surgicalNotes" className="block">
              Surgical Notes
            </label>
            <EditableSelect
              options={dropdowns.surgicalNotes}
              selectedValue={formData.surgicalNotes}
              value={formData.surgicalNotes}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, surgicalNotes: value }))
              }
            />
          </div>
          <div className="w-2/5 flex gap-6">
            {/* Cat's Name */}
            <div className="w-full">
              <label htmlFor="catName">Cat's Name</label>
              <input
                id="catName"
                name="catName"
                type="text"
                placeholder="Enter Name"
                value={formData.catName}
                onChange={handleFieldChange}
                onFocus={(e) => e.target.select()}
              />
            </div>

            {/* Age */}
            <div className="w-full">
              <label htmlFor="age">Age (Estimate)</label>
              <select
                id="age"
                name="age"
                value={formData.age}
                className={formData.age ? "text-primaryGray" : "text-gray-400"}
                onChange={handleFieldChange}
              >
                <option value="" disabled hidden>
                  Estimate age
                </option>
                {dropdowns.estimatedAges.map((estAge, index) => (
                  <option
                    key={index}
                    value={estAge}
                    className="text-primaryGray"
                  >
                    {estAge}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fifth Row */}
        <div className="flex gap-6 mb-6">
          <div className="w-3/5">
            <div className="w-full h-[132px]">
              <label htmlFor="additionalNotes">
                Additional Notes / Medications
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                type="text"
                placeholder="Enter additonal notes or medications here"
                value={formData.additionalNotes}
                onChange={handleFieldChange}
                className="h-full"
              />
            </div>
          </div>
          <div className="w-2/5 flex flex-col">
            <div className="flex w-full gap-6 mb-6">
              {/* Sex */}
              <div className="min-w-24">
                <label htmlFor="sex">Sex</label>
                <select
                  id="sex"
                  name="sex"
                  className={
                    formData.sex ? "text-primaryGray" : "text-gray-400"
                  }
                  value={formData.sex}
                  onChange={handleFieldChange}
                >
                  <option value="" disabled hidden>
                    Select
                  </option>
                  <option className="text-primaryGray">Male</option>
                  <option className="text-primaryGray">Female</option>
                </select>
              </div>

              {/* Breed */}
              <div className="w-full">
                <label htmlFor="breed">Breed</label>
                <select
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  className={
                    formData.breed ? "text-primaryGray" : "text-gray-400"
                  }
                  onChange={handleFieldChange}
                >
                  <option value="" disabled hidden>
                    Select a breed
                  </option>
                  {dropdowns.breeds.map((currBreed, index) => (
                    <option
                      key={index}
                      value={currBreed}
                      className="text-primaryGray"
                    >
                      {currBreed}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              {/* Color */}
              <MultiSelect
                label="Color"
                options={dropdowns.catColors}
                value={formData.color}
                placeholder="Select color(s)"
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, color: selected }))
                }
              />
            </div>
          </div>
        </div>

        {/* Sixth Row */}
        <div className="flex gap-6 justify-between">
          {/* Vet */}
          <div className="w-40">
            <label>Veterinarian</label>
            <input
              id="veterinarian"
              name="veterinarian"
              type="text"
              defaultValue="Toscano-17161"
              onFocus={(e) => e.target.select()}
            />
          </div>

          {/* Outcome */}
          <div className="flex-grow">
            <label htmlFor="outcome">Outcome</label>
            <select
              id="outcome"
              name="outcome"
              value={formData.outcome || "Alive"}
              onChange={handleFieldChange}
            >
              <option value="Alive">Alive</option>
              {dropdowns.outcomes.map((currOutcome, index) => (
                <option
                  key={index}
                  value={currOutcome}
                  className="text-primaryGray"
                >
                  {currOutcome}
                </option>
              ))}
            </select>
          </div>

          {/* Entry TIP Qualification */}
          <div className="flex-grow">
            <label>Qualifies for TIP?</label>

            {formData.trapper !== "" && formData.service !== "" ? (
              <div
                className={`flex h-[38px] items-center gap-2 transition ${
                  formData.qualifiesForTIP
                    ? "text-primaryGreen"
                    : "text-errorRed"
                }`}
              >
                <img
                  src={formData.qualifiesForTIP ? qualified : notQualified}
                  // Override TIP Qualifications if necessary
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      qualifiesForTIP: !prev.qualifiesForTIP,
                    }));
                    setOverrideQualificationsActive(true);
                  }}
                  className="cursor-pointer"
                  alt="TIP Qualification Status"
                />
                <p className="text-xs">
                  {overrideQualificationsActive
                    ? formData.qualifiesForTIP
                      ? "Qualifications overridden"
                      : "Qualifications overridden"
                    : formData.qualifiesForTIP
                    ? "Trapper qualifies for TIP"
                    : formData.service === "MD-TNVR"
                    ? "Trapper does not qualify for TIP (Click to override)"
                    : "Service is not MD-TNVR"}
                </p>
              </div>
            ) : null}
          </div>

          {/* Submission Button */}
          <div className="flex items-end gap-6">
            {/* New Entry Submission Button */}
            {!initialData.id ? (
              <button
                type="submit"
                // className="flex gap-3 items-center text-lg bg-primaryGreen text-primaryWhite px-6 py-2 rounded-lg hover:bg-secondaryGreen active:bg-primaryGreen"
                className={`flex items-center text-lg gap-3 px-6 py-2 rounded-lg
                  ${
                    formData.trapper && formData.service
                      ? "bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite"
                      : "bg-gray-300 text-primaryWhite cursor-not-allowed"
                  }`}
                disabled={!formData.trapper || !formData.service}
              >
                <NewEntryIcon />
                Submit New Entry
              </button>
            ) : (
              <>
                {/* Record Update Buttons*/}
                <button
                  type="button"
                  className="h-[50px] py-2 px-4 font-bold border-2 border-primaryGreen text-primaryGreen rounded-lg hover:bg-cyan-100"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[50px] py-2 px-4 rounded-lg bg-primaryGreen text-white hover:bg-secondaryGreen"
                  disabled={!formData.trapper || !formData.service}
                >
                  Update Record
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
