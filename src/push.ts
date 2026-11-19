import { timeZone, type Reminder } from './model.ts';

const sender = import.meta.env.VITE_PUSH_API as string | undefined;
const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
export const pushConfigured = Boolean(sender && publicKey);
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export async function syncPush(registration: ServiceWorkerRegistration, reminder: Reminder, enroll = false) {
  if (!sender || !publicKey || !pushSupported()) return false;
  let subscription = await registration.pushManager.getSubscription();
  if (enroll && reminder.enabled && Notification.permission === 'granted' && !subscription) {
    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey });
  }
  if (!subscription) return false;
  if (!reminder.enabled) {
    await subscription.unsubscribe();
    return true;
  }
  const response = await fetch(new URL('subscriptions', sender.endsWith('/') ? sender : sender + '/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON(), time: reminder.time, timeZone, weekends: true }),
  });
  if (!response.ok) throw new Error('Reminder sync failed.');
  return true;
}
