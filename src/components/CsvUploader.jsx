import React, { useState } from "react";
import Papa from "papaparse";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { useTrappers } from "../contexts/TrappersContext";
import { getDownloadURL, ref } from "firebase/storage";

const CsvUploader = () => {
  const { trappers } = useTrappers();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Track upload state
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload percentage
  const [message, setMessage] = useState(""); // Show messages to user

  const formatDateForFirestore = (dateString) => {
    if (!dateString) return null;

    const parts = dateString.split("/");
    if (parts.length !== 3) return null; // Ensure it's MM/DD/YYYY

    let [month, day, year] = parts;
    if (year.length === 2) {
      year = `20${year}`; // Convert "24" to "2024"
    }

    const parsedDate = new Date(`${year}-${month}-${day}`);
    return isNaN(parsedDate) ? null : parsedDate; // Ensure it's a valid date
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage("Processing CSV file...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const data = results.data;

        // Filter out rows without a Cat ID
        const filteredData = data.filter(
          (row) => row["Cat ID"] && row["Cat ID"].trim() !== ""
        );

        setMessage("Cleaning and transforming data...");
        // Clean and transform data
        const cleanedData = await Promise.all(
          filteredData.map(async (row) => {
            // Extract Trapper IDand Name
            const trapperField = row["Trapper/ Rescue ID and Address"] || "";

            let trapperId = null;
            let trapperName = null;

            if (trapperField.includes("-")) {
              trapperId = trapperField.split("-")[0].trim();
              trapperName = trapperField.split("-")[1]?.trim() || null;
            } else {
              trapperName = trapperField.trim();
            }

            // Set Trapper to full object if found in trappers list
            const trapper =
              trapperId && trappers.find((t) => t.trapperId === trapperId)
                ? trappers.find((t) => t.trapperId === trapperId)
                : {
                    trapperId: trapperId || "No ID",
                    name: trapperName || "Unknown",
                  };

            // Check if record qualified for TIP
            const qualifiesForTIP = row["Qualifies for TIP?"]
              ?.trim()
              .toLowerCase()
              .startsWith("yes");

            let pdfUrl = null;

            // If qualified, assign PDF URL from storage
            if (qualifiesForTIP) {
              const sanitizedCatId = row["Cat ID"].trim().replace(/\//g, "_"); // Replace "/" with "_" and trim whitespace
              const fileName = `${sanitizedCatId}_MDAS_TIP_Form.pdf`;
              console.log(`Looking for file: pdfForms/${fileName}`);
              const pdfRef = ref(storage, `pdfForms/${fileName}`);
              try {
                pdfUrl = await getDownloadURL(pdfRef); // Fetch the PDF URL
              } catch (error) {
                console.error(
                  `Error fetching PDF for Cat ID ${row["Cat ID"]}:`,
                  error
                );
              }
            }

            // Extract and reformat catNumber from Cat ID
            let catNumber = null;
            if (row["Cat ID"]) {
              const trimmedCatId = row["Cat ID"].trim(); // Trim extra spaces before processing

              // Matches both "10/23/24- 37" and "10/30/2024- 2"
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

                catNumber = parseInt(
                  `${year}${month.padStart(2, "0")}${day.padStart(
                    2,
                    "0"
                  )}${paddedNumber}`,
                  10
                );
              }
            }

            return {
              trapper,
              intakePickupDate: row["Intake, SX & Pickup DATE"],
              intakeTimestamp: formatDateForFirestore(
                row["Intake, SX & Pickup DATE"]
              )
                ? Timestamp.fromDate(
                    formatDateForFirestore(row["Intake, SX & Pickup DATE"])
                  )
                : null, // Convert to Firestore Timestamp
              service: row.Service || "",
              catId: row["Cat ID"].trim(),
              catNumber,
              crossStreet: row["TNR-Cross Street Trapped"] || "",
              crossZip: row["TNR- Zip Code Trapped"] || "",
              microchip: row.Microchip === "TRUE",
              microchipNumber: row["Microchip #"] || "",
              rabies: row.Rabies === "TRUE",
              rabiesWithoutCertificate: row["TNR Rabies Given- No Certificate"]
                ? row["TNR Rabies Given- No Certificate"] === "TRUE"
                : false,
              FVRCP: row.FVRCP === "TRUE",
              FeLVFIV: row["FeLV/FIV"] || "N/A",
              weight: row["Wt (lb)"] || "",
              additionalDrug: row["Additional Drugs"] || "",
              dosage: "",
              catName: row["RESCUE- Cat Name"] || "Unnamed",
              age: row["Estimated Age"] || "",
              sex: row["Surgery Performed"].includes("Female")
                ? "Female"
                : row["Surgery Performed"].includes("Male")
                ? "Male"
                : "",
              breed: row.Breed || "",
              color: row["Color"]
                ? row["Color"].split(",").map((c) => c.trim())
                : [],
              surgeriesPerformed: row["Surgery Performed"]
                ? row["Surgery Performed"].split(",").map((s) => s.trim())
                : [],
              surgicalNotes: row["Surgical Notes"]
                ? row["Surgical Notes"]
                    .replace(/^"(.*)"$/, "$1")
                    .split(/,(?![^"]*")/)
                    .map((note) => note.trim())
                    .join(", ")
                : "",
              additionalNotes: row["Additional Notes/ Medications"] || "",
              veterinarian: row.Veterinarian || "Toscano-17161",
              outcome: row.Outcome || "",
              qualifiesForTIP,
              pdfGenerated: qualifiesForTIP,
              pdfUrl,
            };
          })
        );

        // Transfer cleaned data to Firestore
        try {
          const collectionRef = collection(db, "records");
          let completed = 0;

          for (const item of cleanedData) {
            console.log("Uploading:", item.catId, item);
            await addDoc(collectionRef, item);
            completed++;
            setUploadProgress(
              Math.round((completed / cleanedData.length) * 100)
            );
            console.log(
              `Successfully uploaded entry with Cat ID: ${item.catId}`
            );
          }
          setMessage("Upload complete!");
        } catch (error) {
          console.error("Error uploading data:", error.message, error);
          setMessage("An error occurred. Check the console for details.");
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  return (
    <div>
      <h1>Upload CSV to Firestore</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button
        onClick={handleUpload}
        className={`ml-4 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite font-bold py-2 px-4 rounded-lg ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {isUploading && <p>{message}</p>}
      {isUploading && <progress value={uploadProgress} max="100"></progress>}
    </div>
  );
};

export default CsvUploader;
