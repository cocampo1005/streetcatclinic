export const validateTIPEligibility = (entryData) => {
  const trapperErrors = [];
  const entryErrors = [];

  const trapper = entryData.trapper;
  if (!trapper) {
    trapperErrors.push("trapper information");
  } else {
    if (!trapper.firstName || !trapper.lastName) trapperErrors.push("name");
    if (!trapper.phone) trapperErrors.push("phone number");

    // Enhanced signature validation
    if (!trapper.signature) {
      trapperErrors.push("signature");
    } else if (
      typeof trapper.signature !== "string" ||
      trapper.signature.trim().length === 0
    ) {
      trapperErrors.push("valid signature");
    } else {
      // Check if signature URL format is valid
      try {
        const url = new URL(trapper.signature);
        if (!url.protocol.startsWith("http")) {
          trapperErrors.push("accessible signature URL (invalid protocol)");
        }
        // Check for common Firebase Storage patterns
        if (
          !url.hostname.includes("firebasestorage.googleapis.com") &&
          !url.hostname.includes("storage.googleapis.com")
        ) {
          console.warn(
            "Signature URL may not be from Firebase Storage:",
            trapper.signature
          );
        }
      } catch {
        trapperErrors.push("valid signature URL (malformed URL)");
      }
    }

    const address = trapper.address || {};
    if (!address.street || !address.city || !address.state || !address.zip) {
      trapperErrors.push("complete address");
    }
  }

  if (!entryData.intakePickupDate) entryErrors.push("intake/pickup date");
  if (!entryData.catId) entryErrors.push("cat ID");
  if (!entryData.crossStreet) entryErrors.push("cross street");
  if (!entryData.crossZip) entryErrors.push("cross zip");
  if (!entryData.breed) entryErrors.push("breed");
  if (!entryData.color?.length) entryErrors.push("color");
  if (!entryData.weight) entryErrors.push("weight");
  if (!entryData.sex) entryErrors.push("sex");
  if (!entryData.age) entryErrors.push("age");

  const result = [];

  if (trapperErrors.length > 0) {
    result.push(`Trapper is missing: ${trapperErrors.join(", ")}.`);
  }

  if (entryErrors.length > 0) {
    result.push(`The entry submission is missing: ${entryErrors.join(", ")}.`);
  }

  return result;
};

// Additional helper function to test signature URL accessibility
export const testSignatureUrl = async (url) => {
  if (!url) return false;

  try {
    const response = await fetch(url, { method: "HEAD", mode: "no-cors" });
    return true; // If no error thrown, URL is accessible
  } catch (error) {
    console.warn("Signature URL may not be accessible:", url, error);
    return false;
  }
};
