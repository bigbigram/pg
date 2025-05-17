import { useState } from 'react';
import { useRouter } from 'next/router';

export default function DomainForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    domain: '',
    clientName: '',
    clientId: '',
    clientSecret: '',
    csrNumber: '',
    serverIp: '',
    apiKey: '',
    redirectUrl: '',
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/domains/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add domain');
      }

      router.push('/domains');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white px-4 py-5 shadow rounded-lg sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain</label>
            <input
              type="text"
              name="domain"
              id="domain"
              value={formData.domain}
              onChange={e => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          {/* Add other form fields similarly */}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Domain'}
        </button>
      </div>
    </form>
  );
}
