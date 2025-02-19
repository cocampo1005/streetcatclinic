import { useState, useEffect, useRef } from "react";
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
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";

export default function useRecords(pageSize = 20) {
  const [records, setRecords] = useState([]); // Store paginated records
  const [lastVisible, setLastVisible] = useState(null); // Cursor for pagination
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [filters, setFilters] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const isFirstLoad = useRef(true);

  // Toggle Sorting Order
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      fetchFirstPage(); // Load default records on first mount
      isFirstLoad.current = false;
      console.log("First load");
    } else if (filters) {
      fetchFilteredRecords(filters);
      console.log("Filters changed");
    } else {
      fetchFirstPage(); // Load default records on sortOrder change
      console.log("Sort order changed");
    }
    console.log("Sort order changed to", sortOrder);
  }, [sortOrder]);

  // Fetch initial records (first page)
  const fetchFirstPage = async () => {
    setIsLoading(true);
    try {
      let recordsQuery = query(
        collection(db, "records"),
        orderBy("catNumber", sortOrder),
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
      console.log("First Page Records fetched");
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
      let nextQuery = query(
        collection(db, "records"),
        orderBy("catNumber", sortOrder),
        startAfter(lastVisible),
        limit(pageSize)
      );

      // Apply active filters if any
      if (filters?.surgery) {
        nextQuery = query(
          nextQuery,
          where("surgeriesPerformed", "array-contains", filters.surgery)
        );
      }

      if (filters?.month && filters?.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        nextQuery = query(
          nextQuery,
          where("intakeTimestamp", ">=", startTimestamp),
          where("intakeTimestamp", "<=", endTimestamp)
        );
      }

      const querySnapshot = await getDocs(nextQuery);
      if (!querySnapshot.empty) {
        const newRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecords((prev) => [...prev, ...newRecords]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(newRecords.length < pageSize);
      } else {
        setIsLastPage(true);
      }
      console.log("Next Page Records fetched");
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Method to fetch records based on filters
  const fetchFilteredRecords = async (appliedFilters, showAll = false) => {
    setFilters(appliedFilters); // Store applied filters
    setIsLoading(true);

    try {
      let recordsQuery = query(
        collection(db, "records"),
        orderBy("catNumber", sortOrder)
      );

      // Require both month & year to apply surgery filter
      const isDateSelected = appliedFilters.month && appliedFilters.year;

      if (isDateSelected && appliedFilters.surgery) {
        recordsQuery = query(
          recordsQuery,
          where("surgeriesPerformed", "array-contains", appliedFilters.surgery)
        );
      }

      if (appliedFilters.month && appliedFilters.year) {
        const startDate = new Date(
          appliedFilters.year,
          appliedFilters.month - 1,
          1
        );
        const endDate = new Date(
          appliedFilters.year,
          appliedFilters.month,
          0,
          23,
          59,
          59
        );

        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        recordsQuery = query(
          recordsQuery,
          where("intakeTimestamp", ">=", startTimestamp),
          where("intakeTimestamp", "<=", endTimestamp)
        );
      }

      // Only apply limit if "Show All" is NOT clicked
      if (!showAll) {
        recordsQuery = query(recordsQuery, limit(pageSize));
      }

      const querySnapshot = await getDocs(recordsQuery);
      if (!querySnapshot.empty) {
        const newRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecords(newRecords);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(showAll || newRecords.length < pageSize);
      } else {
        setRecords([]);
        setIsLastPage(true);
      }
      console.log("Filtered Records fetched");
    } catch (error) {
      console.error("Error fetching filtered records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new record in Firestore
  const createRecord = async (recordData) => {
    try {
      const docRef = await addDoc(collection(db, "records"), recordData);
      console.log("Record created:", docRef.id);

      // Ensure latest record is fetched
      fetchFirstPage();

      return docRef; // Return docRef so handleSubmit can access docRef.id
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Failed to create record. Please try again.");
      throw error;
    }
  };

  // Update an existing record inFirestore
  const updateRecord = async (id, updatedData) => {
    try {
      const recordRef = doc(db, "records", id);
      await updateDoc(recordRef, updatedData);
      console.log("Record updated:", id);

      return recordRef; // Return recordRef for use in RecordForm
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Please try again.");
      throw error;
    }
  };

  // Delete a record in Firestore
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
    sortOrder,
    toggleSortOrder,
    fetchFirstPage,
    fetchNextPage,
    isLastPage,
    fetchFilteredRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
