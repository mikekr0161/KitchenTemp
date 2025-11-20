import api from './index';

export const getMenuItems = async (locationId: string) => {
  const { data } = await api.get(`/locations/${locationId}/menu-items`);
  return data;
};

export const toggleAvailability = async (id: string, is_available: boolean) => {
  const { data } = await api.patch(`/menu-items/${id}/availability`, { is_available });
  return data;
};
