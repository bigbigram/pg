import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { GetServerSideProps } from 'next';
import { withAuth } from '../../middleware/withAuth';
import prisma from '../../lib/prisma';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyStats {
  month: string;
  count: number;
  amount: number;
}

interface DashboardProps {
  initialStats: MonthlyStats[];
}

export default function Dashboard({ initialStats }: DashboardProps) {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setMonthlyStats(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Transaction Amount (BTN)',
        data: monthlyStats.map(stat => stat.amount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Transaction Count',
        data: monthlyStats.map(stat => stat.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ]
  };

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6"></h1>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Transaction Volume</h2>
            <Line data={chartData} options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Statistics</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyStats.map((stat, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.amount.toLocaleString('en-US', { style: 'currency', currency: 'BTN' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this type for the page props
type DashboardPageProps = {
  session: any; // You might want to replace 'any' with a proper session type
  initialStats: MonthlyStats[];
};

export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
  try {
    // The session is now available in the page props
    const stats = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count,
        CAST(SUM(amount) AS DECIMAL(10,2)) as amount
      FROM transactions
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `;

    return {
      props: {
        initialStats: JSON.parse(JSON.stringify(stats, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ))
      }
    };
  } catch (error) {
    console.error('Failed to fetch initial stats:', error);
    return {
      props: {
        initialStats: []
      }
    };
  }
});
