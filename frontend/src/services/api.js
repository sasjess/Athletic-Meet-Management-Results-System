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

  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };


  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }


  console.log("REQUEST URL:", url);


  return fetch(url, {
    ...options,
    headers,
  });

};

// export const authFetch = async (url, options = {}) => {

// const token = getAuthToken();

//   console.log("AUTH TOKEN:", token);
//   console.log("REQUEST URL:", url);


//   const headers = {
//     ...getAuthHeaders(options.includeJson !== false),
//     ...(options.headers || {}),
//   };

//   return fetch(url, {
//     ...options,
//     headers,
//   });
// };
