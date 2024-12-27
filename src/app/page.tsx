"use client";

import { useQuery } from "@tanstack/react-query";
import { Videos } from "@/components/Videos";
import { IndexDetails, VideosResponse } from "@/types";

const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

export default function Home() {

  const fetchIndexDetails = async (indexId: string) => {
    const response = await fetch(`/api/getIndex?indexId=${indexId}`);
    return response.json();
  };

  const { data: indexDetails } = useQuery<IndexDetails, Error>({
    queryKey: ["indexDetails", indexId],
    queryFn: () => {
      if (!indexId) {
        throw new Error("Video ID is missing");
      }
      return fetchIndexDetails(indexId);
    },
    enabled: !!indexId,
  });
  console.log("🚀 > Home > indexDetails=", indexDetails)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}hr ${minutes}min`;
  };

  const { data: videosResponse } = useQuery<VideosResponse, Error>({
    queryKey: ["videos", indexId],
    queryFn: async () => {
      if (!indexId) throw new Error("Index ID is missing");
      const response = await fetch(`/api/getVideos?indexId=${indexId}`);
      return response.json();
    },
    enabled: !!indexId,
  });
  console.log("🚀 > Home > videos=", videosResponse)

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Title and total duration */}
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-2xl font-bold">{indexDetails?.index_name} ({indexDetails?.video_count} videos)</h1>
          <p className="text-sm text-gray-500 text-center">Total Duration: {indexDetails && formatDuration(indexDetails.total_duration)}</p>
        </div>

        {/* Video list */}
        <div className="flex flex-col gap-2 items-center w-full">
          <h2 className="text-2xl font-bold">Videos</h2>
          {videosResponse && <Videos videos={videosResponse.data} />}
        </div>
      </main>

    </div>
  );
}
