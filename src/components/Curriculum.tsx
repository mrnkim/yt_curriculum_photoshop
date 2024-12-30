import { useState, useEffect, useCallback } from "react";
import { CurriculumVideos } from "@/components/CurriculumVideos";
import { Video as allVideos, VideosResponse } from "@/types";
import { fetchVideos } from '@/hooks/apiHooks';
import { ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

type Video = string;

type CurriculumSection = {
  id: number;
  title: string;
  description: string;
  videos: Video[];
  sections?: CurriculumSection[];
};

type CurriculumData = {
  title: string;
  sections: CurriculumSection[];
};

type Props = {
  summaryResults?: {
    [key: string]: {
      summary: string;
      chapters: {
        chapter_number: number;
        start: number;
        end: number;
        chapter_title: string;
        chapter_summary: string;
      }[];
    };
  };
};


export function Curriculum({ summaryResults }: Omit<Props, 'videos'>) {
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [allFetchedVideos, setAllFetchedVideos] = useState<allVideos[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      if (!hasMore || isLoading) return;

      try {
        setIsLoading(true);
        const response = await fetchVideos(page, indexId || '');

        setAllFetchedVideos(prev => [...prev, ...response.data]);
        setHasMore(response.page_info?.page < response.page_info?.total_page);
        setPage(prev => prev + 1);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
        hasMore &&
        !isLoading
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  // curriculum 로딩 디버깅
  useEffect(() => {
    console.log('Loading curriculum...');
    import('@/data/curriculum.json').then(m => {
      console.log('Curriculum loaded successfully:', m.default);
      console.log('Number of sections:', m.default.sections.length);
      m.default.sections.forEach((section, index) => {
        console.log(`Section ${index + 1}:`, section);
      });
      setCurriculum(m.default);
    }).catch(error => {
      console.error('Failed to load curriculum:', error);
    });
  }, []);


  // Render section videos
  const renderSectionVideos = useCallback((section: CurriculumSection) => {
    console.log('Rendering section:', section);
    if (!section?.id || !section.title || !Array.isArray(section.videos)) {
      console.log('Invalid section data:', section);
      return null;
    }

    const sectionVideos = section.videos
      .filter(videoId => {
        if (!videoId) {
          console.log(`Invalid video ID in section ${section.id}:`, videoId);
          return false;
        }
        // 해당 섹션의 비디오 ID와 일치하는 비디오만 필터링
        const found = allFetchedVideos.find(v => v._id === videoId);
        console.log(`Video ${videoId} found:`, !!found);
        return !!found;
      })
      .map(videoId => {
        const originalVideo = allFetchedVideos.find(v => v._id === videoId);
        if (!originalVideo) {
          console.log(`Video not found for ID: ${videoId}`);
          return null;
        }
        return {
          id: videoId,
          title: (originalVideo?.system_metadata?.filename || videoId).replace(/\.mp4$/, ''),
          summary: summaryResults?.[videoId]?.summary || '',
          chapters: summaryResults?.[videoId]?.chapters || []
        };
      })
      .filter(Boolean); // null 값 제거

    if (sectionVideos.length === 0) {
      console.debug(`No videos found for section ${section.id}: ${section.title}`);
      return null;
    }

    return (
      <div key={section.id} className="section-videos">
        <CurriculumVideos videos={sectionVideos}/>
      </div>
    );
  }, [summaryResults, allFetchedVideos]);

  // 섹션 토글 핸들러 추가
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (isLoading && allFetchedVideos.length === 0) return <div>Loading videos...</div>;
  if (error) return <div>Error loading videos: {error.message}</div>;

  return (
    <div className="curriculum-videos">
      {curriculum?.sections.map((section, index) => {
        const sectionVideoCount = section.videos.length +
          (section.sections?.reduce((acc, sub) => acc + sub.videos.length, 0) || 0);
        const isExpanded = expandedSections.has(section.id);

        return (
          <div key={section.id} className="section-container p-3 bg-gray-50 rounded-lg">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              {isExpanded ? (
                <ChevronDown className="w-6 h-6 mr-2" />
              ) : (
                <ChevronRight className="w-6 h-6 mr-2" />
              )}
              <h2 className="section-title text-2xl font-bold text-gray-800 mb-2">
                {section.title} <span className="text-gray-500 text-lg">({sectionVideoCount} videos)</span>
              </h2>
            </div>
            <p className="section-description text-gray-600 mb-2">{section.description}</p>
            {isExpanded && (
              <>
                {section.sections?.map(subSection => {
                  const subSectionVideoCount = subSection.videos.length;
                  const isSubExpanded = expandedSections.has(subSection.id);

                  return (
                    <div key={subSection.id} className="subsection-container ml-4 mb-3 p-4 bg-white rounded-lg">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleSection(subSection.id)}
                      >
                        {isSubExpanded ? (
                          <ChevronDown className="w-5 h-5 mr-2" />
                        ) : (
                          <ChevronRight className="w-5 h-5 mr-2" />
                        )}
                        <h3 className="subsection-title text-xl font-semibold text-gray-700 mb-2">
                          {subSection.title} <span className="text-gray-500">({subSectionVideoCount} videos)</span>
                        </h3>
                      </div>
                      <p className="subsection-description text-gray-600 mb-3">{subSection.description}</p>
                      {isSubExpanded && renderSectionVideos(subSection)}
                    </div>
                  );
                })}
                {renderSectionVideos(section)}
              </>
            )}
          </div>
        );
      })}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default Curriculum;