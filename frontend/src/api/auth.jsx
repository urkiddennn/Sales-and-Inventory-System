const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const login = async (credentials) => {
    console.log(`Attempting login to ${API_URL}/auth/login for:`, credentials.email);
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
    });

    let responseBody;
    try {
        responseBody = await response.json();
        console.log("Login response:", responseBody);
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        responseBody = { error: `Request failed with status ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
        console.error("Login API Error:", response.status, responseBody);
        const errorMessage = responseBody?.error || `Login failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.body = responseBody;
        throw error;
    }

    console.log("Login API Success:", responseBody);
    return responseBody; // { token, user: { id, email, name, role } }
};
export const register = async (userData) => {
    console.log(`Attempting registration to ${API_URL}/auth/register`); // Debug
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: userData, // Send FormData directly
    });

    let responseBody;
    try {
        responseBody = await response.json();
        console.log("Register response:", responseBody);
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        responseBody = { error: `Request failed with status ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
        console.error("Registration API Error:", response.status, responseBody);
        const errorMessage = responseBody?.error || `Registration failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.body = responseBody;
        throw error;
    }

    console.log("Registration API Success:", responseBody);
    return responseBody; // { token, user: { id, email, name, address, mobileNumber, profileUrl, role } }
};
