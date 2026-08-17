import re
from yt_dlp import YoutubeDL
from youtube_transcript_api import YouTubeTranscriptApi

youtube_transcript_api = YouTubeTranscriptApi()


def extract_video_id(url_or_id: str) -> str:
    """Extracts the 11-character Youtube video ID using regex"""

    pattern = r'(?:v=|\/)([0-9A-Za-z_-]{11})'
    match = re.search(pattern, url_or_id)
    return match.group(1) if match else url_or_id


def fetch_youtube_transcript(video_url: str) -> str:
    """
        Extracts the clean text transcript of a YouTube video.
        Supports English, Hindi, and auto-generated variants natively.
    """
    try:
        video_id = extract_video_id(video_url)
        transcript_list = youtube_transcript_api.fetch(video_id, languages=['en', 'hi'])
        clean_transcript = " ".join([segment.text for segment in transcript_list])
        return re.sub(r'\s+', ' ', clean_transcript).strip()
    except Exception as e:
        print(f"⚠️ Failed to parse transcript for {video_url}. Error: {str(e)}")
        return ""


def discover_viral_videos(niche: str, preferred_language: str, max_results: int = 5) -> list:
    """
        Uses yt-dlp to search YouTube for recent high-view shorts/videos in a specific niche.
        Returns metadata tracking metrics.
    """
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'skip_download': True,
        'defaultSearch': 'ytsearch',
        'http_headers': {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        }
    }

    search_query = f"ytsearch2:{niche} short viral {preferred_language}"

    print(f"[SCRAPER] Querying YouTube search index for: '{search_query}'...")

    video_metadata_list = []

    with YoutubeDL(ydl_opts) as ydl:
        try:
            search_results = ydl.extract_info(f"{search_query} {max_results}", download=False)
            entries = search_results.get("entries", [])

            for entry in entries:
                if not entry:
                    continue
                video_metadata_list.append({
                    "id": entry.get("id"),
                    "title": entry.get("title"),
                    "url": "https://www.youtube.com/watch?v={id}".format(id=entry.get("id")),
                })
        except Exception as e:
            print(f"Youtube dlp search lookup failed : {str(e)}")

    return video_metadata_list
