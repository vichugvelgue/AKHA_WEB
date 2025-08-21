// app/dashboard/page.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Importamos useRouter para la redirección
import { ObtenerSesionUsuario } from '@/src/utils/constantes';

// Datos de los módulos para generar los botones dinámicamente
const modulos = [
  { href: '/dashboard/administracion', icon: '⚙️', text: 'Administración' },
  { href: '/dashboard/clientes', icon: '👥', text: 'Clientes' },
  { href: '/dashboard/operativo', icon: '👨‍🏭', text: 'Operativo' },
  { href: '/dashboard/cobranza', icon: '�', text: 'Cobranza' },
  { href: '/dashboard/proyectos', icon: '📝', text: 'Proyectos' },
  { href: '/dashboard/supervision', icon: '🕵️', text: 'Supervisión' },
  { href: '/dashboard/reportes', icon: '📈', text: 'Reportes' },
];


export default function DashboardPage() {
  const router = useRouter();
  const sesion = ObtenerSesionUsuario();


  // En una aplicación real, obtendrías el nombre del usuario de un estado global o de una API.
  // Aquí, lo simulamos para que veas la funcionalidad.
  const nombreUsuario = "Juan Pérez";

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Aquí, en un escenario real, limpiarías el token de autenticación del usuario.
    // Luego, lo redirigirías a la página de login.
    console.log("Cerrando sesión...");
    router.push('/');
  };

  return (
    // Se cambió el fondo de bg-gray-900 a bg-gray-100 para un tema claro
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 text-gray-900">
      {/* Contenedor del nombre de usuario y botón de cerrar sesión en la esquina superior derecha */}
      <div className="absolute right-8 top-8 z-20 flex items-center space-x-4">
        {/* Se ajustaron los colores del texto para que se vean en el fondo claro */}
        <p className="text-lg text-gray-700">
          Bienvenido, <span className="font-bold text-gray-900">{sesion.nombreUsuario}</span>.
        </p>
        <button
          onClick={handleLogout}
          className="rounded-full bg-red-600 px-4 py-1 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="z-10 w-full max-w-5xl p-8">
        {/* Contenedor del logo y título principal */}
        <div className="mb-12 text-center">
          <Image
            src="/logoakha.png" // Asegúrate de colocar tu logo en la carpeta `public`
            alt="Logo de la aplicación"
            width={120}
            height={120}
            className="mx-auto mb-4"
            unoptimized={true}
          />
          {/* Se ajustaron los colores del texto para que se vean en el fondo claro */}
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Panel de Control
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            Selecciona un módulo para comenzar.
          </p>
        </div>

        {/* Cuadrícula de botones de los módulos */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {modulos.map((modulo) => (
            <Link key={modulo.href} href={modulo.href}>
              {/* Se cambió el fondo de los módulos de bg-gray-800 a bg-white */}
              {/* Se ajustó el color del texto de los módulos */}
              <div className="group flex transform cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-600 hover:text-white hover:shadow-2xl">
                <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110">
                  {modulo.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-white">{modulo.text}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
