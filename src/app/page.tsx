"use client";

import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const indexId = process.env.NEXT_PUBLIC_INDEX_ID;

  interface IndexDetails {
    index_name: string;
    video_count: number;
    total_duration: number;
  }

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

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold"></h1>
      </main>

    </div>
  );
}
