import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotification } from '../api/notifications';

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
};

const NotificationsDropdown = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery<{ data: Notification[] }>({ queryKey: ['notifications'], queryFn: getNotifications });
  const notifications = data?.data ?? [];
  const unread = notifications.filter((notification) => !notification.is_read).length;

  const { mutate } = useMutation({
    mutationFn: (id: string) => markNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
        <span>🔔</span>
        {unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unread}</span>}
      </div>
      <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow">
        <div className="px-4 py-2 text-sm font-semibold">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-t px-4 py-2 text-sm ${notification.is_read ? 'bg-white' : 'bg-slate-50'}`}
              onClick={() => mutate(notification.id)}
            >
              <div className="font-medium">{notification.title}</div>
              <div className="text-slate-600">{notification.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
