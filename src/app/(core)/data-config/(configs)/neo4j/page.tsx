import CreateNeo4jForm from "@/modules/graph/layouts/forms/create-neo4j";

export default function Neo4jPage() {
  return (
    <main className="p-4 flex flex-col h-full w-full">
      <div className="mb-8 lg:ml-5 lg:mr-20">
        <h1 className="text-3xl mb-1">Neo4j</h1>
        <p className="text-foreground/50 mb-6">
          Please make sure your Neo4j API keys works.
        </p>
      </div>
      <CreateNeo4jForm />
    </main>
  );
}
