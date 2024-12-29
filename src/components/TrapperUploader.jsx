import React, { useState } from "react";
import Papa from "papaparse";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase-config";

const TrapperUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  function parseAddress(combinedAddress) {
    // Regular expression to parse addresses with optional unit/apartment
    const addressRegex =
      /^(.*?),\s*(?:(Apt\.?|Unit|#|Suite)\s*\w+,\s*)?(.*?),\s*(\w{2})\s*(\d{5})$/;
    const match = combinedAddress.match(addressRegex);

    if (match) {
      return {
        street: match[1].trim(), // e.g., "400 Sunny Isles Blvd."
        apartment: match[2] ? `${match[2].trim()} ${match[3].trim()}` : "", // e.g., "Apt. 303" or ""
        city: match[4].trim(), // e.g., "Sunny Isles Beach"
        state: match[5].trim(), // e.g., "FL"
        zip: match[6].trim(), // e.g., "33160"
      };
    } else {
      console.warn("Could not parse address:", combinedAddress);
      return {
        street: combinedAddress.trim(), // Fallback: store full address in `street`
        apartment: "",
        city: "",
        state: "",
        zip: "",
      };
    }
  }

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

        // Map CSV data to Firestore schema
        const cleanedData = data.map((row) => {
          const parsedAddress = parseAddress(row.ADDRESS || "");

          return {
            qualifies: row.TIP === "Yes",
            trapperId: row["TRAPPER NUMBER"]?.trim() || "",
            name: row.NAME?.trim() || "",
            address: {
              street: parsedAddress.street,
              apartment: parsedAddress.apartment,
              city: parsedAddress.city,
              state: parsedAddress.state,
              zip: parsedAddress.zip,
            },
            phone: row.PHONE?.trim() || "",
            email: row.EMAIL?.trim() || "",
            code: row.CODE?.trim() || "",
            signature: "", // Default value for signature
          };
        });

        try {
          const collectionRef = collection(db, "trappers"); // Reference to the "records" collection

          for (const item of cleanedData) {
            await addDoc(collectionRef, item); // Automatically generate a unique document ID
            console.log(
              `Successfully uploaded trapper: ${item.trapperId} - ${item.name}`
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
      <h1>Upload Trappers to Firestore</h1>
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

export default TrapperUploader;
