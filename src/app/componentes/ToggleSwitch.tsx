import { useState, useEffect } from "react";

interface ToggleSwitchProps {
  enabled?: boolean; // valor inicial
  onChange: (value: boolean) => void; // callback al cambiar
}


export default function ToggleSwitch({ enabled = false, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)} // invierte el valor actual
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
