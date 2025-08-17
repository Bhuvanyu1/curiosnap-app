import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Loader2 } from 'lucide-react';
import FactCard from '../components/FactCard';

interface Discovery {
  id: number;
  imageData: string;
  fact: string;
  category: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['all', 'science', 'history', 'nature', 'technology', 'culture', 'food', 'art', 'general'];

  useEffect(() => {
    fetchDiscoveries();
  }, []);

  const fetchDiscoveries = async () => {
    try {
      const response = await fetch('/api/discoveries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('curiosnap_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDiscoveries(data.discoveries || []);
      }
    } catch (error) {
      console.error('Error fetching discoveries:', error);
      toast({
        title: "Error",
        description: "Failed to load your discoveries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareDiscovery = async (discovery: Discovery) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CurioSnap Discovery',
          text: `Check out this amazing fact I discovered: ${discovery.fact}`,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Check out this amazing fact I discovered: ${discovery.fact}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share this fact with your friends.",
      });
    }
  };

  const filteredDiscoveries = discoveries.filter(discovery => {
    const matchesFilter = filter === 'all' || discovery.category === filter;
    const matchesSearch = discovery.fact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      science: 'bg-blue-100 text-blue-800',
      history: 'bg-purple-100 text-purple-800',
      nature: 'bg-green-100 text-green-800',
      technology: 'bg-gray-100 text-gray-800',
      culture: 'bg-orange-100 text-orange-800',
      food: 'bg-red-100 text-red-800',
      art: 'bg-pink-100 text-pink-800',
      general: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="p-6 pb-24">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
