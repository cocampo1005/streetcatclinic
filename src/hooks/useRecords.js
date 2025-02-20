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
  const [records, setRecords] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };

  // Reset records when sort order changes
  useEffect(() => {
    if (activeFilters) {
      fetchFilteredRecords(activeFilters);
    } else {
      fetchFirstPage();
    }
  }, [sortOrder]);

  const fetchFirstPage = async () => {
    setIsLoading(true);
    setActiveFilters(null);
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
        setIsLastPage(newRecords.length < pageSize);
      } else {
        setRecords([]);
        setLastVisible(null);
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFilteredQuery = (baseQuery, filters) => {
    const { month, year, surgery } = filters;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      baseQuery = query(
        baseQuery,
        where("intakeTimestamp", ">=", startTimestamp),
        where("intakeTimestamp", "<=", endTimestamp)
      );

      if (surgery) {
        baseQuery = query(
          baseQuery,
          where("surgeriesPerformed", "array-contains", surgery)
        );
      }
    }

    return baseQuery;
  };

  const fetchFilteredRecords = async (filters, showAll = false) => {
    setIsLoading(true);
    setActiveFilters(filters);

    try {
      let baseQuery = query(
        collection(db, "records"),
        orderBy("catNumber", sortOrder)
      );

      baseQuery = buildFilteredQuery(baseQuery, filters);

      if (!showAll) {
        baseQuery = query(baseQuery, limit(pageSize));
      }

      const querySnapshot = await getDocs(baseQuery);

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
        setLastVisible(null);
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching filtered records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!lastVisible || isLastPage) {
      return;
    }

    setIsLoading(true);
    try {
      let baseQuery = query(
        collection(db, "records"),
        orderBy("catNumber", sortOrder)
      );

      if (activeFilters) {
        baseQuery = buildFilteredQuery(baseQuery, activeFilters);
      }

      baseQuery = query(baseQuery, startAfter(lastVisible), limit(pageSize));

      const querySnapshot = await getDocs(baseQuery);

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
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRecord = async (recordData) => {
    try {
      const docRef = await addDoc(collection(db, "records"), recordData);
      fetchFirstPage();
      return docRef;
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Failed to create record. Please try again.");
      throw error;
    }
  };

  const updateRecord = async (id, updatedData) => {
    try {
      const recordRef = doc(db, "records", id);
      await updateDoc(recordRef, updatedData);
      return recordRef;
    } catch (error) {
      console.error("Error updating record:", error);
      alert("Failed to update record. Please try again.");
      throw error;
    }
  };

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
