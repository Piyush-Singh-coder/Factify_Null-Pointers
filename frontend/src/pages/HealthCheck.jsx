import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../App";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import ErrorDisplay from "../components/ErrorDisplay";
import JsonDisplay from "../components/JsonDisplay";
import Button from "../components/Button";

const HealthCheck = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`API returned status ${response.status}`);
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err);
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="card bg-base-100 shadow-xl p-6 rounded-xl max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-primary">API Status</h2>
        <Button onClick={checkHealth} isLoading={isLoading} variant="secondary">
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {health && (
        <div className="space-y-4">
          <div
            className={`alert ${
              health.status === "healthy" ? "alert-success" : "alert-error"
            } flex items-center gap-3`}
          >
            {health.status === "healthy" ? <CheckCircle /> : <AlertCircle />}
            <span className="font-semibold text-lg capitalize">
              {health.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p>
              <strong>Provider:</strong> {health.ai_provider}
            </p>
            <p>
              <strong>OpenAI Client:</strong> {health.openai_client}
            </p>
            <p>
              <strong>Active RAG Sessions:</strong> {health.active_rag_sessions}
            </p>
          </div>
        </div>
      )}

      <ErrorDisplay error={error} />
      <JsonDisplay data={health} />
    </div>
  );
};

export default HealthCheck;
