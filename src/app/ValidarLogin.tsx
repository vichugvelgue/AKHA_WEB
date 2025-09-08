'use client'; // Asegúrate de que esta línea esté al principio del archivo
import React, { useEffect, useState } from 'react';

export default function ValidarLogin() {
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [isRoot, setIsRoot] = useState<boolean>(false);

  useEffect(() => {
    // Este código se ejecutará solo en el cliente
    const storedIdUsuario = localStorage.getItem('idUsuario');
    setIdUsuario(storedIdUsuario);
    const isRoot = window.location.pathname == "/";
    setIsRoot(isRoot);

    if (!isRoot && !idUsuario) {
      location.href = "/"
    }
  }, []);


  return null;
}