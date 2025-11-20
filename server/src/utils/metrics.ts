export type WasteLogInput = { estimated_cost: number };
export const calculateWasteCost = (logs: WasteLogInput[]) => logs.reduce((acc, log) => acc + (log.estimated_cost || 0), 0);

export type ChecklistRunInput = { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' };
export const completionRate = (runs: ChecklistRunInput[]) => {
  if (!runs.length) return 0;
  const completed = runs.filter((run) => run.status === 'COMPLETED').length;
  return completed / runs.length;
};
