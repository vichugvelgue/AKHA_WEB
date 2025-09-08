import { useState, useEffect } from "react";

interface SeperadorProps {
  Titulo?: string; // valor inicial
}


export default function Seperador({ Titulo }: SeperadorProps) {
  return (
    <div className="flex items-center my-8">
      <span className="flex-shrink text-xl font-bold tracking-tight text-blue-900 bg-transparent pr-4">
        {Titulo}
      </span>
      <div className="flex-grow border-t-2 border-blue-900"></div>
    </div>
  );
}
