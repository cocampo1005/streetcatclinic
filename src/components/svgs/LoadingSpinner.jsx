import React from "react";

const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const errorRedColor = "#F04C4D";

const LoadingSpinner = ({ size = "medium", color = errorRedColor }) => {
  let spinnerSize = "20px";

  if (size === "small") {
    spinnerSize = "16px";
  } else if (size === "large") {
    spinnerSize = "24px";
  }

  return (
    <>
      <style>{spinnerStyle}</style>
      <div
        style={{
          border: "3px solid #f3f3f3",
          borderTop: `3px solid ${color}`,
          borderRadius: "50%",
          width: spinnerSize,
          height: spinnerSize,
          animation: "spin 1s linear infinite",
          display: "inline-block",
        }}
      ></div>
    </>
  );
};

export default LoadingSpinner;
