import { type Prisma } from '@prisma/client';

export interface Transaction {
  id: string;
  amount: number; // Changed from Prisma.Decimal
  orderNo: string;
  currency: string;
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  domain?: {
    domain: string;
  };
}

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className: string }>;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void> | void;
  children?: NavItem[];
}

export type DashboardStat = {
  name: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
};
