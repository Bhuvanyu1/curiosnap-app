import React, { useState } from 'react';
import { User, Trophy, Flame, Star, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

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

  const getStreakMessage = () => {
    if (user.streakCount === 0) return "Start your discovery journey!";
    if (user.streakCount === 1) return "Great start! Keep it up!";
    if (user.streakCount < 7) return "Building momentum!";
    if (user.streakCount < 30) return "You're on fire! 🔥";
    return "Discovery master! 🏆";
  };

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{user.streakCount}</span>
            </div>
            <p className="text-sm text-gray-600">Day Streak</p>
            <p className="text-xs text-orange-600 mt-1">{getStreakMessage()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{user.totalFacts}</span>
            </div>
            <p className="text-sm text-gray-600">Facts Discovered</p>
            <p className="text-xs text-yellow-600 mt-1">
              {user.totalFacts === 0 ? "Take your first snap!" : "Keep exploring!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Status */}
      {user.isPremium && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Premium Member</span>
            </div>
            <p className="text-sm text-purple-600 mt-1">
              Enjoy unlimited discoveries and exclusive features!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Interests</CardTitle>
        </CardHeader>
        <CardContent>
          {user.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} className={getCategoryColor(interest)}>
                  {interest}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Start discovering to build your interest profile!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievement Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user.totalFacts >= 1 && (
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">First Discovery</p>
                  <p className="text-xs text-blue-600">You took your first snap!</p>
                </div>
              </div>
            )}
            
            {user.streakCount >= 3 && (
              <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">Streak Master</p>
                  <p className="text-xs text-orange-600">3+ days of discoveries!</p>
                </div>
              </div>
            )}

            {user.totalFacts >= 10 && (
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Curious Explorer</p>
                  <p className="text-xs text-green-600">10+ facts discovered!</p>
                </div>
              </div>
            )}

            {user.totalFacts === 0 && user.streakCount === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Start discovering to unlock achievements!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                // TODO: Implement edit profile
                alert('Edit profile feature coming soon!');
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
