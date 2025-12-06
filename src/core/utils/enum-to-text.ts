export const enumToText = (enumValue: string) => {
  const word = enumValue.includes("_")
    ? enumValue
        .split("_")
        .map((word) => word.at(0)?.toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : enumValue.at(0)?.toUpperCase() + enumValue.slice(1).toLowerCase();
  return word;
};
