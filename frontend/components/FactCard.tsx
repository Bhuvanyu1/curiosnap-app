import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FactCardProps {
  fact: string;
  category: string;
  imageData: string;
  timestamp?: Date;
}

const categoryColors: Record<string, string> = {
  science: 'bg-blue-100 text-blue-800',
  history: 'bg-amber-100 text-amber-800',
  nature: 'bg-green-100 text-green-800',
  technology: 'bg-purple-100 text-purple-800',
  culture: 'bg-pink-100 text-pink-800',
  food: 'bg-orange-100 text-orange-800',
  art: 'bg-indigo-100 text-indigo-800',
  general: 'bg-gray-100 text-gray-800',
};

export default function FactCard({ fact, category, imageData, timestamp }: FactCardProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amazing Discovery from CurioSnap!',
          text: fact,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(fact);
        toast({
          title: "Copied to clipboard!",
          description: "The fact has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Unable to share this fact.",
          variant: "destructive",
        });
      }
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={imageData}
          alt="Discovery"
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={categoryColors[category] || categoryColors.general}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
          {timestamp && (
            <span className="text-sm text-gray-500">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
        
        <p className="text-gray-800 leading-relaxed mb-4 text-base">
          {fact}
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
