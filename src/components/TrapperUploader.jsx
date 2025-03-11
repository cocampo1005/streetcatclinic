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
    if (!combinedAddress) {
      return {
        street: "",
        apartment: "",
        city: "",
        state: "",
        zip: "",
      };
    }

    // Check for addresses with apartment/unit info
    // This matches patterns like: "street, apt info, city, state zip"
    const aptRegex =
      /^(.*?),\s*((?:Apt\.?|Unit|#|Suite)\s*[^,]*),\s*(.*?),\s*(\w{2})\s*(\d{5})$/i;

    // For addresses without apartment info: "street, city, state zip"
    const simpleRegex = /^(.*?),\s*(.*?),\s*(\w{2})\s*(\d{5})$/;

    let match = combinedAddress.match(aptRegex);

    if (match) {
      // Address with apartment info
      return {
        street: match[1].trim(),
        apartment: match[2].trim(),
        city: match[3].trim(),
        state: match[4].trim(),
        zip: match[5].trim(),
      };
    } else {
      // Try the simple pattern without apartment
      match = combinedAddress.match(simpleRegex);

      if (match) {
        return {
          street: match[1].trim(),
          apartment: "",
          city: match[2].trim(),
          state: match[3].trim(),
          zip: match[4].trim(),
        };
      } else {
        // If no pattern matches, log a warning and return the raw address
        console.warn("Could not parse address:", combinedAddress);
        return {
          street: combinedAddress.trim(),
          apartment: "",
          city: "",
          state: "",
          zip: "",
        };
      }
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

          // Name parsing logic
          const nameParts = row.NAME?.trim().split(/\s+/) || [];
          let firstName = "";
          let lastName = "";

          if (nameParts.length === 1) {
            firstName = nameParts[0];
          } else if (nameParts.length === 2) {
            [firstName, lastName] = nameParts;
          } else {
            firstName = nameParts.slice(0, -1).join(" "); // All but the last word
            lastName = nameParts[nameParts.length - 1]; // Last word as last name
          }

          return {
            qualifies: row.TIP === "Yes",
            trapperId: row["TRAPPER NUMBER"]?.trim() || "",
            firstName: firstName || "",
            lastName: lastName || "",
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
            signature: "",
          };
        });

        try {
          const collectionRef = collection(db, "trappers");

          for (const item of cleanedData) {
            await addDoc(collectionRef, item);
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
