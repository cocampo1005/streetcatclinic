import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";

const migrateTrapperNames = async () => {
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
      await updateDoc(trapperRef, { firstName, lastName, name: null }); // Optionally remove the old name field
    });

    await Promise.all(updates);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error migrating trapper names:", error);
  }
};

export default migrateTrapperNames;
