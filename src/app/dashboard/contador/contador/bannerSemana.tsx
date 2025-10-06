import React, { useState, useEffect } from 'react';

// ----------------------------------------------------
// Componente: Banner de Semana Actual
// ----------------------------------------------------

const BannerSemanal: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Actualiza la fecha cada minuto
    const timer = setInterval(() => setCurrentDate(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  const getWeekInfo = (date: Date) => {
    const day = date.getDate();
    // Usa 'es-ES' para el nombre del mes en español
    const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
    
    let weekNumber: number, dateRange: string, colorClass: string;
    // Obtiene el último día del mes actual para el cálculo de la Semana 4
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    if (day >= 1 && day <= 7) {
      weekNumber = 1;
      dateRange = `del 1 al 7 de ${monthName}`;
      colorClass = "bg-green-100 text-green-800 border-green-500";
    } else if (day >= 8 && day <= 14) {
      weekNumber = 2;
      dateRange = `del 8 al 14 de ${monthName}`;
      colorClass = "bg-blue-100 text-blue-800 border-blue-500";
    } else if (day >= 15 && day <= 22) {
      weekNumber = 3;
      dateRange = `del 15 al 22 de ${monthName}`;
      colorClass = "bg-yellow-100 text-yellow-800 border-yellow-500";
    } else { // 23 hasta el último día del mes
      weekNumber = 4;
      dateRange = `del 23 al ${lastDayOfMonth} de ${monthName}`;
      colorClass = "bg-red-100 text-red-800 border-red-500";
    }

    return { weekNumber, dateRange, monthName, colorClass };
  };

  const { weekNumber, dateRange, colorClass } = getWeekInfo(currentDate);

  return (
    <div className={`p-4 rounded-xl shadow-lg border-l-4 font-semibold text-lg transition-all duration-300 ${colorClass} flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6`}>
      <div className="flex items-center text-left">
        {/* Icono de calendario */}
        <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span className="truncate">
          SEMANA FISCAL ACTUAL: <span className="font-extrabold">Semana {weekNumber}</span> ({dateRange})
        </span>
      </div>
      <span className="text-sm font-normal mt-2 sm:mt-0 sm:text-right text-gray-500/70">
        Hoy: {currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    </div>
  );
};

export default BannerSemanal;
