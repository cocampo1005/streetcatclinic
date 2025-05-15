import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  CatIcon,
  ClipboardIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  FilterIcon,
  GreenCheck,
  LocationIcon,
  NoCert,
  Plus,
  RedX,
  ServiceIcon,
  SortIcon,
  TipIcon,
  TrapperIcon,
  VetIcon,
} from "../components/svgs/Icons";
import ConfirmationModal from "../components/ConfirmationModal";
import RecordModal from "../components/RecordModal";
import useRecords from "../hooks/useRecords";
import { generateMDASTIPFormPDF } from "../utils/pdfGenerator"; // Import the PDF generator utility
import { storage, db } from "../firebase-config"; // Import db and storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { doc, updateDoc } from "firebase/firestore"; // Import firestore functions
import LoadingSpinner from "../components/svgs/LoadingSpinner";

export default function RecordsPage() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filtering States
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterDate, setFilterDate] = useState({ month: "", year: "" });
  const [filterSurgery, setFilterSurgery] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Fetch Records Hook
  const {
    records,
    isLoading,
    isExporting,
    toggleSortOrder,
    fetchFirstPage,
    fetchNextPage,
    isLastPage,
    fetchFilteredRecords,
    deleteRecord,
    updateRecord,
    exportToCSV,
  } = useRecords(5);

  // Apply selected filters
  const applyFilters = () => {
    if (!filterDate.month || !filterDate.year) {
      alert("Please select a month and year before filtering.");
      return;
    }

    setFiltersApplied(true);
    const filters = {
      month: filterDate.month,
      year: filterDate.year,
      surgery: filterSurgery || null,
    };
    fetchFilteredRecords(filters);
  };

  const resetFilters = () => {
    setFiltersApplied(false);
    setFilterDate({ month: "", year: "" });
    setFilterSurgery("");
    fetchFirstPage(); // Reload default records again
  };

  // Handle showing all filtered results
  const handleShowAll = () => {
    if (filtersApplied) {
      fetchFilteredRecords(
        {
          month: filterDate.month,
          year: filterDate.year,
          surgery: filterSurgery || null,
        },
        true // showAll flag
      );
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!filterDate.month || !filterDate.year) {
      alert("Please select a month and year before exporting.");
      return;
    }

    const filters = {
      month: filterDate.month,
      year: filterDate.year,
      surgery: filterSurgery || null,
    };

    exportToCSV(filters);
  };

  // Handle PDF Regeneration
  const handleGeneratePdf = async (record) => {
    if (!record || !record.id) {
      console.error("Invalid record data for PDF generation.");
      return;
    }

    // Ensure record has intakeTimestamp, fall back to current date if not (though it should exist)
    const intakeDate = record.intakeTimestamp?.toDate();

    if (!intakeDate) {
      console.error(
        "Record is missing intakeTimestamp, cannot generate PDF with date-based naming.",
        record
      );
      alert("Cannot generate PDF: Intake date is missing for this record.");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // Generate the PDF blob from the record data
      const pdfBlob = await generateMDASTIPFormPDF(record);

      if (!pdfBlob) {
        throw new Error("PDF generation failed.");
      }

      // Define storage path and filename based on intake date and desired format
      const year = intakeDate.getFullYear();
      const month = String(intakeDate.getMonth() + 1).padStart(2, "0");

      // Ensure catId is safe for filename (replace '/' with '_')
      const safeCatId = record.catId.replace(/\//g, "_");

      // Construct the storage path in the desired pdfs/YYYY-MM/ format
      const pdfPath = `pdfs/${year}-${month}/${safeCatId}_MDAS_TIP_Form.pdf`;

      const pdfRef = ref(storage, pdfPath);

      // Upload the PDF blob to Firebase Storage
      const uploadResult = await uploadBytes(pdfRef, pdfBlob);
      const pdfUrl = await getDownloadURL(uploadResult.ref);

      // Update the record document in Firestore with the new PDF URL
      const recordDocRef = doc(db, "records", record.id);
      await updateDoc(recordDocRef, {
        pdfUrl: pdfUrl,
      });

      // Update the selected record and the records list in state
      const updatedRecord = { ...record, pdfUrl: pdfUrl };
      setSelectedRecord(updatedRecord); // Update the currently selected record details
    } catch (error) {
      console.error("Error generating or uploading PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleRowClick = (record) => {
    setSelectedRecord((prevRecord) =>
      prevRecord?.id === record.id ? null : record
    );
    setSelectedRowId((prevId) => (prevId === record.id ? null : record.id));
  };

  const confirmDelete = () => {
    deleteRecord(selectedRecord);
    setDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Records</h1>
        <div className="flex gap-4">
          {filtersApplied && (
            <button
              onClick={handleExportCSV}
              disabled={isExporting || !filtersApplied}
              className="flex gap-2 bg-primaryWhite border-2 border-primaryGreen hover:bg-cyan-100 text-primaryGreen font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadIcon />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          )}
          <Link
            to={"/"}
            className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg"
          >
            <Plus />
            <span>Add Entry</span>
          </Link>
        </div>
      </header>

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Record"
          message={
            <>
              <p>
                Are you sure you want to delete the following record entry? If
                this record has a corresponding PDF associated with it, it will
                also be deleted. This action cannot be undone.
              </p>
              <p className="pl-4 py-2">
                <strong>Recorded Entry: {selectedRecord.catId}</strong>
              </p>
            </>
          }
        />
      )}
      {isEditModalOpen && (
        <RecordModal
          initialData={selectedRecord}
          onClose={() => setEditModalOpen(false)}
        />
      )}
      <section className="p-8 max-h-screen flex flex-col gap-8">
        {selectedRecord && (
          <article className="rounded-xl flex justify-between gap-4 px-8">
            <div className="min-w-64">
              <div className="flex items-center gap-2 mb-4">
                <CatIcon />
                <h2 className="text-2xl font-bold">{selectedRecord.catId}</h2>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <CalendarIcon />
                  <p className="pl-2 pt-1">{selectedRecord.intakePickupDate}</p>
                </div>
                <div className="flex items-center">
                  <TrapperIcon />
                  <p className="pl-2 pt-1">
                    {selectedRecord.trapper && selectedRecord.trapper.firstName
                      ? `${selectedRecord.trapper.trapperId} - 
                    ${selectedRecord.trapper.firstName} 
                    ${selectedRecord.trapper.lastName}`
                      : `${selectedRecord.trapper.name}`}
                  </p>
                </div>
                <div className="flex items-center">
                  <LocationIcon />
                  <p className="pl-2 pt-1">
                    {selectedRecord.crossStreet
                      ? `${selectedRecord.crossStreet}, ${selectedRecord.crossZip}`
                      : "No Cross Street or Zip"}
                  </p>
                </div>
                <div className="flex items-center">
                  <ServiceIcon />
                  <p className="pl-2">{selectedRecord.service}</p>
                </div>
                <div className="flex items-center">
                  <VetIcon />
                  <p className="pl-2 pt-1">{selectedRecord.veterinarian}</p>
                </div>
                <div className="flex items-center">
                  <TipIcon />
                  <div className="flex gap-2 pl-2 pt-1">
                    {selectedRecord.qualifiesForTIP ? (
                      selectedRecord.pdfUrl ? (
                        // Show View PDF button if PDF exists
                        <>
                          <p>Yes</p>
                          <a
                            href={selectedRecord.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="bg-errorRed text-primaryWhite font-bold text-xs px-2 py-1 rounded hover:bg-primaryWhite hover:border hover:border-errorRed hover:text-errorRed">
                              View PDF
                            </button>
                          </a>
                        </>
                      ) : (
                        // Show Generate PDF button if qualifies but no PDF
                        <>
                          <p>
                            Yes -{" "}
                            <span className="text-errorRed">No PDF Found</span>
                          </p>
                          <button
                            onClick={() => handleGeneratePdf(selectedRecord)}
                            className={`bg-primaryGreen text-primaryWhite font-bold text-xs px-2 py-1 rounded ${
                              isGeneratingPdf
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-secondaryGreen"
                            }`}
                            disabled={isGeneratingPdf}
                          >
                            {isGeneratingPdf ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              "Generate PDF"
                            )}{" "}
                            {/* Show spinner while generating */}
                          </button>
                        </>
                      )
                    ) : (
                      // Show No if not qualified
                      <p>No</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 h-full flex-grow w-[64%]">
              {/* Cat Details */}
              <div className="flex gap-3 items-start">
                <div className="flex">
                  <ClipboardIcon />
                </div>
                <div className="flex flex-col gap-4 w-[100%]">
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="grid grid-cols-4 gap-2 flex-grow">
                      <p className="col-span-1">
                        <strong>Name: </strong>
                        {`${selectedRecord.catName}`}
                      </p>
                      <p className="col-span-1">
                        <strong>Wt: </strong>
                        {`${selectedRecord.weight} lbs`}
                      </p>
                      <p className="col-span-2">
                        <strong>Color: </strong>
                        {`${selectedRecord.color.join(", ")}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 flex-grow">
                      <p className="col-span-1">
                        <strong>Breed: </strong>
                        {`${selectedRecord.breed}`}
                      </p>
                      <p className="col-span-1">
                        <strong>Age: </strong>
                        {`${selectedRecord.age}`}
                      </p>
                      <p className="col-span-2">
                        <strong>Microchip: </strong>
                        {selectedRecord.microchip
                          ? `${selectedRecord.microchipNumber}`
                          : "None"}
                      </p>
                    </div>
                  </div>

                  {/* Medical Details */}
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-2 justify-between">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">Rabies</p>
                            {selectedRecord.rabies ? <GreenCheck /> : <RedX />}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <p className="font-bold">Rabies</p>
                              <NoCert />
                            </div>
                            {selectedRecord.rabiesWithoutCertificate ? (
                              <GreenCheck />
                            ) : (
                              <RedX />
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">FVRCP</p>
                            {selectedRecord.FVRCP ? <GreenCheck /> : <RedX />}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">FeLVFIV</p>
                            {selectedRecord.FeLVFIV
                              ? `${selectedRecord.FeLVFIV}`
                              : "N/A"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">Additional Drugs: </p>
                          <p>
                            {selectedRecord.additionalDrug
                              ? `${selectedRecord.additionalDrug} (${selectedRecord.dosage}mls)`
                              : "None"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p>
                          <strong>Services: </strong>
                          {`${selectedRecord.surgeriesPerformed.join(", ")}`}
                        </p>
                        <p>
                          <strong>Surgical Notes: </strong>
                          {`${selectedRecord.surgicalNotes}`}
                        </p>
                        <p>
                          <strong>Outcome: </strong>
                          {`${selectedRecord.outcome}`}
                        </p>
                      </div>
                    </div>
                    <p>
                      <strong>Additional Notes: </strong>
                      {`${selectedRecord.additionalNotes}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between items-end gap-4">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-secondaryGray hover:text-errorRed"
              >
                <DeleteIcon />
              </button>
              <button
                onClick={() => setEditModalOpen(true)}
                className="text-secondaryGray hover:text-primaryGreen"
              >
                <EditIcon />
              </button>
            </div>
          </article>
        )}

        {/* Table */}
        <div
          className={`w-full overflow-x-auto overflow-y-auto flex-grow ${
            selectedRecord
              ? "max-h-[calc(100vh-510px)]"
              : "max-h-[calc(100vh-170px)]"
          }`}
        >
          <table className="w-full min-w-full divide-y divide-secondaryGray rounded-xl">
            <thead className="sticky top-0 z-10 bg-tertiaryGray rounded-xl border-b border-secondaryGray">
              <tr>
                <th className="px-6 py-3 text-left rounded-l-xl">
                  <div className="flex items-center gap-1">
                    Cat ID
                    <button
                      onClick={toggleSortOrder}
                      className="cursor-pointer"
                    >
                      <SortIcon />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left">Intake Date</th>
                <th className="px-6 py-3 text-left">Trapper</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-left rounded-r-xl">TIP</th>
              </tr>
              <tr>
                <th colSpan="5" className="p-4 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 font-bold">
                      <FilterIcon />
                    </div>
                    <div className="flex gap-4 items-center justify-center w-full">
                      <label className="m-0">Month</label>
                      <select
                        onChange={(e) =>
                          setFilterDate({
                            ...filterDate,
                            month: e.target.value,
                          })
                        }
                        value={filterDate.month}
                      >
                        <option value="">All</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>

                      <label className="m-0">Year</label>
                      <select
                        onChange={(e) =>
                          setFilterDate({ ...filterDate, year: e.target.value })
                        }
                        value={filterDate.year}
                      >
                        <option value="">All</option>
                        {[...Array(new Date().getFullYear() - 2024 + 1)].map(
                          (_, i) => {
                            const year = 2024 + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          }
                        )}
                      </select>

                      {/* Omitted Option to Filter by Surgery */}

                      {/* <label>Surgery</label>
                      <select
                        onChange={(e) => setFilterSurgery(e.target.value)}
                        value={filterSurgery}
                      >
                        <option value="">All</option>
                        {surgeriesPerformed.map((surgery) => (
                          <option key={surgery} value={surgery}>
                            {surgery}
                          </option>
                        ))}
                      </select> */}

                      <button
                        onClick={applyFilters}
                        className="bg-primaryGreen hover:bg-secondaryGreen text-white px-4 py-2 rounded-lg"
                        disabled={isLoading}
                      >
                        Apply
                      </button>
                      <button
                        onClick={resetFilters}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto max-h-[calc(100vh-350px)]">
              {records?.map((record) => (
                <tr
                  key={record.id}
                  className={`group hover:bg-gray-50 ${
                    selectedRowId === record.id ? "bg-tertiaryGreen" : ""
                  }`}
                  onClick={() => handleRowClick(record)}
                >
                  <td className="px-6 py-4 font-bold">{record.catId}</td>
                  <td className="px-6 py-4">{record.intakePickupDate}</td>
                  <td className="px-6 py-4">
                    {record.trapper && record.trapper.firstName ? (
                      <>
                        {record.trapper.trapperId} - {record.trapper.firstName}{" "}
                        {record.trapper.lastName}
                      </>
                    ) : record.trapper && record.trapper.name ? (
                      record.trapper.name
                    ) : (
                      "No Trapper Assigned"
                    )}
                  </td>
                  <td className="px-6 py-4">{record.service}</td>
                  <td className="px-6 py-4">
                    {record.qualifiesForTIP ? "Yes" : "No"}
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-center py-4">
            {!isLastPage && (
              <button
                onClick={fetchNextPage}
                className="bg-primaryGreen hover:bg-secondaryGreen text-white py-2 px-4 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}

            {/* Optional: Show All Button */}
            {filtersApplied && !isLastPage && (
              <button
                onClick={handleShowAll}
                className="bg-primaryWhite border-2 border-primaryGreen hover:bg-cyan-100 text-primaryGreen font-bold py-2 px-4 rounded-lg ml-4"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
