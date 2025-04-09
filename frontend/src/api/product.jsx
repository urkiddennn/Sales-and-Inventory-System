const API_URL = process.env.REACT_APP_API_URL;

export const getProducts = async (token) => {
    const response = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const createProduct = async (token, productData) => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
};

export const updateProduct = async (token, id, updates) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
};

export const deleteProduct = async (token, id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
};

export const getSaleProducts = async (token) => {
    const response = await fetch(`${API_URL}/products/sale`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch sale products');
    return response.json();
};

export const updateSaleStatus = async (token, id, saleData) => {
    const response = await fetch(`${API_URL}/products/${id}/sale`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
    });
    if (!response.ok) throw new Error('Failed to update sale status');
    return response.json();
};
