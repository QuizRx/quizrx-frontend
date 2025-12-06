const PageHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="flex flex-col gap-4  border-b-2 border-gray-100 py-4">
      <p className="text-4xl max-md:text-2xl font-semibold max-md:text-center">{title}</p>
      {description && (
        <p className="text-gray-600 font-light md:text-lg lg:text-xl max-md:text-sm max-md:text-center">
          {description}
        </p>
      )}
    </div>
  );
};
export default PageHeader;
