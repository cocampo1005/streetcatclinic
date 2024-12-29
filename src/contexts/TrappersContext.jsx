import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

// Create context
const TrappersContext = createContext();

// Provider component
export const TrappersProvider = ({ children }) => {
  const [trappers, setTrappers] = useState([]);

  useEffect(() => {
    // Fetch trappers from Firestore
    const fetchTrappers = async () => {
      try {
        const trappersSnapshot = await getDocs(collection(db, "trappers"));
        const trappersList = trappersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort trappers by trapperId numerically
        const sortedTrappers = trappersList.sort((a, b) => {
          const trapperIdA = parseInt(a.trapperId, 10);
          const trapperIdB = parseInt(b.trapperId, 10);
          return trapperIdA - trapperIdB;
        });

        setTrappers(sortedTrappers);
      } catch (error) {
        console.error("Error fetching trappers:", error);
      }
    };

    fetchTrappers();
  }, []);

  return (
    <TrappersContext.Provider value={{ trappers }}>
      {children}
    </TrappersContext.Provider>
  );
};

// Custom hook to use TrappersContext
export const useTrappers = () => {
  const context = useContext(TrappersContext);
  if (!context) {
    throw new Error("useTrappers must be used within a TrappersProvider");
  }
  return context;
};
