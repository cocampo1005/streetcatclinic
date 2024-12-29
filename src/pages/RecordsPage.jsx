import React from "react";
import CsvUploader from "../components/CsvUploader";
import TrapperUploader from "../components/TrapperUploader";

export default function RecordsPage() {
  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent text-4xl">Records</h1>
      </header>
      <section className="p-8">
        <CsvUploader />
        <TrapperUploader />
      </section>
    </>
  );
}
