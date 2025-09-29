// app/dashboard/administracion/layout.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

interface MenuItemProps {
  href: string;
  icon: string;
  text: string;
  currentPath: string;
}

const MenuItem = ({ href, icon, text, currentPath }: MenuItemProps) => {
  const isActive = currentPath.startsWith(href);
  // Se ajustaron las clases para un tema azul oscuro con un botón activo amarillo.
  const activeClasses = isActive
    ? 'bg-yellow-400 text-gray-900'
    : 'text-white hover:bg-blue-700';

  return (
    <li>
      <Link
        href={href}
        className={`flex items-center rounded-lg p-3 transition-colors duration-200 ${activeClasses}`}
      >
        <span className="mr-4 text-xl">{icon}</span>
        <span>{text}</span>
      </Link>
    </li>
  );
};

export default function AdministracionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname();

  return (
    // Se mantuvo el fondo claro para el tema principal
    <div className="flex h-screen w-full bg-gray-100 text-gray-900">
      
      {/* Se cambió el fondo de la barra lateral a un color azul más oscuro */}
      <aside className="w-64 bg-blue-900 p-6 shadow-lg text-white flex flex-col">
        <div className="mb-10 text-xl font-bold tracking-wider text-yellow-400">
          Contador
        </div>
        <nav>
          <ul className="space-y-3 font-medium">
            <MenuItem 
              href="/dashboard/contador/contador" 
              icon="👤" 
              text="Contador"
              currentPath={pathname}
            />
          </ul>
        </nav>

        {/* Espacio para el logo en la parte inferior */}
        <div className="mt-auto pt-6 text-center">
          <img
            src="/logoakha.png"            
            className="mx-auto h-12 w-auto"
            onClick={() => router.push('/dashboard')}
          />
        </div>
      </aside>

      {/* El contenido de las páginas secundarias se renderizará aquí */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
