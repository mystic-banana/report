import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Book, Headphones } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      type: 'article',
      title: 'The Ancient Practice of Astral Projection',
      timestamp: '2 hours ago',
      icon: <Book className="w-4 h-4" />,
      link: '/article/ancient-practice-astral-projection'
    },
    {
      type: 'podcast',
      title: 'Modern Meditation Techniques',
      timestamp: '5 hours ago',
      icon: <Headphones className="w-4 h-4" />,
      link: '/podcast/modern-meditation'
    },
    {
      type: 'article',
      title: 'Understanding Your Moon Sign',
      timestamp: '1 day ago',
      icon: <Book className="w-4 h-4" />,
      link: '/article/understanding-your-moon-sign'
    }
  ];

  return (
    <div className="bg-magazine-secondary rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
      
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="bg-magazine-primary p-2 rounded-lg">
              {activity.icon}
            </div>
            
            <div className="flex-1">
              <Link 
                to={activity.link}
                className="font-medium hover:text-magazine-accent transition-colors"
              >
                {activity.title}
              </Link>
              <div className="flex items-center text-sm text-magazine-muted mt-1">
                <Clock className="w-4 h-4 mr-1" />
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;