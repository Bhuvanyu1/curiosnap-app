import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import FactCard from '../components/FactCard';

export default function HomePage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFact, setCurrentFact] = useState<{
    fact: string;
    category: string;
    imageData: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Image = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        try {
          // Analyze the image using API client
          const analyzeResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('curiosnap_token')}`,
            },
            body: JSON.stringify({ imageData: base64Image }),
          });

          if (!analyzeResponse.ok) {
            throw new Error('Failed to analyze image');
          }

          const result = await analyzeResponse.json();

          // Save the discovery
          const saveResponse = await fetch('/api/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('curiosnap_token')}`,
            },
            body: JSON.stringify({
              imageData: base64Image,
              fact: result.fact,
              category: result.category,
            }),
          });

          if (!saveResponse.ok) {
            throw new Error('Failed to save discovery');
          }

          setCurrentFact({
            fact: result.fact,
            category: result.category,
            imageData: base64Data
          });

          // Update user stats in context
          updateUser({
            totalFacts: (user?.totalFacts || 0) + 1,
            streakCount: (user?.streakCount || 0) + 1,
          });

          toast({
            title: "Discovery saved!",
            description: "Your new fact has been added to your collection.",
          });
        } catch (error) {
          console.error('Error analyzing image:', error);
          toast({
            title: "Analysis failed",
            description: "Sorry, we couldn't analyze your image. Please try again.",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  return (
    <div className="p-6 pb-24">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">CurioSnap</h1>
        </div>
        <p className="text-gray-600">
          Discover amazing facts about the world around you
        </p>
      </div>

      {currentFact ? (
        <div className="mb-8">
          <FactCard
            fact={currentFact.fact}
            category={currentFact.category}
            imageData={currentFact.imageData}
          />
          <div className="text-center mt-4">
            <Button
              onClick={() => setCurrentFact(null)}
              variant="outline"
              className="w-full"
            >
              Take Another Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Card className="mb-8 border-dashed border-2 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center">
                <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Discover?
                </h2>
                <p className="text-gray-600 mb-6">
                  Take a photo of anything around you and learn something amazing!
                </p>
                
                <Button
                  onClick={triggerCamera}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mr-2" />
                      Snap & Discover
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">∞</div>
              <div className="text-sm text-gray-600">Facts to Discover</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">🌟</div>
              <div className="text-sm text-gray-600">Learn Something New</div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
