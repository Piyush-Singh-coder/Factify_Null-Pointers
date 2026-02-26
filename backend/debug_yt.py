import yt_dlp
import os
import uuid
import tempfile
import re

def sanitize_filename(filename: str) -> str:
    sanitized = re.sub(r'[\\/*?:"<>|]', "", filename)
    sanitized = re.sub(r'\.+', '.', sanitized)
    sanitized = re.sub(r'\s+', ' ', sanitized)
    sanitized = sanitized.strip(' .')
    return sanitized[:200]

def test_download_audio_from_url(video_url: str) -> None:
    print(f"Testing URL: {video_url}")
    try:
        info_opts = {
            'quiet': True,
            'noplaylist': True,
            'simulate': True, # Don't download, just get info
        }
        with yt_dlp.YoutubeDL(info_opts) as ydl_info:
            info_dict = ydl_info.extract_info(video_url, download=False)
            title = info_dict.get('title', 'downloaded_audio')
            sanitized_title = sanitize_filename(title)
            
            unique_id = str(uuid.uuid4())[:8]
            # Use os.path.join to create a path in the temp directory
            with tempfile.TemporaryDirectory() as download_dir:
                final_filename_base = os.path.join(download_dir, f"{sanitized_title}_{unique_id}")
                final_filepath_mp3 = f"{final_filename_base}.mp3"
                print(f"Expected MP3 Path: {final_filepath_mp3}")

                ydl_opts = {
                    'format': 'bestaudio/best',
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': '192',
                    }],
                    'outtmpl': f'{final_filename_base}.%(ext)s', 
                    'noplaylist': True,
                    'quiet': True,
                    'noprogress': True,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    print("Starting yt-dlp download...")
                    error_code = ydl.download([video_url])
                    
                    if error_code == 0:
                        if os.path.exists(final_filepath_mp3):
                            print(f"SUCCESS! MP3 found at {final_filepath_mp3}")
                        else:
                            print(f"Error: yt-dlp reported success but file not found at {final_filepath_mp3}")
                            # List files in the download dir to see what was actually saved
                            files = os.listdir(download_dir)
                            print(f"Files in directory: {files}")
                    else:
                        print(f"Error: yt-dlp download failed with code {error_code}")
    except Exception as e:
        import traceback
        print(f"Error downloading audio: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_download_audio_from_url("https://youtu.be/AD7hlyQDWJM?si=mb3ie8e5uXK_p_Oo")
