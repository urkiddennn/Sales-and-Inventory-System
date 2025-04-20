const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const login = async (credentials) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        console.log("Login request to:", `${API_URL}/auth/login`, "Credentials:", {
            email: credentials.email,
            password: credentials.password,
        });
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Login response status:", response.status);

        if (!response.ok) {
            const responseBody = await response.json().catch(() => ({}));
            console.error("Login error response:", responseBody);
            const errorMessage = responseBody?.error || `Login failed with status ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        const responseBody = await response.json();
        console.log("Login response body:", responseBody);
        if (!responseBody.token || !responseBody.user || !responseBody.user.role) {
            throw new Error("Invalid response: Missing token or user data");
        }

        return responseBody;
    } catch (error) {
        console.error("Login fetch error:", error);
        if (error.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
        }
        throw error;
    }
};

export const register = async (userData) => {
    console.log(`Attempting registration to ${API_URL}/auth/register`);
    try {
        console.log("Register request data:", Array.from(userData.entries()));
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            body: userData,
        });

        let responseBody;
        try {
            responseBody = await response.json();
            console.log("Register response:", JSON.stringify(responseBody, null, 2));
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            throw new Error(`Failed to parse server response: ${e.message}`);
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
        return responseBody;
    } catch (error) {
        console.error("Register fetch error:", error);
        throw error;
    }
};

export const getChats = async (token) => {
    console.log(`Fetching chats from ${API_URL}/chats`);
    try {
        const response = await fetch(`${API_URL}/chats`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        let responseBody;
        try {
            responseBody = await response.json();
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            throw new Error(`Failed to parse server response: ${e.message}`);
        }
        if (!response.ok) {
            console.error("Get chats error:", response.status, responseBody);
            throw new Error(responseBody?.error || "Failed to fetch chats");
        }
        console.log("Fetched chats:", responseBody);
        return responseBody;
    } catch (error) {
        console.error("Get chats fetch error:", error);
        throw error;
    }
};

export const sendMessage = async (token, messageData) => {
    console.log(`Sending message to ${API_URL}/chats`, messageData);
    try {
        const response = await fetch(`${API_URL}/chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(messageData),
        });
        let responseBody;
        try {
            responseBody = await response.json();
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            throw new Error(`Failed to parse server response: ${e.message}`);
        }
        if (!response.ok) {
            console.error("Send message error:", response.status, responseBody);
            throw new Error(responseBody?.error || "Failed to send message");
        }
        console.log("Sent message:", responseBody);
        return responseBody;
    } catch (error) {
        console.error("Send message fetch error:", error);
        throw error;
    }
};
