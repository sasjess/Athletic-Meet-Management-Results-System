export const getAuthToken = () => localStorage.getItem("token");

export const getAuthHeaders = (includeJson = true) => {
  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const authFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(options.includeJson !== false),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
