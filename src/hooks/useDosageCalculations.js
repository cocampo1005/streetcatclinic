import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

export const useDosageCalculation = (weight, drug) => {
  const [dosageChart, setDosageChart] = useState([]);
  const [calculatedDosage, setCalculatedDosage] = useState("");

  useEffect(() => {
    const fetchDosageChart = async () => {
      try {
        const docRef = doc(db, "medicationData", "dosageChart");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const chart = docSnap.data().chart || [];
          setDosageChart(chart);
        }
      } catch (err) {
        console.error("Error fetching dosage chart:", err);
      }
    };

    fetchDosageChart();
  }, []);

  useEffect(() => {
    const calculateDosage = (weight, drug) => {
      if (!weight || !drug || dosageChart.length === 0) return "";

      const sanitizedDrug = drug.replace(/\s+/g, "");
      const closestEntry = dosageChart.reduce((prev, curr) =>
        Math.abs(curr.wt - weight) < Math.abs(prev.wt - weight) ? curr : prev
      );

      return closestEntry[sanitizedDrug] || "No dosage available";
    };

    if (weight && drug) {
      const dosage = calculateDosage(weight, drug);
      setCalculatedDosage(dosage);
    }
  }, [weight, drug, dosageChart]);

  return calculatedDosage;
};
