import api from './index';

export const getLocations = async () => {
  const { data } = await api.get('/locations');
  return data;
};
