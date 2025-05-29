import { ReactNode } from 'react';
import Header from '../Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  console.log('Rendering MainLayout');
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
