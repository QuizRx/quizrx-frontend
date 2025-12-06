import TemplateCard from "../../components/cards/template";
import { templates } from "../../utils/objects/templates";

export const Templates = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold">Start by a template</h1>
      <p className="text-muted-foreground">
        Explore pre-made templates which you can modify.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 pt-10">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
};
