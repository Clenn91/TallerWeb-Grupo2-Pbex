import { ReactNode } from 'react';

interface ProtectedDashboardProps {
  children: ReactNode;
}

export const ProtectedDashboard = ({ children }: ProtectedDashboardProps) => {
  return <>{children}</>;
};

