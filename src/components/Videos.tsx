import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // 화살표 아이콘용
import Video from './Video';
import { Video as VideoType } from '@/types';

const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

interface VideosProps {
  videos: VideoType[];
}

export function Videos({ videos }: VideosProps) {
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());




  const toggleVideo = (videoId: string) => {
    const newExpanded = new Set(expandedVideos);
    if (newExpanded.has(videoId)) {
      newExpanded.delete(videoId);
    } else {
      newExpanded.add(videoId);
    }
    setExpandedVideos(newExpanded);
  };

  return (
    <div className="w-full max-w-2xl">
      {videos.map((video) => (
        <div key={video._id} className="border-b border-gray-200">
          <button
            onClick={() => toggleVideo(video._id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <span className="font-medium">{video.system_metadata.filename}</span>
            {expandedVideos.has(video._id) ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedVideos.has(video._id) && (
            <div className="p-4">
              <Video videoId={video._id} indexId={indexId || ''} playing={false} onPlay={() => {}} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}