// app/dashboard/administracion/page.tsx

'use client';

export default function AdministracionPage() {
  return (
    <div className="p-10 flex-1 overflow-auto">
      <h1 className="text-4xl font-extrabold text-blue-900">Panel de Administración</h1>
      <p className="mt-2 text-gray-400">
        Esta es la página principal del área de administración. Para gestionar los usuarios, haz clic en el enlace correspondiente en el menú lateral.
      </p>
    </div>
  );
}
