import api from './index';

export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotification = async (id: string) => {
  const { data } = await api.patch(`/notifications/${id}`, {});
  return data;
};
