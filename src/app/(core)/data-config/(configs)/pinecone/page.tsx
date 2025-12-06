import CreatePineconeForm from "@/modules/graph/layouts/forms/create-pinecone";

export default function PineconePage() {
  return (
    <main className=" p-4">
      <div className="mb-8 lg:ml-5 lg:mr-20">
        <h1 className="text-3xl mb-1">Pinecone</h1>
        <p className="text-foreground/50 mb-6">
          Please fill your pinecone parameters.
        </p>
        <CreatePineconeForm />
      </div>
    </main>
  );
}
