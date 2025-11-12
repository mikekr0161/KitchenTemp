import api from './index';

export const getMyOrganisation = async () => {
  const { data } = await api.get('/organisations/me');
  return data;
};
