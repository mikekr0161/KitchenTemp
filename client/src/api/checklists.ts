import api from './index';

export const fetchTemplates = async () => {
  const { data } = await api.get('/checklists/templates');
  return data;
};

export const fetchRuns = async () => {
  const { data } = await api.get('/checklists/runs');
  return data;
};

export const startRun = async (payload: { checklist_template_id: string; location_id: string }) => {
  const { data } = await api.post('/checklists/runs', payload);
  return data;
};

export const updateRunItem = async (id: string, payload: any) => {
  const { data } = await api.patch(`/checklists/run-items/${id}`, payload);
  return data;
};
