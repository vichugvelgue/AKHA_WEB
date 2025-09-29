'use client';

interface ErrorPageProps{
  Mensaje:string
}

export default function ErrorPage({ Mensaje }: ErrorPageProps) {
  return (
    <div className="p-10 flex-1 bg-white h-screen text-center text-black text-3xl">
      <div>
        <div className="container_Error">
          <div className="circle_Error">
            <div className="error" />
          </div>
        </div>
        <h1>{Mensaje}</h1>
      </div>
    </div>
  );
}
