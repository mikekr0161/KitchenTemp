import api from './index';

export const getAssignments = async (userId: string) => {
  const { data } = await api.get(`/users/${userId}/training-assignments`);
  return data;
};

export const completeAssignment = async (id: string) => {
  const { data } = await api.patch(`/training-assignments/${id}/complete`, {});
  return data;
};
