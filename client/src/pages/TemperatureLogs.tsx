import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEquipment, logTemperature } from '../api/temperature';
import { getLocations } from '../api/locations';

const TemperatureLogs = () => {
  const queryClient = useQueryClient();
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const locationId = locations?.data?.[0]?.id;
  const { data: equipment } = useQuery({ queryKey: ['equipment', locationId], queryFn: () => getEquipment(locationId), enabled: Boolean(locationId) });

  const { mutate } = useMutation({
    mutationFn: (params: { id: string; temperature_c: number }) => logTemperature(params.id, { temperature_c: params.temperature_c }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment', locationId] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Temperature Logs</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {equipment?.data?.map((item: any) => (
          <div key={item.id} className="rounded border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">Last: {item.temperature_logs?.[0]?.temperature_c ?? 'N/A'}°C</div>
              </div>
              <button
                className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
                onClick={() => mutate({ id: item.id, temperature_c: (item.temperature_logs?.[0]?.temperature_c || 0) + 0.5 })}
              >
                + Record
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Target {item.target_temp_min} - {item.target_temp_max}°C
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemperatureLogs;
