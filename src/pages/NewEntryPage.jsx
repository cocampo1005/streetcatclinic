import RecordForm from "../components/RecordForm";

export default function NewEntryPage() {
  return (
    <>
      <header className="w-full border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">New Cat Entry</h1>
      </header>
      <RecordForm />
    </>
  );
}
