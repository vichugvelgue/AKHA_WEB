import React from 'react';
import { useNotification, NotificationState } from './useNotifications';
// import { NotificationState } from './useNotification';

interface MensajeNotificacionProps extends NotificationState {
  hideNotification?: () => void;
}

export default function MensajeNotificacion({ message, type, visible, hideNotification }: MensajeNotificacionProps) {
  if (!visible) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-[999] flex items-center rounded-lg p-4 text-white shadow-lg transition-transform duration-300 transform
                  ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                  ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}
    >
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      <button onClick={hideNotification} className="ml-4 text-white opacity-70 hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}