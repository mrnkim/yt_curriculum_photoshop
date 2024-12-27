"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Videos } from "@/components/Videos";
import { IndexDetails, VideosResponse } from "@/types";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Button from "@/components/Button";
import { summarize } from "@/hooks/apiHooks";

const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

export default function Home() {
  const { ref, inView } = useInView();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryResults, setSummaryResults] = useState<{
    [key: string]: {
        summary?: string;
        chapters?: {
            chapter_number: number;
            start: number;
            end: number;
            chapter_title: string;
            chapter_summary: string;
        }[];
    };
  }>({});
  console.log("🚀 > Home > summaryResults=", summaryResults)

  const fetchIndexDetails = async (indexId: string) => {
    const response = await fetch(`/api/getIndex?indexId=${indexId}`);
    return response.json();
  };

  const { data: indexDetails } = useQuery<IndexDetails, Error>({
    queryKey: ["indexDetails", indexId],
    queryFn: () => {
      if (!indexId) throw new Error("Index ID is missing");
      return fetchIndexDetails(indexId);
    },
    enabled: !!indexId,
  });

  const fetchVideos = async ({ pageParam = 1 }) => {
    const response = await fetch(
      `/api/getVideos?indexId=${indexId}&page=${pageParam}`
    );
    return response.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<VideosResponse, Error>({
    queryKey: ["videos", indexId],
    queryFn: ({ pageParam = 1 }) => fetchVideos({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page_info.page < lastPage.page_info.total_page) {
        return lastPage.page_info.page + 1;
      }
      return undefined;
    },
    enabled: !!indexId,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}hr ${minutes}min`;
  };

  // 모든 페이지의 비디오 데이터를 하나의 배열로 합치기
  const allVideos = data?.pages.flatMap((page) => page.data) ?? [];

  const handleCreateSummary = async () => {
    setIsGenerating(true);

    try {
      console.log("🔄 Starting to fetch all pages...");

      // 모든 페이지를 순차적으로 가져옵니다
      let currentPage = 1;
      while (true) {
        console.log(`📑 Fetching page ${currentPage}...`);
        const response = await fetch(`/api/getVideos?indexId=${indexId}&page=${currentPage}`);
        const result: VideosResponse = await response.json();

        console.log(`📊 Current page: ${result.page_info.page} of ${result.page_info.total_page}`);

        // 현재 페이지의 비디오들에 대해 처리
        for (const video of result.data) {
          const videoId = video._id;
          const videoTitle = video.system_metadata.filename;
          console.log(`🎬 Processing video ${videoId}`);

          try {
            const [summaryResult, chaptersResult] = await Promise.all([
              summarize(videoId, "summary"),
              summarize(videoId, "chapter")
            ]);

            console.log(`✅ Successfully processed video ${videoId}`);
            setSummaryResults(prev => ({
              ...prev,
              [videoId]: {
                video_title: videoTitle,
                summary: summaryResult.summary,
                chapters: chaptersResult.chapters
              }
            }));
          } catch (error) {
            console.error(`❌ Error processing video ${videoId}:`, error);
          }
        }

        // 마지막 페이지인지 확인
        if (currentPage >= result.page_info.total_page) {
          break;
        }
        currentPage++;
      }

    } catch (error) {
      console.error("❌ Failed to generate summaries:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-2xl font-bold">
            {indexDetails?.index_name} ({indexDetails?.video_count} videos)
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Total Duration: {indexDetails && formatDuration(indexDetails.total_duration)}
          </p>
        </div>

        <div>
          <Button
            onClick={handleCreateSummary}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Create Summary"}
          </Button>
        </div>

        <div className="flex flex-col gap-2 items-center w-full">
          <Videos
            videos={allVideos}
            summaryResults={summaryResults}
          />

          {/* 로딩 인디케이터 및 intersection observer 타겟 */}
          <div ref={ref} className="w-full py-4 text-center">
            {isFetchingNextPage && (
              <div className="text-gray-500">Loading more videos...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
