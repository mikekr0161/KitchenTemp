import api from './index';

export const getShifts = async (locationId: string) => {
  const { data } = await api.get(`/locations/${locationId}/shifts`);
  return data;
};

export const clockIn = async (id: string) => {
  const { data } = await api.post(`/shifts/${id}/clock-in`);
  return data;
};

export const clockOut = async (id: string) => {
  const { data } = await api.post(`/shifts/${id}/clock-out`);
  return data;
};
