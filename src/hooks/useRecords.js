import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase-config"; // Ensure correct Firebase setup

export default function useRecords(pageSize = 20) {
  const [records, setRecords] = useState([]); // Store paginated records
  const [lastVisible, setLastVisible] = useState(null); // Cursor for pagination
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    fetchFirstPage();
  }, []);

  // Fetch initial records (first page)
  const fetchFirstPage = async () => {
    setIsLoading(true);
    try {
      const recordsQuery = query(
        collection(db, "records"),
        orderBy("catNumber", "desc"), // Keep ordering consistent
        limit(pageSize)
      );

      const querySnapshot = await getDocs(recordsQuery);
      if (!querySnapshot.empty) {
        const newRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecords(newRecords);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(newRecords.length < pageSize); // If fewer than pageSize, it's last page
      } else {
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch next batch of records (pagination)
  const fetchNextPage = async () => {
    if (!lastVisible || isLastPage) return;

    setIsLoading(true);
    try {
      const nextQuery = query(
        collection(db, "records"),
        orderBy("catNumber", "desc"), // Ensure consistency
        startAfter(lastVisible),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(nextQuery);
      if (!querySnapshot.empty) {
        const newRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Prevent duplicate records by filtering out already added ones
        setRecords((prev) => {
          const uniqueRecords = [
            ...prev,
            ...newRecords.filter(
              (newRec) => !prev.some((prevRec) => prevRec.id === newRec.id)
            ),
          ];
          return uniqueRecords;
        });

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(newRecords.length < pageSize);
      } else {
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Move createRecord here so RecordForm can use it
  const createRecord = async (recordData) => {
    try {
      const docRef = await addDoc(collection(db, "records"), recordData);
      console.log("Record created:", docRef.id);

      // 🔥 Re-fetch to ensure latest record is at the top
      fetchFirstPage();
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Failed to create record. Please try again.");
    }
  };

  // Create a new record
  // const createRecord = async (recordData) => {
  //   try {
  //     const docRef = await addDoc(collection(db, "records"), recordData);
  //     console.log("Record created:", docRef.id);
  //   } catch (error) {
  //     console.error("Error adding record:", error);
  //     alert("Failed to create record. Please try again.");
  //   }
  // };

  // Update an existing record
  const updateRecord = async (id, updatedData) => {
    try {
      const recordRef = doc(db, "records", id);
      await updateDoc(recordRef, updatedData);
      console.log("Record updated:", id);
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Please try again.");
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

  return {
    records,
    isLoading,
    fetchNextPage,
    isLastPage,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
