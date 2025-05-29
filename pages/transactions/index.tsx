import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import type { Transaction } from '../../types';

export default function Transactions() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/auth/login';
    },
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session) {
      const fetchTransactions = async () => {
        try {
          const response = await fetch('/api/transactions', {
            credentials: 'include' // Include session cookie
          });

          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }

          const data = await response.json();
          setTransactions(data);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to load transactions');
        } finally {
          setLoading(false);
        }
      };

      fetchTransactions();
    }
  }, [session]); // Depend on session

  return (
    <div className="mt-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="search"
            placeholder="Search by Order No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-500">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading transactions...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SL No</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Order No</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Domain</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions
                      .filter(tx => tx.orderNo.includes(searchTerm))
                      .map((transaction, index) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{index + 1}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.orderNo}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {transaction.domain?.domain || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {Number(transaction.amount).toFixed(2)} {transaction.currency}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              {
                                INITIATED: 'bg-yellow-100 text-yellow-800',
                                PROCESSING: 'bg-blue-100 text-blue-800',
                                COMPLETED: 'bg-green-100 text-green-800',
                                FAILED: 'bg-red-100 text-red-800',
                              }[transaction.status]
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
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
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session }
  };
}
