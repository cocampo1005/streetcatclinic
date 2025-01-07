import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";

const RecordsContext = createContext();

export const RecordsProvider = ({ children }) => {
  const [records, setRecords] = useState([]);

  // Fetch records from Firestore
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsSnapshot = await getDocs(collection(db, "records"));
        const recordsList = recordsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort records by `intakePickupDate` in chronological order
        const sortedRecords = recordsList.sort((a, b) => {
          const dateA = a.intakePickupDate
            ? new Date(a.intakePickupDate)
            : new Date(0);
          const dateB = b.intakePickupDate
            ? new Date(b.intakePickupDate)
            : new Date(0);

          return dateA - dateB;
        });

        setRecords(sortedRecords);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  // Add a new record
  const createRecord = async (recordData) => {
    try {
      const docRef = await addDoc(collection(db, "records"), recordData);
      const newRecord = { id: docRef.id, ...recordData };
      setRecords((prevRecords) => [...prevRecords, newRecord]);
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  // Update a record
  const updateRecord = async (id, updatedData) => {
    try {
      const recordRef = doc(db, "records", id);
      await updateDoc(recordRef, updatedData);
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === id ? { ...record, ...updatedData } : record
        )
      );
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  // Delete a record
  const deleteRecord = async (id) => {
    try {
      await deleteDoc(doc(db, "records", id));
      setRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== id)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  return (
    <RecordsContext.Provider
      value={{ records, createRecord, updateRecord, deleteRecord }}
    >
      {children}
    </RecordsContext.Provider>
  );
};

// Custom hook to use RecordsContext
export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error("useRecords must be used within a RecordsProvider");
  }
  return context;
};
