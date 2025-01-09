import React from "react";
import CsvUploader from "../components/CsvUploader";
import MDASTIPForm from "../components/MDASTIPForm";
import { PDFViewer } from "@react-pdf/renderer";

export default function ProfilePage() {
  const recordedEntry = {
    FVRCP: true,
    FeLVFIV: "N/A",
    additionalDrug: "",
    additionalNotes: "",
    age: "6m-1y",
    breed: "DSH",
    catId: "10/15/24- 30",
    catName: "Unnamed",
    color: ["Black"],
    crossStreet: "1831 NE 175 Terrace",
    crossZip: "33179",
    dosage: "",
    intakePickupDate: "10/15/2024",
    microchip: false,
    microchipNumber: "",
    outcome: "Alive",
    qualifiesForTIP: true,
    rabies: true,
    rabiesWithoutCertificate: false,
    service: "MD-TNVR",
    sex: "Female",
    surgeriesPerformed: ["Spay (Female)"],
    surgicalNotes:
      "TNR-Ear Tip, Tattoo, Lidocaine Block, Selamectin, Meloxicam",
    trapper: {
      address: {
        apartment: "",
        city: "North Miami Beach",
        state: "FL",
        street: "171 NE 171 Terrace",
        zip: "33162",
      },
      code: "2410",
      email: "costarica0129@gmail.com",
      firstName: "Danny",
      id: "bmeIThI0gVAfkvn2D6HK",
      lastName: "Alvarado",
      name: null,
      phone: "786-274-3229",
      qualifies: true,
      signature:
        "https://firebasestorage.googleapis.com/v0/b/streetcatclinic.firebasestorage.app/o/signatures%2FDanny%20Alvarado.jpg?alt=media&token=4e84f6dc-44c3-481d-9c77-98ad861516c3",
      trapperId: "2",
    },
    veterinarian: "Toscano-17161",
    weight: "6.5",
  };

  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Profile</h1>
      </header>
      <section className="p-8">
        <CsvUploader />
        {/* Add the PDF Viewer */}
        <PDFViewer style={{ width: "100%", height: "600px" }}>
          <MDASTIPForm entryData={recordedEntry} />
        </PDFViewer>
      </section>
    </>
  );
}
