import React, { useState } from 'react';
import { Sparkles, Share2, Heart, Copy, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface FactCardProps {
  fact: string;
  category: string;
  imageData: string;
  timestamp?: Date;
  discoveryId?: number;
  showActions?: boolean;
}

export default function FactCard({ 
  fact, 
  category, 
  imageData, 
  timestamp, 
  discoveryId,
  showActions = true 
}: FactCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const { toast } = useToast();

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

  const handleShare = async () => {
    const shareText = `🤔 Did you know? ${fact}\n\nDiscovered this amazing ${category} fact with CurioSnap! 📸✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CurioSnap Discovery',
          text: shareText,
          url: window.location.origin,
        });
        setShareCount(prev => prev + 1);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share this fact with your friends.",
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Fact removed from your favorites." : "Fact saved to your favorites!",
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fact);
    toast({
      title: "Fact copied!",
      description: "The fact has been copied to your clipboard.",
    });
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
