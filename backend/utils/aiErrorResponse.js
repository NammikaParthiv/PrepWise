export const getAiErrorResponse = (error) => {
  // Try to extract an HTTP status code from different possible error object shapes
  const status = error?.status || error?.response?.status || error?.statusCode;

  // Collect possible error messages from different fields inside the error object
  // - error.message → generic error message
    //depending on api types of eroor reponses:
  // - error.response.data.error.message → detailed API error
  // - error.response.data.message → alternative field
  // - error.response.data.msg → another possible field

  // Then filter out empty values
  const rawMessage = [
    error?.message,
    error?.response?.data?.error?.message,
    error?.response?.data?.message,
    error?.response?.data?.msg,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // quota/rate limit errors
  if (
    status === 429 ||
    rawMessage.includes("quota") ||
    rawMessage.includes("rate limit") ||
    rawMessage.includes("resource_exhausted")
  ) {
    return {
      status: 429,
      body: {
        msg: "Today's AI limit has been reached. Please check again tomorrow.",
        code: "AI_LIMIT_REACHED",
      },
    };
  }

  // authentication/authorization errors
  if (
    status === 401 ||
    status === 403 ||
    rawMessage.includes("api key") ||
    rawMessage.includes("apikey") ||
    rawMessage.includes("permission_denied") ||
    rawMessage.includes("unauthorized")
  ) {
    return {
      status: 503,
      body: {
        msg: "AI service authentication failed. Please check the API key configuration.",
        code: "AI_AUTH_ERROR",
      },
    };
  }

  // service unavailable/timeout errors
  if (
    status === 503 ||
    rawMessage.includes("overloaded") ||
    rawMessage.includes("unavailable") ||
    rawMessage.includes("timeout")
  ) {
    return {
      status: 503,
      body: {
        msg: "AI service is temporarily unavailable. Please try again after some time.",
        code: "AI_SERVICE_UNAVAILABLE",
      },
    };
  }

  //server error
  return {
    status: 500,
    body: {
      msg: "AI request failed due to a server error. Please try again.",
      code: "AI_SERVER_ERROR",
    },
  };
};
