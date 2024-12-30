import { useEffect, useState, useCallback } from "react";
import { CurriculumVideos } from "@/components/CurriculumVideos";

type Video = {
  id: string;
  title: string;
}

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
  videos: Video[];
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

// VideoSummary 타입 추가
type VideoSummary = {
  summary: string;
  chapters: {
    chapter_number: number;
    start: number;
    end: number;
    chapter_title: string;
    chapter_summary: string;
  }[];
};

type ProcessedVideo = Video & {
  summary: string;
  chapters: {
    chapter_number: number;
    start: number;
    end: number;
    chapter_title: string;
    chapter_summary: string;
  }[];
};

type ProcessedSection = Omit<CurriculumSection, 'videos'> & {
  videos: ProcessedVideo[];
};

export function Curriculum({ summaryResults }: Props) {
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  console.log("🚀 > Curriculum > curriculum=", curriculum)
  const [flattenedSections, setFlattenedSections] = useState<{ count: number; sections: CurriculumSection[] }>({ count: 0, sections: [] });
  console.log("🚀 > Curriculum > flattenedSections=", flattenedSections)

  // curriculum 로딩 디버깅
  useEffect(() => {
    console.log('Loading curriculum...');
    import('@/data/curriculum.json').then(m => {
      console.log('Curriculum loaded successfully:', m.default);
      console.log('Number of sections:', m.default.sections.length);
      console.log('First section:', m.default.sections[0]);
      setCurriculum(m.default);
    }).catch(error => {
      console.error('Failed to load curriculum:', error);
    });
  }, []);

  const findVideoForSection = useCallback((videoId: string, summaries: Record<string, VideoSummary>) => {
    if (!curriculum) {
      console.error('Curriculum is null in findVideoForSection');
      return null;
    }

    console.log('Finding video details for:', videoId);

    // 비디오 ID가 summaries에 있는지 먼저 확인
    if (!summaries[videoId]) {
      console.warn('Video summary not found:', videoId);
      return null;
    }

    // curriculum에서 비디오 찾기
    const curriculumVideo = curriculum.sections.flatMap(section =>
      section.videos || []
    ).find(v => v?.id === videoId);

    if (!curriculumVideo) {
      console.warn('Video not found in curriculum:', videoId);
      return null;
    }

    // 두 정보를 합쳐서 반환
    const result = {
      ...curriculumVideo,
      summary: summaries[videoId].summary,
      chapters: summaries[videoId].chapters
    };

    console.log('Successfully combined video data for:', videoId);
    return result;
  }, [curriculum]);

  const processSections = useCallback(() => {
    if (!curriculum?.sections) {
      console.warn('No curriculum sections available');
      return;
    }

    console.log('Processing sections...');

    const processNestedSections = (sections: CurriculumSection[]): ProcessedSection[] => {
      return sections.map(section => {
        console.log(`Processing section ${section.id}:`, section.title);

        if (!section || !section.videos) {
          console.warn('Invalid section data:', section);
          return null;
        }

        // 각 비디오에 대해 summary 정보 추가
        const processedVideos = section.videos.map(video => {
          // summaryResults가 객체이므로 직접 접근
          const videoSummary = summaryResults?.[video.id];

          return {
            ...video,
            summary: videoSummary?.summary || '',
            chapters: videoSummary?.chapters || []
          };
        });

        return {
          ...section,
          videos: processedVideos
        };
      }).filter(Boolean) as ProcessedSection[];
    };

    const processedSections = processNestedSections(curriculum.sections);
    console.log('Final processed sections:', processedSections.length);
    setFlattenedSections({
      count: processedSections.length,
      sections: processedSections
    });
  }, [curriculum, summaryResults]);

  useEffect(() => {
    processSections();
  }, [processSections]);

  // Render section videos
  const renderSectionVideos = useCallback((section: CurriculumSection) => {
    if (!section?.id || !section.title || !Array.isArray(section.videos)) return null;

    const sectionVideos = section.videos.filter((video): video is Video => {
      if (!video || !video.id) {
        console.log(`Invalid video in section ${section.id}:`, video);
        return false;
      }
      return true;
    });

    if (sectionVideos.length === 0) {
      console.debug(`No videos found for section ${section.id}: ${section.title}`);
      return null;
    }

    return (
      <div key={section.id} className="section-videos">
        <h3>{section.title}</h3>
        <CurriculumVideos videos={sectionVideos} summaryResults={summaryResults} />
      </div>
    );
  }, [summaryResults]);

  return (
    <div className="curriculum-videos">
      {flattenedSections.sections.map(section => (
        <div key={section.id} className="section-container">
          <h2 className="section-title">{section.title}</h2>
          <p className="section-description">{section.description}</p>
          {renderSectionVideos(section)}
        </div>
      ))}
    </div>
  );
}

export default Curriculum;