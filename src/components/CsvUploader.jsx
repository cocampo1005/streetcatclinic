import React, { useState } from "react";
import Papa from "papaparse";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase-config";
import { useTrappers } from "../contexts/TrappersContext";

const CsvUploader = () => {
  const { trappers } = useTrappers();
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const data = results.data;

        // Filter out rows without a Cat ID
        const filteredData = data.filter(
          (row) => row["Cat ID"] && row["Cat ID"].trim() !== ""
        );

        console.log("Trappers from context:", trappers);

        // Clean and transform data
        const cleanedData = filteredData.map((row) => {
          const trapperField = row["Trapper/ Rescue ID and Address"] || "";

          let trapperId = null;
          let trapperName = null;

          // Check if the trapperField contains the expected format (ID - Name - Address)
          if (trapperField.includes("-")) {
            // Extract trapperId and metadata
            trapperId = trapperField.split("-")[0].trim(); // Extract ID
            trapperName = trapperField.split("-")[1]?.trim() || null; // Extract Name (optional)
          } else {
            // Assume this is a name-only case (e.g., "Mat Toscano")
            trapperName = trapperField.trim();
          }

          console.log("Extracted trapperId:", trapperId);
          console.log("Extracted trapperName:", trapperName);

          // Find existing trapper by ID (if present) or fall back to minimal data
          const trapper =
            trapperId && trappers.find((t) => t.trapperId === trapperId)
              ? trappers.find((t) => t.trapperId === trapperId)
              : {
                  trapperId: trapperId || "No ID",
                  name: trapperName || "Unknown",
                };

          console.log("Matched trapper:", trapper);

          return {
            trapper,
            intakePickupDate: row["Intake, SX & Pickup DATE"],
            service: row.Service || "",
            catId: row["Cat ID"],
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
            dosage: "", // Default if not provided
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
                  .replace(/^"(.*)"$/, "$1") // Remove surrounding quotes
                  .split(/,(?![^"]*")/) // Split by commas not enclosed in quotes
                  .map((note) => note.trim()) // Trim each part
                  .join(", ") // Join back into a single string
              : "",
            additionalNotes: row["Additional Notes/ Medications"] || "",
            veterinarian: row.Veterinarian || "Toscano-17161",
            outcome: row.Outcome || "",
            qualifiesForTIP: row["Qualifies for TIP?"]
              ?.trim()
              .toLowerCase()
              .startsWith("yes"),
          };
        });

        try {
          const collectionRef = collection(db, "records"); // Reference to the "records" collection

          for (const item of cleanedData) {
            console.log("Uploading:", item.catId, item);
            await addDoc(collectionRef, item); // Automatically generate a unique document ID
            console.log(
              `Successfully uploaded entry with Cat ID: ${item.catId}`
            );
          }
          alert("Data upload complete!");
        } catch (error) {
          console.error("Error uploading data:", error.message, error);
          alert("An error occurred. Check the console for details.");
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
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="ml-4 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite font-bold py-2 px-4 rounded-lg"
      >
        Upload
      </button>
    </div>
  );
};

export default CsvUploader;
