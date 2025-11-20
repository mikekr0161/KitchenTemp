import api from './index';

export const getVenueLeaderboard = async () => {
  const { data } = await api.get('/leaderboards/venues');
  return data;
};

export const getStaffLeaderboard = async (locationId?: string) => {
  const { data } = await api.get('/leaderboards/staff', { params: { locationId } });
  return data;
};
