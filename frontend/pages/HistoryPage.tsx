import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Loader2 } from 'lucide-react';
import backend from '~backend/client';
import FactCard from '../components/FactCard';

export default function HistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['discoveries'],
    queryFn: () => backend.discovery.listDiscoveries({ limit: 50 })
  });

  if (isLoading) {
    return (
      <div className="p-6 pb-24">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 pb-24">
        <div className="text-center text-red-600">
          Failed to load discoveries. Please try again.
        </div>
      </div>
    );
  }

  const discoveries = data?.discoveries || [];

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Your Discoveries</h1>
      </div>

      {discoveries.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No discoveries yet
          </h2>
          <p className="text-gray-500">
            Start snapping photos to build your collection of amazing facts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            {discoveries.length} discoveries found
          </div>
          
          {discoveries.map((discovery) => (
            <FactCard
              key={discovery.id}
              fact={discovery.fact}
              category={discovery.category}
              imageData={`data:image/jpeg;base64,${discovery.imageData}`}
              timestamp={new Date(discovery.createdAt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
