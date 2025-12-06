"use client";
import { Infinity } from "ldrs/react";

const LoadingElement = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Infinity
        size="55"
        stroke="4"
        strokeLength="0.15"
        bgOpacity="0.1"
        speed="1.3"
        color="black"
      />
    </div>
  );
};

export default LoadingElement;
