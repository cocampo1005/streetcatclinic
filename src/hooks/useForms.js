import { useState } from "react";
import {
  doc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { ref, deleteObject } from "firebase/storage";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function useForms(pageSize = 10) {
  const [forms, setForms] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  // Fetch forms from Firestore that have PDFs
  const fetchFirstPage = async () => {
    setIsLoading(true);
    setActiveFilters(null);
    try {
      // Query records with qualifiesForTIP = true and pdfUrl exists
      let formsQuery = query(
        collection(db, "records"),
        where("qualifiesForTIP", "==", true),
        where("pdfUrl", "!=", null),
        orderBy("intakeTimestamp", "desc"),
        orderBy("catNumber", "desc"),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(formsQuery);

      if (!querySnapshot.empty) {
        const formDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fileName: formatFileName(doc.data().pdfUrl),
          generatedDate: doc.data().intakeTimestamp
            ? formatTimestamp(doc.data().intakeTimestamp)
            : doc.data().intakePickupDate ||
              formatDateFromUrl(doc.data().pdfUrl),
          trapperName: formatTrapperName(doc.data().trapper),
        }));

        setForms(formDocs);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(formDocs.length < pageSize);
      } else {
        setForms([]);
        setLastVisible(null);
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFilteredQuery = (baseQuery, filters) => {
    const { month, year } = filters;

    if (month && year) {
      // Create start and end timestamps for the selected month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

      const startTimestamp = Timestamp.fromDate(startOfMonth);
      const endTimestamp = Timestamp.fromDate(endOfMonth);

      // Filter by intakeTimestamp instead of pdfGeneratedAt
      return query(
        collection(db, "records"),
        where("qualifiesForTIP", "==", true),
        where("pdfUrl", "!=", null),
        where("intakeTimestamp", ">=", startTimestamp),
        where("intakeTimestamp", "<=", endTimestamp)
      );
    }

    return baseQuery;
  };

  const fetchFilteredForms = async (filters, showAll = false) => {
    setIsLoading(true);
    setActiveFilters(filters);

    try {
      // Build the query with month/year filters
      let baseQuery = buildFilteredQuery(
        query(collection(db, "records")),
        filters
      );

      // Add ordering and limit after the filters
      if (!showAll) {
        baseQuery = query(
          baseQuery,
          orderBy("intakeTimestamp", "desc"),
          orderBy("catNumber", "desc"),
          limit(pageSize)
        );
      } else {
        baseQuery = query(
          baseQuery,
          orderBy("intakeTimestamp", "desc"),
          orderBy("catNumber", "desc")
        );
      }

      const querySnapshot = await getDocs(baseQuery);

      if (!querySnapshot.empty) {
        const formDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fileName: formatFileName(doc.data().pdfUrl),
          generatedDate: doc.data().intakeTimestamp
            ? formatTimestamp(doc.data().intakeTimestamp)
            : doc.data().intakePickupDate ||
              formatDateFromUrl(doc.data().pdfUrl),
          trapperName: formatTrapperName(doc.data().trapper),
        }));

        setForms(formDocs);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(showAll || formDocs.length < pageSize);
      } else {
        setForms([]);
        setLastVisible(null);
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching filtered forms:", error);
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
      let baseQuery;

      if (activeFilters) {
        baseQuery = buildFilteredQuery(
          query(collection(db, "records")),
          activeFilters
        );
      } else {
        baseQuery = query(
          collection(db, "records"),
          where("qualifiesForTIP", "==", true),
          where("pdfUrl", "!=", null)
        );
      }

      baseQuery = query(
        baseQuery,
        orderBy("intakeTimestamp", "desc"),
        orderBy("catNumber", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(baseQuery);

      if (!querySnapshot.empty) {
        const formDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fileName: formatFileName(doc.data().pdfUrl),
          generatedDate: doc.data().intakeTimestamp
            ? formatTimestamp(doc.data().intakeTimestamp)
            : doc.data().intakePickupDate ||
              formatDateFromUrl(doc.data().pdfUrl),
          trapperName: formatTrapperName(doc.data().trapper),
        }));

        setForms((prev) => [...prev, ...formDocs]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setIsLastPage(formDocs.length < pageSize);
      } else {
        setIsLastPage(true);
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export batch of PDFs as a zip file
  const exportBatchPDFs = async (filters) => {
    setIsExporting(true);
    try {
      const { month, year } = filters;
      if (!month || !year) {
        alert("Month and year are required for batch export");
        return;
      }

      // Fetch all records for the selected month/year that have PDFs
      let baseQuery = buildFilteredQuery(
        query(collection(db, "records")),
        filters
      );

      // Order by catId for consistent export order
      baseQuery = query(baseQuery, orderBy("catNumber"));

      const querySnapshot = await getDocs(baseQuery);

      if (querySnapshot.empty) {
        alert("No PDF forms found for the selected month and year.");
        return;
      }

      // Create a zip file
      const zip = new JSZip();
      const monthName = new Date(0, month - 1).toLocaleString("default", {
        month: "long",
      });

      // Add each PDF to the zip
      const pdfPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (!data.pdfUrl) return null;

        try {
          // Fetch the PDF content
          const response = await fetch(data.pdfUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${data.pdfUrl}`);

          const blob = await response.blob();
          const fileName = formatFileName(data.pdfUrl);

          // Add to zip to month batch export
          zip.file(fileName, blob);
          return true;
        } catch (error) {
          console.error(`Error fetching PDF ${data.pdfUrl}:`, error);
          return null;
        }
      });

      await Promise.all(pdfPromises);

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `TIP-Forms-${monthName}-${year}.zip`);
    } catch (error) {
      console.error("Error exporting batch PDFs:", error);
      alert("Failed to export PDFs. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export selected PDFs
  const exportSelectedPDFs = async (selectedForms) => {
    if (!selectedForms || selectedForms.length === 0) {
      alert("No forms selected for export");
      return;
    }

    setIsExporting(true);
    try {
      // Create a zip file
      const zip = new JSZip();

      // Add each PDF to the zip
      const pdfPromises = selectedForms.map(async (form) => {
        if (!form.pdfUrl) return null;

        try {
          // Fetch the PDF content
          const response = await fetch(form.pdfUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${form.pdfUrl}`);

          const blob = await response.blob();
          const fileName = formatFileName(form.pdfUrl);

          // Add to zip to selected batch export
          zip.file(fileName, blob);
          return true;
        } catch (error) {
          console.error(`Error fetching PDF ${form.pdfUrl}:`, error);
          return null;
        }
      });

      await Promise.all(pdfPromises);

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `TIP-Forms-Selected-${selectedForms.length}.zip`);
    } catch (error) {
      console.error("Error exporting selected PDFs:", error);
      alert("Failed to export PDFs. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Delete PDF from Firebase Storage and corresponding record from Firestore
  const deletePdfForm = async (form) => {
    if (!form.pdfUrl || !form.id) {
      console.error("Invalid form data for deletion:", form);
      return;
    }

    setIsLoading(true);
    try {
      // Delete from Firebase Storage
      const fileRef = ref(storage, form.pdfUrl);
      await deleteObject(fileRef);

      // Delete entire corresponding record doc from Firestore
      const formDocRef = doc(db, "records", form.id);
      await deleteDoc(formDocRef);

      // Remove the form from the local state
      setForms((prevForms) => prevForms.filter((f) => f.id !== form.id));

      console.log(
        "Successfully deleted PDF and updated Firestore for form:",
        form.id
      );
    } catch (error) {
      console.error("Error deleting PDF form:", error);
      alert("Failed to delete form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const formatFileName = (url) => {
    if (!url) return "Unknown";

    // Extract filename from URL by splitting on '/' and taking the last part
    const urlParts = url.split("/");
    let fileName = urlParts[urlParts.length - 1];

    // Remove any query parameters (anything after '?')
    fileName = fileName.split("?")[0];

    // URL decode if needed
    return decodeURIComponent(fileName);
  };

  const formatTrapperName = (trapper) => {
    if (!trapper) return "Unknown";

    if (trapper.firstName && trapper.lastName) {
      return `${trapper.firstName} ${trapper.lastName}`;
    } else if (trapper.name) {
      return trapper.name;
    }

    return "Unknown";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateFromUrl = (url) => {
    if (!url) return "Unknown";
    // Try to extract date from URL format like pdfs/YYYY-MM/filename.pdf
    const match = url.match(/pdfs\/(\d{4}-\d{2})/);
    if (match && match[1]) {
      const [year, month] = match[1].split("-");
      const date = new Date(year, parseInt(month) - 1, 1);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    }
    return "Unknown";
  };

  return {
    forms,
    isLoading,
    isExporting,
    fetchFirstPage,
    fetchNextPage,
    isLastPage,
    fetchFilteredForms,
    exportBatchPDFs,
    exportSelectedPDFs,
    deletePdfForm,
  };
}
