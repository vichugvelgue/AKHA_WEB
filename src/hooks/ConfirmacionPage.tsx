'use client';

interface ConfirmacionPageProps{
  Mensaje:string
}

export default function ConfirmacionPage({ Mensaje }: ConfirmacionPageProps) {
  return (
    <div className="p-10 flex-1 bg-white h-screen text-center text-black text-3xl">
      <div>
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <h1>{Mensaje}</h1>
      </div>
    </div>
  );
}
