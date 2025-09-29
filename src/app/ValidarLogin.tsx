'use client'; // Asegúrate de que esta línea esté al principio del archivo
import React, { useEffect, useState } from 'react';

export default function ValidarLogin() {
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [isRoot, setIsRoot] = useState<boolean>(false);

  useEffect(() => {
    // Este código se ejecutará solo en el cliente
    if (typeof window !== 'undefined') {
      const storedIdUsuario = localStorage.getItem('idUsuario');
      const isRoot = window.location.pathname == "/";
      const isValidate = window.location.pathname.includes("ValidacionCliente");
      if (!isRoot && !isValidate && !storedIdUsuario) {
        location.href = "/"
      }
    }
  }, []);


  return null;
}