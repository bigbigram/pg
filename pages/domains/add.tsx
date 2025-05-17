import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AddDomain() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    domain: '',
    clientName: '',
    clientId: crypto.randomUUID(),
    clientSecret: crypto.randomUUID(),
    csrNumber: '',
    serverIp: '',
    clientDomain: '',
    apiKey: `pk_${Date.now()}`,
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
        throw new Error(await response.text());
      }

      router.push('/domains');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Domain</h1>
        <p className="mt-2 text-sm text-gray-600">Register a new domain for integration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8 divide-y divide-gray-200">
          <div className="pt-8">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="clientName"
                    id="clientName"
                    value={formData.clientName}
                    onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domain
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="domain"
                    id="domain"
                    value={formData.domain}
                    onChange={e => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="csrNumber" className="block text-sm font-medium text-gray-700">
                  CSR Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="csrNumber"
                    id="csrNumber"
                    value={formData.csrNumber}
                    onChange={e => setFormData(prev => ({ ...prev, csrNumber: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="redirectUrl" className="block text-sm font-medium text-gray-700">
                  Redirect URL
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="redirectUrl"
                    id="redirectUrl"
                    value={formData.redirectUrl}
                    onChange={e => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Technical Details</h3>
              <p className="mt-1 text-sm text-gray-500">Server and domain configuration</p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="serverIp" className="block text-sm font-medium text-gray-700">
                  Server IP
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="serverIp"
                    id="serverIp"
                    value={formData.serverIp}
                    onChange={e => setFormData(prev => ({ ...prev, serverIp: e.target.value }))}
                    placeholder="xxx.xxx.xxx.xxx"
                    pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                    title="Please enter a valid IP address"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">IPv4 address of the server</p>
              </div>

              <div>
                <label htmlFor="clientDomain" className="block text-sm font-medium text-gray-700">
                  Client Domain
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="clientDomain"
                    id="clientDomain"
                    value={formData.clientDomain}
                    onChange={e => setFormData(prev => ({ ...prev, clientDomain: e.target.value }))}
                    placeholder="example.com"
                    pattern="^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$"
                    title="Please enter a valid domain name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Primary domain of the client</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Authentication Details</h3>
              <p className="mt-1 text-sm text-gray-500">Auto-generated secure credentials</p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client ID</label>
                <input
                  type="text"
                  value={formData.clientId}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="text"
                  value={formData.apiKey}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Saving...' : 'Save Domain'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
