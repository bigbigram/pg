import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../../middleware/withAuth';
import prisma from '../../../lib/prisma';

export default function EditDomainPage({ domain }: { domain: any }) {
  const [name, setName] = useState(domain.name || '');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/domains/${domain.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        router.push('/domains');
      } else {
        console.error('Failed to update domain');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Domain</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Domain Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export const getServerSideProps = withAuth(async (context) => {
  const { id } = context.params || {};

  try {
    const domain = await prisma.allowedDomain.findUnique({
      where: { id: Number(id) }
    });

    if (!domain) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        domain: JSON.parse(JSON.stringify(domain)) // Serialize dates
      }
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
});