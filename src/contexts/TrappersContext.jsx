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

const TrappersContext = createContext();

export const TrappersProvider = ({ children }) => {
  const [trappers, setTrappers] = useState([]);

  // Fetch trappers from Firestore
  useEffect(() => {
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

  // Add a new trapper
  const createTrapper = async (trapperData) => {
    try {
      const docRef = await addDoc(collection(db, "trappers"), trapperData);
      const newTrapper = { id: docRef.id, ...trapperData };
      setTrappers((prevTrappers) => [...prevTrappers, newTrapper]);
    } catch (error) {
      console.error("Error adding trapper:", error);
    }
  };

  // Update a trapper
  const updateTrapper = async (id, updatedData) => {
    try {
      const trapperRef = doc(db, "trappers", id);
      await updateDoc(trapperRef, updatedData);
      setTrappers((prevTrappers) =>
        prevTrappers.map((trapper) =>
          trapper.id === id ? { ...trapper, ...updatedData } : trapper
        )
      );
    } catch (error) {
      console.error("Error updating trapper:", error);
    }
  };

  // Delete a trapper
  const deleteTrapper = async (id) => {
    try {
      await deleteDoc(doc(db, "trappers", id));
      setTrappers((prevTrappers) =>
        prevTrappers.filter((trapper) => trapper.id !== id)
      );
    } catch (error) {
      console.error("Error deleting trapper:", error);
    }
  };

  return (
    <TrappersContext.Provider
      value={{ trappers, createTrapper, updateTrapper, deleteTrapper }}
    >
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
