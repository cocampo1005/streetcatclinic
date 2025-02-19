import React, { useState } from "react";
import Papa from "papaparse";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { useTrappers } from "../contexts/TrappersContext";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { generateMDASTIPFormPDF } from "../utils/pdfGenerator";

const CsvUploader = () => {
  const { trappers } = useTrappers();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

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

        // Firestore collection reference
        const collectionRef = collection(db, "records");

        let completed = 0;

        for (const row of filteredData) {
          try {
            // Extract Trapper Info
            const trapperField = row["Trapper/ Rescue ID and Address"] || "";
            let trapperId = null;
            let trapperName = null;

            if (trapperField.includes("-")) {
              trapperId = trapperField.split("-")[0].trim();
              trapperName = trapperField.split("-")[1]?.trim() || null;
            } else {
              trapperName = trapperField.trim();
            }

            const trapper =
              trapperId && trappers.find((t) => t.trapperId === trapperId)
                ? trappers.find((t) => t.trapperId === trapperId)
                : {
                    trapperId: trapperId || "No ID",
                    name: trapperName || "Unknown",
                  };

            // Check if record qualifies for TIP
            const qualifiesForTIP = row["Qualifies for TIP?"]
              ?.trim()
              .toLowerCase()
              .startsWith("yes");

            let pdfUrl = null;

            // Extract and sanitize `catId`
            let sanitizedCatId = row["Cat ID"].trim().replace(/\//g, "_");

            // Extract date information from Cat ID
            const match = row["Cat ID"]
              .trim()
              .match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*-\s*(\d+)/);
            if (!match)
              throw new Error(`Invalid Cat ID format: ${row["Cat ID"]}`);

            let [, month, day, year, id] = match;

            // Convert 2-digit year to 4-digit format
            if (year.length === 2) {
              year = `20${year}`;
            }

            // Format month and day with leading zeros
            const formattedMonth = month.padStart(2, "0");
            const formattedDay = day.padStart(2, "0");

            // Update `sanitizedCatId`
            sanitizedCatId = `${formattedMonth}_${formattedDay}_${year}- ${id}`;

            // Extract and reformat catNumber
            let catNumber = null;
            if (row["Cat ID"]) {
              const trimmedCatId = row["Cat ID"].trim();
              const catMatch = trimmedCatId.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})- (\d+)$/
              );

              if (catMatch) {
                let [, month, day, year, number] = catMatch;

                if (year.length === 2) {
                  year = `20${year}`;
                }

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

            // If the record qualifies for TIP, generate PDF immediately
            if (qualifiesForTIP) {
              try {
                // Transform raw CSV row into the correct format before generating PDF
                const entryData = {
                  trapper,
                  intakePickupDate: row["Intake, SX & Pickup DATE"] || "",
                  service: row.Service || "",
                  catId: row["Cat ID"] || "N/A",
                  catName: row["RESCUE- Cat Name"] || "Unnamed",
                  breed: row.Breed || "",
                  color: row["Color"]
                    ? row["Color"].split(",").map((c) => c.trim())
                    : [],
                  estimatedAge: row["Estimated Age"] || "Unknown",
                  sex: row["Surgery Performed"].includes("Female")
                    ? "Female"
                    : row["Surgery Performed"].includes("Male")
                    ? "Male"
                    : "",
                  crossStreet: row["TNR-Cross Street Trapped"] || "",
                  crossZip: row["TNR- Zip Code Trapped"] || "",
                };

                // Generate PDF for row using condensed data
                const pdfBlob = await generateMDASTIPFormPDF(entryData);

                if (!pdfBlob) {
                  throw new Error(
                    `⚠ PDF generation returned null for Cat ID: ${row["Cat ID"]}`
                  );
                }

                console.log(
                  `✅ PDF generated successfully for Cat ID: ${row["Cat ID"]}`
                );

                const fileName = `${sanitizedCatId}_MDAS_TIP_Form.pdf`;
                const pdfPath = `pdfs/${year}-${formattedMonth}/${fileName}`;
                const pdfRef = ref(storage, pdfPath);

                await uploadBytes(pdfRef, pdfBlob);
                pdfUrl = await getDownloadURL(pdfRef);
              } catch (error) {
                console.error(
                  `❌ PDF generation error for ${row["Cat ID"]}:`,
                  error
                );
              }
            }

            // Create Firestore record
            const recordData = {
              trapper,
              intakePickupDate: row["Intake, SX & Pickup DATE"],
              intakeTimestamp: formatDateForFirestore(
                row["Intake, SX & Pickup DATE"]
              )
                ? Timestamp.fromDate(
                    formatDateForFirestore(row["Intake, SX & Pickup DATE"])
                  )
                : null,
              service: row.Service || "",
              catId: row["Cat ID"].trim(),
              catNumber,
              crossStreet: row["TNR-Cross Street Trapped"] || "",
              crossZip: row["TNR- Zip Code Trapped"] || "",
              microchip: row.Microchip === "TRUE",
              microchipNumber: row["Microchip #"] || "",
              rabies: row.Rabies === "TRUE",
              rabiesWithoutCertificate:
                row["TNR Rabies Given- No Certificate"] === "TRUE",
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
              pdfUrl,
            };

            await addDoc(collectionRef, recordData);
            completed++;
            setUploadProgress(
              Math.round((completed / filteredData.length) * 100)
            );

            console.log(
              `✅ Successfully uploaded entry with Cat ID: ${row["Cat ID"]}`
            );
          } catch (error) {
            console.error(`❌ Error processing entry:`, error);
          }
        }

        setMessage("Upload complete!");
        setIsUploading(false);
        setUploadProgress(0);
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
