// app/page.tsx

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

// Este es el componente de la página de inicio de sesión.
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Función para manejar el envío del formulario
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // En un escenario real, harías una llamada a tu API para autenticar.
    // Aquí, simulamos un inicio de sesión exitoso.
    if (email !== '' && password !== '') {
      console.log('Login exitoso. Redirigiendo...');
      // Redirigimos al usuario a la página principal del dashboard
      router.push('/dashboard');
    } else {
      setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Panel Izquierdo: Imagen de fondo y texto */}
      <div className="relative hidden w-1/2 items-center justify-center bg-gray-900 lg:flex">
        {/* Usamos el componente Image de Next.js para optimizar la imagen */}
        <Image
          src="/fondo.jpg" // Asegúrate de tener tu imagen en la carpeta `public`
          alt="Descripción de la imagen de fondo"
          layout="fill" // Esto hace que la imagen cubra todo el contenedor
          objectFit="cover" // Ajusta la imagen para que cubra sin distorsionarse
          className="z-0 opacity-50" // Opacidad y z-index para que el texto se vea bien
          unoptimized={true} // Se agrega esta prop para usar la URL de tu imagen
        />
        <div className="z-10 text-center text-white">
          <Image
            src="/logoakha.png" // Asegúrate de tener tu logo en la carpeta `public`
            alt="Logo de la aplicación"
            width={150} // Ajusta el tamaño según tu logo
            height={150}
            className="mx-auto mb-4"
            unoptimized={true} // Se agrega esta prop para usar la URL de tu logo
          />
          <h2 className="text-4xl font-bold">¡Bienvenido!</h2>
          <p className="mt-4 text-xl">
            Tu plataforma de trabajo en equipo y colaboración.
          </p>
        </div>
      </div>

      {/* Panel Derecho: Formulario de Login */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 bg-white">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h1>
          <p className="mb-8 text-gray-600">
            Ingresa tus credenciales para continuar.
          </p>
          {error && <p className="mb-4 text-red-500">{error}</p>}

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Campo de Correo Electrónico */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              />
            </div>

            {/* Botón de Login */}
            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-yellow-400 p-3 font-medium text-gray-900 shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
