import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  appearance?: "primary" | "default" | "danger" | "secondary" | "subtle";
  rounded?: boolean;
  loading?: boolean;
  disableFocusStyle?: boolean;
}

export interface Video {
  _id: string;
  created_at: string;
  indexed_at: string;
  system_metadata: {
    audio_channel: number;
    audio_length_ns: number;
    audio_sample_rate: number;
    audio_stream_id: string;
    audio_stream_idx: number;
    duration: number;
    engine_ids: string[];
    filename: string;
    fps: number;
    height: number;
    size: number;
    video_length_ns: number;
    video_stream_id: string;
    video_stream_idx: number;
    video_title: string;
    width: number;
  };
}

export interface VideoProps {
  videoId: string;
  indexId: string;
  playing: boolean;
  onPlay: () => void;
  onSelect?: () => void;
  onPause?: () => void;
  showTitle?: boolean;
  videoDetails?: VideoDetails;
  startTime?: number;
  endTime?: number;
}

export interface VideoDetails {
  hls: {
    video_url: string;
    thumbnail_urls: string[];
    status: string;
    updated_at: string;
  };
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  duration: number;
  engine_ids: string[];
  filename: string;
  fps: number;
  height: number;
  size: number;
  video_title: string;
  width: number;
}

export interface IndexDetails {
  index_name: string;
  video_count: number;
  total_duration: number;
}

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size;
  color?: Color;
}

export type Size = 'sm' | 'md' | 'lg';
export type Color = 'default' | 'primary';

export interface PageInfo {
  limit_per_page: number;
  page: number;
  total_duration: number;
  total_page: number;
  total_results: number;
}

export interface VideosResponse {
  data: Video[];
  page_info: PageInfo;
}