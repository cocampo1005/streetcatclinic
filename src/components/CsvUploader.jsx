import React, { useState } from "react";
import Papa from "papaparse";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase-config";

const trappers = [
  { id: "1", name: "Tia Williams" },
  { id: "2", name: "Danny Alvarado (Sandra)" },
  { id: "3", name: "Tyler Kielbaey" },
  { id: "4", name: "Kirby Kielbaey" },
  { id: "5", name: "Joane Figueiredo" },
  { id: "6", name: "Deylu Rincon" },
  { id: "7", name: "Gigi Katz" },
  { id: "8", name: "Giselle Alvarado" },
  { id: "9", name: "Lisa Zavos" },
  { id: "10", name: "Juan Correa" },
  { id: "11", name: "Suely Caramelo" },
  { id: "12", name: "Danna Stillman" },
  { id: "13", name: "Leigh Buckner" },
  { id: "14", name: "Yasbel Flores" },
  { id: "15", name: "Candice D'Orsay" },
  { id: "16", name: "Christian Follard" },
  { id: "17", name: "Deborah Pachano" },
  { id: "18", name: "Diana Salcedo" },
  { id: "19", name: "Stephen Milo" },
  { id: "20", name: "Heidi Nichols" },
  { id: "21", name: "Stella Aguirre" },
  { id: "22", name: "Susan Hart" },
  { id: "23", name: "Nancy Perez" },
  { id: "24", name: "Nicole Degrace" },
  { id: "25", name: "Nathalie Shein" },
  { id: "26", name: "Gina Vlasek" },
  { id: "27", name: "Chasity Mack" },
  { id: "28", name: "Bruna Araujo" },
  { id: "29", name: "Nancy Piacentino" },
  { id: "30", name: "Hector Leonardo Diez" },
];

const CsvUploader = () => {
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

        // Clean and transform data
        const cleanedData = filteredData.map((row) => {
          const trapperId = row["Trapper/ Rescue ID and Address"]
            .split("-")[0]
            .trim();
          const trapper = trappers.find((t) => t.id === trapperId) || {
            id: trapperId,
          };

          return {
            trapper,
            intakePickupDate: row["Intake, SX & Pickup DATE"],
            service: row.Service || "",
            catId: row["Cat ID"],
            crossStreet: row["TNR-Cross Street Trapped"] || "",
            microchip: row.Microchip === "TRUE",
            microchipNumber: row["Microchip #"] || "",
            rabies: row.Rabies === "TRUE",
            rabiesWithoutCertificate: row["TNR Rabies Given- No Certificate"]
              ? row["TNR Rabies Given- No Certificate"] === "TRUE"
              : false,
            FVRCP: row.FVRCP === "TRUE",
            FeLVFIV: row["FeLV/FIV"] || "",
            weight: row["Wt (lb)"] || "",
            additionalDrug: row["Additional Drugs"] || "",
            dosage: "", // Default if not provided
            catName: row["RESCUE- Cat Name"] || "No Name",
            age: row["Estimated Age"] || "",
            sex: row["Surgery Performed"].includes("Female")
              ? "Female"
              : "Male",
            breed: row.Breed || "",
            color: row.Color ? row.Color.split("-") : [],
            surgeriesPerformed: row["Surgery Performed"]
              ? [row["Surgery Performed"]]
              : [],
            surgicalNotes: row["Surgical Notes"] || "",
            additionalNotes: row["Additional Notes/ Medications"] || "",
            veterinarian: row.Veterinarian || "",
            selectedOutcome: row.Outcome || "",
            qualifiesForTIP: row["Qualifies for TIP?"] === "TRUE",
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
