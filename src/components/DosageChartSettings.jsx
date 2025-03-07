import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { useAuth } from "../contexts/AuthContext";
import { DeleteIcon, Plus } from "../components/svgs/Icons";
import ConfirmationModal from "../components/ConfirmationModal";

export default function DosageChartSettings() {
  const { user } = useAuth();

  // State to manage the dosage chart data
  const [dosageChart, setDosageChart] = useState([]);

  // State to manage editing a specific cell
  const [editingCell, setEditingCell] = useState(null);

  // State to manage adding a new weight row
  const [newWeight, setNewWeight] = useState("");

  // State for confirmation modal
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // Fetch dosage chart from Firestore
  useEffect(() => {
    const fetchDosageChart = async () => {
      try {
        const docRef = doc(db, "medicationData", "dosageChart");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDosageChart(docSnap.data().chart || []);
        }
      } catch (err) {
        console.error("Error fetching dosage chart:", err);
      }
    };

    fetchDosageChart();
  }, []);

  // Handle updating a specific cell value
  const handleUpdateCell = async (rowIndex, column, newValue) => {
    try {
      const updatedChart = [...dosageChart];
      updatedChart[rowIndex][column] = parseFloat(newValue);

      const docRef = doc(db, "medicationData", "dosageChart");
      await updateDoc(docRef, { chart: updatedChart });

      setDosageChart(updatedChart);
      setEditingCell(null);
    } catch (err) {
      console.error("Error updating dosage chart:", err);
    }
  };

  // Handle adding a new weight row
  const handleAddWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (!weightValue) return;

    try {
      // Create a new row based on the last row's structure
      const lastRow = dosageChart[dosageChart.length - 1];
      const newRow = Object.keys(lastRow).reduce((acc, key) => {
        if (key === "wt") {
          acc[key] = weightValue;
        } else {
          // You might want to adjust this logic for interpolating values
          acc[key] = lastRow[key];
        }
        return acc;
      }, {});

      const updatedChart = [...dosageChart, newRow];
      updatedChart.sort((a, b) => a.wt - b.wt);

      const docRef = doc(db, "medicationData", "dosageChart");
      await updateDoc(docRef, { chart: updatedChart });

      setDosageChart(updatedChart);
      setNewWeight("");
    } catch (err) {
      console.error("Error adding weight row:", err);
    }
  };

  // Function to open the confirmation modal
  const openDeleteModal = (rowIndex) => {
    setRowToDelete(rowIndex);
    setDeleteModalOpen(true);
  };

  // Handle removing a weight row
  const handleRemoveWeight = async (rowIndex) => {
    try {
      const updatedChart = dosageChart.filter((_, index) => index !== rowIndex);

      const docRef = doc(db, "medicationData", "dosageChart");
      await updateDoc(docRef, { chart: updatedChart });

      setDosageChart(updatedChart);
      setDeleteModalOpen(false);
      setRowToDelete(null);
    } catch (err) {
      console.error("Error removing weight row:", err);
    }
  };

  // If user is not an admin, show restricted access message
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center bg-red-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Restricted
          </h2>
          <p className="text-red-800">
            You do not have permission to access the admin settings. Please
            contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  // Ensure weight is the first column
  const columns =
    dosageChart.length > 0
      ? ["wt", ...Object.keys(dosageChart[0]).filter((col) => col !== "wt")]
      : [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dosage Chart Settings (mm)</h1>

      {/* Dosage Chart Table */}
      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((column) => (
                <th
                  key={column}
                  className="p-3 text-center border-b capitalize"
                >
                  {column === "wt" ? (
                    <>
                      Weight (<span className="lowercase">lb</span>)
                    </>
                  ) : (
                    column
                  )}
                </th>
              ))}
              <th className="p-3 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dosageChart.map((row, rowIndex) => (
              <tr key={row.wt} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${row.wt}-${column}`}
                    className="p-3 border-b text-center"
                  >
                    {editingCell?.row === rowIndex &&
                    editingCell?.column === column ? (
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={row[column]}
                        onBlur={(e) =>
                          handleUpdateCell(rowIndex, column, e.target.value)
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateCell(rowIndex, column, e.target.value);
                          }
                        }}
                        className="w-full p-1 border rounded"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() =>
                          setEditingCell({ row: rowIndex, column })
                        }
                        className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                      >
                        {row[column]}
                      </span>
                    )}
                  </td>
                ))}
                <td className="p-3 border-b">
                  <button
                    onClick={() => openDeleteModal(rowIndex)}
                    className="text-secondaryGray hover:text-errorRed p-1 rounded"
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Weight Row */}
      <div className="mt-6 flex items-center gap-4">
        <input
          type="number"
          step="0.1"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          placeholder="Enter new weight"
          className="border p-2 rounded-lg flex-grow"
        />
        <button
          onClick={handleAddWeight}
          disabled={!newWeight}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg 
            ${
              newWeight
                ? "bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <Plus />
          Add Weight Row
        </button>
      </div>

      {/* Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => handleRemoveWeight(rowToDelete)}
          title="Delete Weight Row"
          message={
            <>
              <p>
                Are you sure you want to delete this weight row? This action
                cannot be undone.
              </p>
              <p className="pl-4 py-2">
                <strong>
                  Weight:{" "}
                  {rowToDelete !== null ? dosageChart[rowToDelete].wt : ""} lb
                </strong>
              </p>
            </>
          }
        />
      )}
    </div>
  );
}
