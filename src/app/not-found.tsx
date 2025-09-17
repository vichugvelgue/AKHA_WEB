// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg">La página que buscas no existe.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
