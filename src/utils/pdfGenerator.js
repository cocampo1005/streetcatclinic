import React from "react";
import { pdf } from "@react-pdf/renderer";
import MDASTIPForm from "../components/MDASTIPForm";

export const generateMDASTIPFormPDF = async (entryData) => {
  try {
    const pdfDoc = React.createElement(MDASTIPForm, { entryData });
    const pdfBlob = await pdf(pdfDoc).toBlob(); // Convert to Blob for upload
    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};
