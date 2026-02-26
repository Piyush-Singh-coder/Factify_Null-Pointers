from pydantic import BaseModel, HttpUrl

class VideoURLRequest(BaseModel):
    url: HttpUrl

req = VideoURLRequest(url="https://youtu.be/AD7hlyQDWJM?si=mb3ie8e5uXK_p_Oo")
video_url = str(req.url)
cleaned_url = video_url.split('?')[0].strip()

print(f"Original URL: {video_url}")
print(f"Cleaned URL: {cleaned_url}")

# Also test standard youtube URL
req2 = VideoURLRequest(url="https://www.youtube.com/watch?v=AD7hlyQDWJM")
video_url2 = str(req2.url)
cleaned_url2 = video_url2.split('?')[0].strip()
print(f"Test 2 Original URL: {video_url2}")
print(f"Test 2 Cleaned URL: {cleaned_url2}")
