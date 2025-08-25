import React from "react";
import { pdf } from "@react-pdf/renderer";
import MDASTIPForm from "../components/MDASTIPForm";

// Helper function to preload images with strict validation
const preloadImage = (url, imageName) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error(`${imageName} URL is missing or empty`));
      return;
    }

    const img = new Image();

    img.onload = () => {
      console.log(`Successfully loaded ${imageName}:`, url);
      resolve(url);
    };

    img.onerror = (error) => {
      const errorMsg = `Failed to load ${imageName}. The image may be corrupted, inaccessible, or the URL may be invalid.`;
      console.error(errorMsg, url, error);
      reject(new Error(errorMsg));
    };

    // Set timeout for image loading (8 seconds to account for larger images)
    const timeout = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      const timeoutMsg = `${imageName} failed to load within 8 seconds. This may be due to network issues or a slow connection.`;
      reject(new Error(timeoutMsg));
    }, 8000);

    img.onload = () => {
      clearTimeout(timeout);
      console.log(`Successfully loaded ${imageName}:`, url);
      resolve(url);
    };

    img.onerror = (error) => {
      clearTimeout(timeout);
      const errorMsg = `Failed to load ${imageName}. The image may be corrupted, inaccessible, or the URL may be invalid.`;
      console.error(errorMsg, url, error);
      reject(new Error(errorMsg));
    };

    img.src = url;
  });
};

export const generateMDASTIPFormPDF = async (entryData) => {
  try {
    console.log("Starting PDF generation process...");

    // Validate that required trapper signature exists
    if (!entryData.trapper?.signature) {
      throw new Error(
        "Trapper signature is missing. Please ensure the trapper has a signature on file before generating the TIP PDF."
      );
    }

    // Define all required images with descriptive names
    const requiredImages = [
      { url: entryData.trapper.signature, name: "trapper signature" },
      // Add other required images here if needed in the future
    ];

    console.log("Validating and preloading required images...");

    // Preload all required images with strict validation
    const preloadPromises = requiredImages.map(({ url, name }) =>
      preloadImage(url, name)
    );

    try {
      // Wait for ALL images to load successfully - if any fail, this will throw
      await Promise.all(preloadPromises);
      console.log("All required images loaded successfully");
    } catch (imageError) {
      // Re-throw with more user-friendly message
      throw new Error(
        `Unable to generate PDF: ${imageError.message} Please check your internet connection and try again.`
      );
    }

    console.log("All images validated, generating PDF document...");

    // Only generate PDF after all images are successfully loaded
    const pdfDoc = React.createElement(MDASTIPForm, { entryData });
    const pdfBlob = await pdf(pdfDoc).toBlob();

    if (!pdfBlob) {
      throw new Error(
        "PDF generation failed - the document could not be created."
      );
    }

    console.log("PDF generated successfully");
    return pdfBlob;
  } catch (error) {
    console.error("PDF generation error:", error);
    // Return null to indicate failure - the calling code will handle the error display
    throw error;
  }
};
