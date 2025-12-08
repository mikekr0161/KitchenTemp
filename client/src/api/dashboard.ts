import api from './index';

export const getDashboard = async () => {
  const { data } = await api.get('/experience/overview');
  return data;
};
