import React from "react";
import CsvUploader from "../components/CsvUploader";

export default function ProfilePage() {
  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Profile</h1>
      </header>
      <section className="p-8">
        <CsvUploader />
      </section>
    </>
  );
}
