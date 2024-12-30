import React, { useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";

const MigrateTrapperNamesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const migrateTrapperNames = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Step 1: Fetch all trappers
      const trappersSnapshot = await getDocs(collection(db, "trappers"));

      const updates = trappersSnapshot.docs.map(async (trapperDoc) => {
        const trapperData = trapperDoc.data();

        // Step 2: Split the full name into firstName and lastName
        const [firstName, ...lastNameParts] = trapperData.name.split(" ");
        const lastName = lastNameParts.join(" ");

        // Step 3: Update the database
        const trapperRef = doc(db, "trappers", trapperDoc.id);
        await updateDoc(trapperRef, { firstName, lastName, name: null }); // Remove old name field (optional)
      });

      await Promise.all(updates);

      setMessage("Migration completed successfully!");
    } catch (error) {
      console.error("Error migrating trapper names:", error);
      setMessage(
        "An error occurred during migration. Check the console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={migrateTrapperNames}
        disabled={isLoading}
        className={`px-4 py-2 rounded ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primaryGreen text-white hover:bg-secondaryGreen"
        }`}
      >
        {isLoading ? "Migrating..." : "Migrate Trapper Names"}
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default MigrateTrapperNamesButton;
