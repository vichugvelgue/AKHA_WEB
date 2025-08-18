import { useState, useEffect } from "react";

interface SeperadorProps {
  Titulo?: string; // valor inicial
}


export default function Seperador({ Titulo }: SeperadorProps) {
  return (
    <div>
      <h2 className="block text-gray-900">{Titulo}</h2>
      <hr className="my-4 border-gray-300" />
    </div>
  );
}
