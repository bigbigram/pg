import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
