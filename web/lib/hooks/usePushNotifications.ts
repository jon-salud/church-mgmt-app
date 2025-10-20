import { useState, useEffect } from 'react';
import { subscribeToPushNotifications } from '../notifications';
import { clientApi } from '../api.client';

export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const subscribe = async () => {
      try {
        const sub = await subscribeToPushNotifications();
        setSubscription(sub);
        await clientApi.subscribeToNotifications(sub);
      } catch (err) {
        setError(err as Error);
      }
    };

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          if (!sub) {
            subscribe();
          } else {
            setSubscription(sub);
          }
        });
      });
    }
  }, []);

  return { subscription, error };
};
