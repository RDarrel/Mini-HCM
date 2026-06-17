const answerSanitizer = (answer) => {
  if (answer?.length === 0 || typeof answer !== "string") return false;
  return answer?.toLowerCase()?.replace(/\s+/g, "");
};

export default answerSanitizer;
