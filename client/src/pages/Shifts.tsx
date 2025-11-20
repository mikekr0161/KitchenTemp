import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getShifts, clockIn, clockOut } from '../api/shifts';
import { getLocations } from '../api/locations';

const Shifts = () => {
  const queryClient = useQueryClient();
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const locationId = locations?.data?.[0]?.id;
  const { data: shifts } = useQuery({ queryKey: ['shifts', locationId], queryFn: () => getShifts(locationId), enabled: Boolean(locationId) });

  const { mutate: doClockIn } = useMutation({
    mutationFn: (id: string) => clockIn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts', locationId] }),
  });

  const { mutate: doClockOut } = useMutation({
    mutationFn: (id: string) => clockOut(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts', locationId] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shifts</h1>
      <div className="space-y-2">
        {shifts?.data?.map((shift: any) => (
          <div key={shift.id} className="flex items-center justify-between rounded border bg-white p-4 shadow-sm">
            <div>
              <div className="font-semibold">{shift.user.first_name} {shift.user.last_name}</div>
              <div className="text-xs text-slate-500">{new Date(shift.start_time).toLocaleString()} - {new Date(shift.end_time).toLocaleTimeString()}</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded bg-slate-200 px-3 py-1 text-sm" onClick={() => doClockIn(shift.id)}>Clock In</button>
              <button className="rounded bg-emerald-200 px-3 py-1 text-sm" onClick={() => doClockOut(shift.id)}>Clock Out</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shifts;
