import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyOrganisation } from '../api/organisations';

const Dashboard: React.FC = () => {
  const { data: organisation, isLoading } = useQuery({
    queryKey: ['organisation'],
    queryFn: getMyOrganisation,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard for {organisation?.data?.name}</h1>
    </div>
  );
};

export default Dashboard;
