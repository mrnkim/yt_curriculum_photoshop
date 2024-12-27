"use client";

import React, { Suspense, useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";
import clsx from "clsx";
import ReactPlayer from "react-player";
import LoadingSpinner from "./LoadingSpinner";
import { VideoProps, VideoDetails } from "@/types";
import { fetchVideoDetails } from "@/hooks/apiHooks";
import { usePlayer } from '@/contexts/PlayerContext';

const Video: React.FC<VideoProps> = ({ videoId, indexId, showTitle = true, videoDetails: providedVideoDetails, playing = false, onPlay, startTime, endTime }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const { currentPlayerId, setCurrentPlayerId } = usePlayer();

  useEffect(() => {
    if (playing && startTime !== undefined && playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
    }
  }, [playing, startTime]);

  const handleProgress = (state: { playedSeconds: number }) => {
    if (endTime && state.playedSeconds >= endTime) {
      if (playerRef.current) {
        playerRef.current.seekTo(startTime || 0);
        playerRef.current.getInternalPlayer().pause();
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const { data: videoDetails } = useQuery<VideoDetails, Error>({
    queryKey: ["videoDetails", videoId],
    queryFn: () => {
      if (!videoId) {
        throw new Error("Video ID is missing");
      }
      return fetchVideoDetails((videoId)!, indexId);
    },
    enabled: !!indexId && (!!videoId) && !providedVideoDetails,
  });

  const finalVideoDetails = providedVideoDetails || videoDetails;

  const handlePlay = () => {
    setCurrentPlayerId(videoId);
    onPlay?.();
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="flex flex-col w-full max-w-sm h-full">
          <div className="relative">
            <div
              className="w-full h-0 pb-[56.25%] relative overflow-hidden rounded cursor-pointer"
              onClick={handlePlay}
            >
              <ReactPlayer
                ref={playerRef}
                url={finalVideoDetails?.hls?.video_url}
                controls
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                light={false}
                playing={currentPlayerId === videoId}
                config={{
                  file: {
                    attributes: {
                      preload: "auto",
                    },
                  },
                }}
                progressInterval={100}
                onPlay={handlePlay}
                onProgress={handleProgress}
              />
              <div
                className={clsx(
                  "absolute",
                  "top-2",
                  "left-1/2",
                  "transform",
                  "-translate-x-1/2",
                  "z-10"
                )}
              >
                <div
                  className={clsx(
                    "bg-grey-1000/60",
                    "px-2",
                    "py-1",
                    "rounded-sm"
                  )}
                >
                  <p className={clsx("text-white", "text-xs", "font-light")}>
                    {formatDuration(finalVideoDetails?.metadata?.duration ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {showTitle && (
            <div className="mt-2">
              <p className={clsx("text-body3", "truncate", "text-grey-700")}>
                {finalVideoDetails?.metadata?.filename}
              </p>
            </div>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Video;
