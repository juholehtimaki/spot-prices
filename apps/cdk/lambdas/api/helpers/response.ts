const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const createResponse = (statusCode: number, body?: unknown) => ({
  headers,
  statusCode,
  body: JSON.stringify(body),
});
