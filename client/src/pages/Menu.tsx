import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMenuItems, toggleAvailability } from '../api/menu';
import { getLocations } from '../api/locations';

const Menu = () => {
  const queryClient = useQueryClient();
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const locationId = locations?.data?.[0]?.id;
  const { data: items } = useQuery({ queryKey: ['menu', locationId], queryFn: () => getMenuItems(locationId), enabled: Boolean(locationId) });

  const { mutate } = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) => toggleAvailability(id, available),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu', locationId] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Menu & Live Availability</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items?.data?.map((item: any) => (
          <div key={item.id} className="rounded border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500">£{item.price.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Allergens: {item.allergens.map((a: any) => a.allergen.name).join(', ')}</div>
              </div>
              <button
                className={`rounded px-3 py-1 text-sm ${item.live_menu_status?.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                onClick={() => mutate({ id: item.id, available: !item.live_menu_status?.is_available })}
              >
                {item.live_menu_status?.is_available ? 'Available' : '86 this'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
