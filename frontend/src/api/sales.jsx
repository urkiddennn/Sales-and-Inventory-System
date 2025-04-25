const API_URL = '/api';


export const createSale = async (token, saleData) => {
    const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
    });
    if (!response.ok) throw new Error('Failed to create sale');

    return response.json();
};

export const getSales = async (token) => {
    const response = await fetch(`${API_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch sales');

    return response.json();
};
