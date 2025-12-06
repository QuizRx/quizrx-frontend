import { Database, Rotate3d } from "lucide-react";

export const integrations = [
  {
    title: "API Integration",
    icon: Database,
    description:
      "Select this if u have an existing data source you want to integrate like google cloud, amazon s3 or manual api data source.",
  },
  {
    title: "Synthetic Data",
    icon: Rotate3d,
    description:
      "Select this if you want to generate a synthetic data or select from already generated data's.",
  },
];
