import { AlertCircle } from "lucide-react";

const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  return (
    <div className="alert alert-error mt-4 rounded-xl flex items-start gap-3 shadow-md">
      <AlertCircle className="w-6 h-6 shrink-0" />
      <div>
        <h3 className="font-semibold">Error</h3>
        <p className="text-sm">
          {error.detail || error.message || "An unknown error occurred."}
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay;
