export const BASE_URL = "https://se-register-api.en.tripleten-services.com/v1";

const request = async (url, body) => {
  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = new Error(`Error: ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return await res.json();
};

export const register = ({ password, email }) => {
  return request("/signup", { password, email });
};

export const authorize = ({ password, email }) => {
  return request("/signin", { password, email });
};

export const getUserData = async (token) => {
  const res = await fetch(BASE_URL + "/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = new Error(`Error: ${res.status}`);
    error.status = res.status;
    console.error(error);
    throw error;
  }

  return await res.json();
};
