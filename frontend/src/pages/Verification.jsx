import { useState } from "react";
import { API_BASE_URL } from "../App";
import Button from "../components/Button";
import ErrorDisplay from "../components/ErrorDisplay";
import Input from "../components/Input";
import CleanResultDisplay from "../components/CleanResultDisplay";

const Verification = () => {
  const [url, setUrl] = useState("");
  const [keepAudio] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [videoError, setVideoError] = useState(null);

  const handleVideoSubmit = async (endpoint) => {
    setIsLoadingVideo(true);
    setVideoError(null);
    setVideoResult(null);

    try {
      const body =
        endpoint === "full-pipeline"
          ? JSON.stringify({ url, keep_audio: keepAudio })
          : JSON.stringify({ url });

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await response.json();
      if (!response.ok) throw data;

      setVideoResult(data);
    } catch (err) {
      setVideoError(err);
    } finally {
      setIsLoadingVideo(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* --- Video Verification --- */}
      <div className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body space-y-4">
          <h2 className="card-title text-primary">🎥 Video Verification</h2>

          <div>
            <label htmlFor="video-url" className="label">
              <span className="label-text font-medium">
                Video URL (YouTube, etc.)
              </span>
            </label>
            <Input
              id="video-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleVideoSubmit("verify-video")}
              isLoading={isLoadingVideo}
              disabled={!url}
            >
               Verify
            </Button>
            
          </div>

          <ErrorDisplay error={videoError} />
          {videoResult && <CleanResultDisplay data={videoResult} />}
        </div>
      </div>

    </div>
  );
};

export default Verification;
