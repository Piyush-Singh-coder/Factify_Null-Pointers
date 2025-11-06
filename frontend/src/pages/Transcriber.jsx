import { useState } from "react";
import { API_BASE_URL } from "../App";
import Button from "../components/Button";
import FileDropzone from "../components/FileDropzone";
import ErrorDisplay from "../components/ErrorDisplay";

const Transcriber = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (files) => {
    if (files.length > 0) {
      setAudioFile(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("audio_file", audioFile);

    try {
      const response = await fetch(`${API_BASE_URL}/transcribe-audio`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw data;

      setResult(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body space-y-4">
        <h2 className="card-title text-primary">🎧 Transcribe Audio</h2>

        <FileDropzone onFilesChange={handleFileChange} accept="audio/*" />

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!audioFile}
          className="w-full sm:w-auto"
        >
          Transcribe
        </Button>

        <ErrorDisplay error={error} />

        {result && (
          <div className="bg-base-200 p-4 rounded-xl border border-base-300">
            <h3 className="font-semibold text-base-content">Transcript:</h3>
            <p className="mt-2 whitespace-pre-wrap">{result.transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcriber;
