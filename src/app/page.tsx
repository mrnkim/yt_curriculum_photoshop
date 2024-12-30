"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Videos } from "@/components/Videos";
import { Curriculum } from "@/components/Curriculum";
import { IndexDetails, VideosResponse } from "@/types";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { fetchVideos } from '@/hooks/apiHooks';
import LoadingSpinner from "@/components/LoadingSpinner";
const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

type SummaryData = {
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

type TabType = "all" | "curriculum";

export default function Home() {
  const { ref, inView } = useInView();

  const [summariesData, setSummariesData] = useState<SummaryData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    import('@/data/summaries.json').then(m => setSummariesData(m.default));
  }, []);

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

  // const fetchVideos = async ({ pageParam = 1 }) => {
  //   const response = await fetch(
  //     `/api/getVideos?indexId=${indexId}&page=${pageParam}`
  //   );
  //   return response.json();
  // };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<VideosResponse, Error>({
    queryKey: ["videos", indexId],
    queryFn: ({ pageParam }) => fetchVideos(pageParam as number, indexId || ''),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page_info?.page < lastPage.page_info?.total_page) {
        return lastPage.page_info?.page + 1;
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
  console.log("🚀 > Home > allVideos=", allVideos)

  return (
    <PlayerProvider>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-2xl font-bold">
              {indexDetails?.index_name} ({indexDetails?.video_count} videos)
            </h1>
            <p className="text-sm text-gray-500 text-center">
              Total Duration: {indexDetails && formatDuration(indexDetails.total_duration)}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-center w-full">
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "all"
                    ? "bg-blue-500 font-bold text-black"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All Videos
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "curriculum"
                    ? "bg-blue-500 font-bold text-black"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => setActiveTab("curriculum")}
              >
                Curriculum
              </button>
            </div>

            {activeTab === "all" ? (
              <Videos
                videos={allVideos}
                summaryResults={summariesData ?? undefined}
              />
            ) : (
              <Curriculum
                videos={allVideos}
                summaryResults={summariesData ?? undefined}
              />
            )}

            <div ref={ref} className="w-full py-4 text-center">
              {isFetchingNextPage && (
                <LoadingSpinner />
              )}
            </div>
          </div>
        </main>
      </div>
    </PlayerProvider>
  );
}
