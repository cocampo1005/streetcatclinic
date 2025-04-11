export const validateTIPEligibility = (entryData) => {
  const trapperErrors = [];
  const entryErrors = [];

  const trapper = entryData.trapper;
  if (!trapper) {
    trapperErrors.push("trapper information");
  } else {
    if (!trapper.firstName || !trapper.lastName) trapperErrors.push("name");
    if (!trapper.phone) trapperErrors.push("phone number");
    if (!trapper.signature) trapperErrors.push("signature");

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
