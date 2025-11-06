const JsonDisplay = ({ data }) => {
  let content;
  let success = false;

  if (typeof data === "string") {
    content = data;
  } else if (data) {
    content = JSON.stringify(data, null, 2);
    success = data.success === true || data.status === "healthy";
  } else {
    return null;
  }

  return (
    <pre
      className={`mt-4 p-4 rounded-xl text-sm overflow-x-auto border ${
        success
          ? "bg-green-50 text-green-800 border-green-200"
          : "bg-base-200 text-base-content border-base-300"
      }`}
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {content}
    </pre>
  );
};

export default JsonDisplay;
