import { useNotification } from '../context/NotificationContext';
export default function useToast() {
  const { toast } = useNotification();
  return toast;
}