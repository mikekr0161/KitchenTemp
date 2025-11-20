import { useQuery } from '@tanstack/react-query';
import { getWaste, getWasteSummary } from '../api/waste';
import { getLocations } from '../api/locations';

const Waste = () => {
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const locationId = locations?.data?.[0]?.id;
  const { data: waste } = useQuery({ queryKey: ['waste', locationId], queryFn: () => getWaste(locationId), enabled: Boolean(locationId) });
  const { data: summary } = useQuery({ queryKey: ['waste', 'summary'], queryFn: getWasteSummary });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Food Waste</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Weekly trend</div>
          <div className="space-y-1 text-sm text-slate-700">
            {summary?.data?.map((row: any) => (
              <div key={row.week} className="flex justify-between border-b pb-1">
                <span>{row.week}</span>
                <span>£{Number(row.cost).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Recent logs</div>
          <div className="space-y-2 text-sm text-slate-700">
            {waste?.data?.map((row: any) => (
              <div key={row.id} className="flex justify-between border-b pb-1">
                <span>{row.type}</span>
                <span>£{row.estimated_cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waste;
