import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAssignments, completeAssignment } from '../api/training';
import { getMyOrganisation } from '../api/organisations';

const Training = () => {
  const queryClient = useQueryClient();
  const { data: org } = useQuery({ queryKey: ['organisation'], queryFn: getMyOrganisation });
  const userId = localStorage.getItem('userId') || org?.data?.id;
  const { data: assignments } = useQuery({ queryKey: ['training', userId], queryFn: () => getAssignments(userId!), enabled: Boolean(userId) });

  const { mutate } = useMutation({
    mutationFn: (id: string) => completeAssignment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training', userId] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Training</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {assignments?.data?.map((assignment: any) => (
          <div key={assignment.id} className="rounded border bg-white p-4 shadow-sm">
            <div className="font-semibold">{assignment.training_module.title}</div>
            <div className="text-xs text-slate-500">Due {new Date(assignment.due_at).toLocaleDateString()}</div>
            <div className="mt-2 text-sm text-slate-700">{assignment.training_module.description}</div>
            <button
              className="mt-3 rounded bg-emerald-600 px-3 py-1 text-sm text-white"
              onClick={() => mutate(assignment.id)}
            >
              Mark Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Training;
