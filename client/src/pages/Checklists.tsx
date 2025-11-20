import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTemplates, fetchRuns, startRun, updateRunItem } from '../api/checklists';
import { getLocations } from '../api/locations';

const Checklists = () => {
  const queryClient = useQueryClient();
  const { data: templates } = useQuery({ queryKey: ['checklists', 'templates'], queryFn: fetchTemplates });
  const { data: runs } = useQuery({ queryKey: ['checklists', 'runs'], queryFn: fetchRuns });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: getLocations });

  const { mutate: start } = useMutation({
    mutationFn: (payload: { checklist_template_id: string; location_id: string }) => startRun(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists', 'runs'] }),
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => updateRunItem(id, { value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists', 'runs'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Checklists</h1>
          <p className="text-sm text-slate-600">Start opening/closing routines and track completion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Templates</div>
          <div className="space-y-2">
            {templates?.data?.map((template: any) => (
              <div key={template.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{template.name}</div>
                    <div className="text-xs text-slate-500">{template.category}</div>
                  </div>
                  <button
                    className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
                    onClick={() => start({ checklist_template_id: template.id, location_id: locations?.data?.[0]?.id })}
                  >
                    Start
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  {template.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Recent runs</div>
          <div className="space-y-2">
            {runs?.data?.map((run: any) => (
              <div key={run.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{run.template.name}</div>
                    <div className="text-xs text-slate-500">{run.status}</div>
                  </div>
                  {run.run_items?.map((item: any) => (
                    <button
                      key={item.id}
                      className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                      onClick={() => updateItem({ id: item.id, value: 'true' })}
                    >
                      ✅ {item.checklist_item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklists;
