import { useState } from "react";
import { API_BASE_URL } from "../App";
import Button from "../components/Button";
import ErrorDisplay from "../components/ErrorDisplay";
import Input from "../components/Input";
import CleanResultDisplay from "../components/CleanResultDisplay";

const TextVerification = () => {

  const [content, setContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentResult, setContentResult] = useState(null);
  const [contentError, setContentError] = useState(null);

  const handleContentSubmit = async () => {
    setIsLoadingContent(true);
    setContentError(null);
    setContentResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      setContentResult(data);
    } catch (err) {
      setContentError(err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* --- Content Verification --- */}
      <div className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body space-y-4">
          <h2 className="card-title text-primary">🧾 Content Verification</h2>

          <div>
            <label htmlFor="text-content" className="label">
              <span className="label-text font-medium">Text / Fact to Verify</span>
            </label>
            <Input
              id="text-content"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the fact or text to verify..."
            />
          </div>

          <Button
            onClick={handleContentSubmit}
            isLoading={isLoadingContent}
            disabled={!content}
          >
            Verify Content
          </Button>

          <ErrorDisplay error={contentError} />
          {contentResult && <CleanResultDisplay data={contentResult} />}
        </div>
      </div>
    </div>
  );
};

export default TextVerification;
