import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCanonicalYouTubeWatchUrl } from "@/lib/youtube"

const DAILY_YOUTUBE_SEARCH_LIMIT = 50

type YouTubeSearchApiItem = {
  id?: {
    videoId?: string
  }
  snippet?: {
    title?: string
    channelTitle?: string
    publishedAt?: string
    thumbnails?: {
      default?: {
        url?: string
      }
      medium?: {
        url?: string
      }
      high?: {
        url?: string
      }
    }
  }
}

type YouTubeSearchApiResponse = {
  items?: YouTubeSearchApiItem[]
  error?: {
    message?: string
  }
}

type QuotaResult = {
  allowed: boolean
  search_count: number
  daily_limit: number
}

export type YouTubeSearchResult = {
  videoId: string
  title: string
  channelTitle: string
  publishedAt: string
  thumbnailUrl: string | null
  url: string
}

function normaliseResult(item: YouTubeSearchApiItem): YouTubeSearchResult | null {
  const videoId = item.id?.videoId

  if (!videoId) {
    return null
  }

  return {
    videoId,
    title: item.snippet?.title ?? "Untitled YouTube video",
    channelTitle: item.snippet?.channelTitle ?? "Unknown channel",
    publishedAt: item.snippet?.publishedAt ?? "",
    thumbnailUrl:
      item.snippet?.thumbnails?.medium?.url ??
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.default?.url ??
      null,
    url: getCanonicalYouTubeWatchUrl(videoId),
  }
}

function getYouTubeApiKey() {
  return process.env.YOUTUBE_DATA_API_KEY?.trim() ?? ""
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function getUtcDateOnly() {
  return new Date().toISOString().slice(0, 10)
}

async function consumeSearchQuota() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      allowed: false,
      status: 401,
      message: "You must be logged in to search YouTube.",
    }
  }

  const { data, error } = await supabase
    .rpc("try_consume_youtube_search_quota", {
      p_usage_date: getUtcDateOnly(),
      p_daily_limit: DAILY_YOUTUBE_SEARCH_LIMIT,
    })
    .single()

  if (error) {
    console.error("YouTube search quota check failed:", error)

    return {
      allowed: false,
      status: 500,
      message: "Could not check YouTube search quota.",
    }
  }

  const quota = data as QuotaResult

  if (!quota.allowed) {
    return {
      allowed: false,
      status: 429,
      message: `Daily YouTube search limit reached for this app. Try again tomorrow. Limit: ${quota.daily_limit} searches per day.`,
    }
  }

  return {
    allowed: true,
    status: 200,
    message: "",
  }
}

export async function GET(request: Request) {
  const apiKey = getYouTubeApiKey()

  if (!apiKey) {
    return jsonError(
      "YouTube search is not configured. Add YOUTUBE_DATA_API_KEY to .env.local, then restart the dev server.",
      500
    )
  }

  const requestUrl = new URL(request.url)
  const query = requestUrl.searchParams.get("q")?.trim() ?? ""

  if (query.length < 2) {
    return jsonError("Enter at least two characters to search.", 400)
  }

  const quotaResult = await consumeSearchQuota()

  if (!quotaResult.allowed) {
    return jsonError(quotaResult.message, quotaResult.status)
  }

  const youtubeUrl = new URL("https://www.googleapis.com/youtube/v3/search")

  youtubeUrl.searchParams.set("part", "snippet")
  youtubeUrl.searchParams.set("q", query)
  youtubeUrl.searchParams.set("type", "video")
  youtubeUrl.searchParams.set("maxResults", "8")
  youtubeUrl.searchParams.set("videoEmbeddable", "true")
  youtubeUrl.searchParams.set("safeSearch", "moderate")
  youtubeUrl.searchParams.set("key", apiKey)

  let response: Response
  let payload: YouTubeSearchApiResponse

  try {
    response = await fetch(youtubeUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60 * 60,
      },
    })

    payload = (await response.json()) as YouTubeSearchApiResponse
  } catch {
    return jsonError(
      "YouTube search could not be reached. Check your connection and try again.",
      502
    )
  }

  if (!response.ok) {
    return jsonError(
      payload.error?.message ??
        "YouTube search failed. Check the API key, quota, and YouTube Data API settings.",
      response.status
    )
  }

  const results = (payload.items ?? [])
    .map(normaliseResult)
    .filter((result): result is YouTubeSearchResult => Boolean(result))

  return NextResponse.json({ results })
}