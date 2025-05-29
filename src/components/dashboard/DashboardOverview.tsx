import React from 'react';
import { Book, Headphones, Star, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      label: 'Articles Read',
      value: '12',
      icon: <Book className="w-5 h-5" />,
      color: 'text-magazine-accent'
    },
    {
      label: 'Podcasts Listened',
      value: '8',
      icon: <Headphones className="w-5 h-5" />,
      color: 'text-blue-500'
    },
    {
      label: 'Saved Items',
      value: user?.savedContent.length.toString() || '0',
      icon: <Star className="w-5 h-5" />,
      color: 'text-yellow-500'
    },
    {
      label: 'Reading Time',
      value: '3.5h',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="bg-magazine-secondary rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-magazine-primary rounded-lg p-4">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-magazine-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;