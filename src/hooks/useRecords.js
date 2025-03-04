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
  const [isExporting, setIsExporting] = useState(false);
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

  const fetchAllForExport = async (filters = null) => {
    setIsExporting(true);
    try {
      let baseQuery = query(
        collection(db, "records"),
        orderBy("catNumber", sortOrder)
      );

      if (filters) {
        baseQuery = buildFilteredQuery(baseQuery, filters);
      }

      // No pagination limit here - fetch all matching records
      const querySnapshot = await getDocs(baseQuery);

      if (!querySnapshot.empty) {
        const allRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return allRecords;
      }
      return [];
    } catch (error) {
      console.error("Error fetching records for export:", error);
      alert("Failed to export records. Please try again.");
      return [];
    } finally {
      setIsExporting(false);
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

  // Export to CSV
  const exportToCSV = async (filters = null) => {
    const allRecords = await fetchAllForExport(filters);
    if (allRecords.length === 0) {
      alert("No records found to export.");
      return;
    }

    // Prepare filename with date and filter info
    let filename = "cat-records";
    if (filters?.month && filters?.year) {
      const monthName = new Date(0, filters.month - 1).toLocaleString(
        "default",
        { month: "short" }
      );
      filename = `SCC-Records-${monthName}-${filters.year}`;
    } else {
      filename = `SCC-Records-${new Date().toISOString().slice(0, 10)}`;
    }

    // Define columns to include in export
    const headers = [
      "Cat ID",
      "Intake Date",
      "Trapper",
      "Service",
      "TNR - Cross Street",
      "TNR - Cross Zip Code",
      "Weight",
      "Estimated Age",
      "Breed",
      "Color",
      "Surgeries Performed",
      "TIP Eligible",
      "Surgical Notes",
      "Rabies",
      "Rabies w/o Cert",
      "FVRCP",
      "Outcome",
      "Additional Drugs",
      "Dosage",
      "Cat Name",
      "FeLVFIV",
      "Microchip",
      "Microchip #",
      "Additional Notes",
    ];

    // Create header row
    let csvContent = headers.join(",") + "\n";

    // Add data rows
    allRecords.forEach((record) => {
      const row = [
        record.catId || "",
        record.intakePickupDate || "",
        record.trapper
          ? `${record.trapper.trapperId} - ${record.trapper.firstName} ${record.trapper.lastName}`
          : record.trapper?.name || "",
        record.service || "",
        record.crossStreet || "",
        record.crossZip || "",
        record.weight || "",
        record.age || "",
        record.breed || "",
        Array.isArray(record.color) ? record.color.join("; ") : record.color,
        Array.isArray(record.surgeriesPerformed)
          ? record.surgeriesPerformed.join("; ")
          : "",
        record.qualifiesForTIP ? "Yes" : "No",
        record.surgicalNotes || "",
        record.rabies ? "Yes" : "No",
        record.rabiesWithoutCertificate ? "Yes" : "No",
        record.FVRCP ? "Yes" : "No",
        record.outcome || "",
        record.additionalDrug || "",
        record.dosage || "",
        record.catName || "",
        record.FeLVFIV || "",
        record.microchip ? "Yes" : "No",
        record.microchipNumber || "",
        record.additionalNotes || "",
      ].map((value) => {
        // Handle values with commas or quotes
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        return stringValue.includes(",") || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      });

      csvContent += row.join(",") + "\n";
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    records,
    isLoading,
    isExporting,
    toggleSortOrder,
    fetchFirstPage,
    fetchNextPage,
    isLastPage,
    fetchFilteredRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    exportToCSV,
  };
}
