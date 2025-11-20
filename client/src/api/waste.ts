import api from './index';

export const getWaste = async (locationId: string) => {
  const { data } = await api.get(`/locations/${locationId}/waste-logs`);
  return data;
};

export const getWasteSummary = async () => {
  const { data } = await api.get('/waste/summary');
  return data;
};
