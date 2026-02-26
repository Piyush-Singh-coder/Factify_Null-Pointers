import { CheckCircle, XCircle, Link2 } from "lucide-react";

const CleanResultDisplay = ({ data }) => {
  if (!data) return null;

  const { success, url, verification, transcript } = data;

  return (
    <div className="w-full mt-6 space-y-4">

      {/* Status Card */}
      <div
        className={`card shadow-lg border ${
          success
            ? "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
        }`}
      >
        <div className="card-body">
          <div className="flex items-center gap-2 text-lg font-semibold">
            {success ? (
              <CheckCircle size={22} className="text-green-600" />
            ) : (
              <XCircle size={22} className="text-red-600" />
            )}
            {success ? <span className="text-green-600" >Verification Successful </span> :<span className="text-green-600" >Verification Failed </span>}
          </div>
        </div>
      </div>

      {/* URL */}
      <div className="card bg-base-100 border border-base-300 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">URL</h2>
          <div className="flex items-center gap-2 text-blue-600">
            <Link2 size={18} />
            <a href={url} target="_blank" className="underline break-all">
              {url}
            </a>
          </div>
        </div>
      </div>

      {/* Verification Section */}
      {verification && (
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body space-y-2">
            <h2 className="card-title text-lg">Verification Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-base-200 rounded-lg">
                <span className="font-semibold">Factual Claim:</span>{" "}
                {verification.isFactualClaim ? "Yes" : "No"}
              </div>

              <div className="p-3 bg-base-200 rounded-lg">
                <span className="font-semibold">Content Correctness:</span>{" "}
                {verification.isContentCorrect}
              </div>

              <div className="p-3 bg-base-200 rounded-lg col-span-1 md:col-span-2">
                <span className="font-semibold">Reason:</span>
                <p className="mt-1 text-sm ">{verification.reason}</p>
              </div>
              
              {verification.sources && verification.sources.length > 0 && (
                <div className="p-3 bg-base-200 rounded-lg col-span-1 md:col-span-2">
                  <span className="font-semibold block mb-2">Sources Needed for Verification (By Live Search API Context):</span>
                  <ul className="list-disc list-inside space-y-1">
                    {verification.sources.map((source, idx) => (
                      <li key={idx} className="text-sm">
                        <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="card bg-base-100 border border-base-300 shadow">
        <div className="card-body">
         <div className="p-3 bg-base-200 rounded-lg col-span-1 md:col-span-2">  
          <h2 className="card-title text-lg">Transcript</h2>
          <p className=" whitespace-pre-wrap leading-relaxed">
            {transcript}
          </p>
         </div>
        </div>
      </div>
    </div>
  );
};

export default CleanResultDisplay;
