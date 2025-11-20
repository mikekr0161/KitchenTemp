import api from './index';

export const getEquipment = async (locationId: string) => {
  const { data } = await api.get(`/locations/${locationId}/equipment`);
  return data;
};

export const logTemperature = async (id: string, payload: { temperature_c: number; notes?: string }) => {
  const { data } = await api.post(`/equipment/${id}/temperature-logs`, payload);
  return data;
};
