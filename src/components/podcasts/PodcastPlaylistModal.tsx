import React from 'react';
import { X } from 'lucide-react';
import PodcastPlaylist from './PodcastPlaylist';

interface PodcastPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcastId: string;
  podcastName: string;
  currentEpisode: any | null;
}

const PodcastPlaylistModal: React.FC<PodcastPlaylistModalProps> = ({
  isOpen,
  onClose,
  podcastId,
  podcastName,
  currentEpisode
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-dark-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Add to Playlist</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          <PodcastPlaylist 
            currentPodcast={{
              id: podcastId,
              name: podcastName
            }}
            currentEpisode={currentEpisode}
          />
        </div>
      </div>
    </div>
  );
};

export default PodcastPlaylistModal;
