export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please check your connection and try again.";
    }
    return "Cannot connect to the server. Please check your internet connection or try again later.";
  }

  const { status, data } = error.response;

  if (status === 429) {
    return data?.msg || "Today's AI limit has been reached. Please check again tomorrow.";
  }

  if (status === 401) {
    return data?.msg || "Your session has expired. Please login again.";
  }

  if (status === 403) {
    return data?.msg || "You do not have permission to perform this action.";
  }

  if (status === 503) {
    return data?.msg || "The AI service or server is temporarily unavailable. Please try again after some time.";
  }

  if (status >= 500) {
    return data?.msg || "The server had a problem processing this request. Please try again.";
  }

  return data?.msg || data?.message || fallback;
};

export const showErrorAlert = (error, fallback) => {
  alert(getErrorMessage(error, fallback));
};
