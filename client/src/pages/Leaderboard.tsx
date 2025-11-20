import { useQuery } from '@tanstack/react-query';
import { getVenueLeaderboard, getStaffLeaderboard } from '../api/leaderboard';
import { getLocations } from '../api/locations';

const Leaderboard = () => {
  const { data: venues } = useQuery({ queryKey: ['leaderboard', 'venues'], queryFn: getVenueLeaderboard });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const locationId = locations?.data?.[0]?.id;
  const { data: staff } = useQuery({ queryKey: ['leaderboard', 'staff', locationId], queryFn: () => getStaffLeaderboard(locationId) });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leaderboards</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Venues</div>
          <div className="space-y-2 text-sm text-slate-700">
            {venues?.data?.map((row: any, idx: number) => (
              <div key={row.id} className="flex justify-between border-b pb-1">
                <span>#{idx + 1} {row.location.name}</span>
                <span>{row.total_points} pts</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold">Staff</div>
          <div className="space-y-2 text-sm text-slate-700">
            {staff?.data?.map((row: any, idx: number) => (
              <div key={row.user_id} className="flex justify-between border-b pb-1">
                <span>#{idx + 1} {row.user?.first_name}</span>
                <span>{row._sum.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
