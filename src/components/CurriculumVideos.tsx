import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // 화살표 아이콘용
import Video from './Video';
import { usePlayer } from '@/contexts/PlayerContext';

const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

interface Chapter {
  chapter_number: number;
  start: number;
  end: number;
  chapter_title: string;
  chapter_summary: string;
}

interface CurriculumVideosProps {
  videos: {
    id: string;
    title: string;
    summary?: string;
    chapters?: Chapter[];
  }[];
  summaryResults?: {
    [key: string]: {
      summary?: string;
      chapters?: Chapter[];
    };
  };
}

export function CurriculumVideos({ videos, summaryResults }: CurriculumVideosProps) {
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const { currentPlayerId, setCurrentPlayerId } = usePlayer();
  const [playingChapter, setPlayingChapter] = useState<{
    start?: number;
    end?: number;
  } | null>(null);

  const toggleVideo = (videoId: string) => {
    const newExpanded = new Set(expandedVideos);
    if (newExpanded.has(videoId)) {
      newExpanded.delete(videoId);
    } else {
      newExpanded.add(videoId);
    }
    setExpandedVideos(newExpanded);
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChapterClick = (videoId: string, start: number, end: number) => {
    setCurrentPlayerId(videoId);
    setPlayingChapter({ start, end });
  };

  return (
    <div className="w-full max-w-4xl">
      {videos.map((video) => (
        <div key={video.id} className="border-b border-gray-200 py-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => toggleVideo(video.id)}
              className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded"
            >
              <span className="font-medium">{video.title}</span>
              {expandedVideos.has(video.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {video.summary && (
              <div className="px-2">
                <p className="text-gray-700 text-sm">{video.summary}</p>
              </div>
            )}

            {expandedVideos.has(video.id) && (
              <div className="flex gap-6 p-4">
                <div className="flex-1">
                  <Video
                    videoId={video.id}
                    indexId={indexId || ''}
                    playing={currentPlayerId === video.id}
                    startTime={currentPlayerId === video.id ? playingChapter?.start : undefined}
                    endTime={currentPlayerId === video.id ? playingChapter?.end : undefined}
                    onPlay={() => {
                      setCurrentPlayerId(video.id);
                      setPlayingChapter(null);
                    }}
                  />
                </div>

                {video.chapters && (
                  <div className="flex-1">
                    <h3 className="font-semibold mb-3">Chapters</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {video.chapters.map((chapter, idx) => (
                        <div
                          key={idx}
                          className="border-l-2 border-gray-200 pl-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleChapterClick(video.id, chapter.start, chapter.end)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              {formatTimestamp(chapter.start)} - {formatTimestamp(chapter.end)}
                            </span>
                            <h4 className="font-medium">{chapter.chapter_title}</h4>
                          </div>
                          <p className="text-gray-700 text-sm mt-1">{chapter.chapter_summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}