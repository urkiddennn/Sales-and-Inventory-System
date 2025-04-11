import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Profile = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    // Fetch user profile data when component mounts
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const userData = await response.json();
                setUser({ ...userData, createdAt: userData.createdAt || new Date() });
                setFormData({ name: userData.name || '', email: userData.email || '' });
            } catch (error) {
                console.error('Error fetching profile:', error);
                alert('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const userId = user._id;
            const response = await fetch(`${import.meta.env.REACT_APP_API_UR}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: formData.name, email: formData.email }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }
            const updatedUser = await response.json();
            setUser(updatedUser);
            setEditMode(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (passwordData.password !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const userId = user._id;
            const response = await fetch(`${import.meta.env.REACT_APP_API_UR}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: passwordData.password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to change password');
            }
            setPasswordData({ password: '', confirmPassword: '' });
            setPasswordMode(false);
            alert('Password changed successfully!');
        } catch (error) {
            console.error('Error changing password:', error);
            setError(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (passwordMode) {
            setPasswordData((prev) => ({ ...prev, [name]: value }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-600 text-lg font-medium">Unable to load profile data.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 w-full p-3">
            <div className="w-full md:w-1/2 mx-auto bg-white  border border-gray-500 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-green-500 text-white px-8 py-6">
                    <h1 className="text-3xl font-bold">Your Profile</h1>
                    <p className="mt-2 text-sm">Manage your account details and settings here.</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Profile Picture and Details */}
                    <div className="flex items-center space-x-8">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            {!editMode && !passwordMode ? (
                                <>
                                    <h2 className="text-2xl font-semibold text-gray-800">{user.name || 'User'}</h2>
                                    <p className="text-gray-600">{user.email || 'No email provided'}</p>
                                    <div className="mt-4 space-y-2">
                                        <div>
                                            <span className="text-gray-700 font-medium">Joined:</span>
                                            <span className="text-gray-600 ml-2">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Role:</span>
                                            <span className="text-gray-600 ml-2">{user.role || 'user'}</span>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Actions */}
                    {!editMode && !passwordMode && (
                        <div className="flex gap-3 flex-col md:flex-row">
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-6 py-2 bg-green-600 text-white  hover:bg-green-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={() => setPasswordMode(true)}
                                className="px-6 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
                            >
                                Change Password
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    {/* Edit Profile Form */}
                    {editMode && (
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Change Password Form */}
                    {passwordMode && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={passwordData.password}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPasswordMode(false)}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
