// hooks/useNotification.ts

import { useState } from 'react';

// Interfaz para el estado de las notificaciones
interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning';
  visible: boolean;
}

/**
 * Custom Hook para gestionar notificaciones temporales (toasts).
 * Proporciona el estado de la notificación y funciones para mostrarla y ocultarla.
 * @returns {{ notification: NotificationState, showNotification: (message: string, type: 'success' | 'error' | 'warning') => void, hideNotification: () => void }}
 */
export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'success',
    visible: false,
  });

  // Función para mostrar una notificación
  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type, visible: true });
    // Oculta la notificación automáticamente después de 5 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000); 
  };
  
  // Función para ocultar la notificación manualmente
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return { notification, showNotification, hideNotification };
};
