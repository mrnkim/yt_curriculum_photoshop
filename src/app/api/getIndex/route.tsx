import { NextResponse } from "next/server";

const API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_BASE_URL = process.env.TWELVELABS_API_BASE_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const indexId = searchParams.get("indexId");

  if (!indexId) {
    return NextResponse.json(
      { error: "indexId is required" },
      { status: 400 }
    );
  }

   const url = `${TWELVELABS_API_BASE_URL}/indexes/${indexId}`;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": `${API_KEY}`,
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const index = await response.json();

    return NextResponse.json({
      index_name: index.index_name,
      video_count: index.video_count,
      total_duration: index.total_duration,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
