import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Upload, message, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [mobileNumber, setMobileNumber] = useState('');
    const [fileList, setFileList] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { signup, isAuthenticated } = useAuth();

    console.log("Rendering SignupPage", { isAuthenticated, path: window.location.pathname });

    // Redirect authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            console.log("Redirecting authenticated user from /signup to /");
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log("Submitting signup form");

        // Validate inputs
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            console.log("Validation error: Passwords do not match");
            return;
        }
        if (!address.fullName || !address.street || !address.city || !address.state || !address.zipCode) {
            setError('All address fields are required');
            console.log("Validation error: Incomplete address");
            return;
        }
        if (!/^[0-9]{5}$/.test(address.zipCode)) {
            setError('Please enter a valid 5-digit zip code');
            console.log("Validation error: Invalid zip code");
            return;
        }
        if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            console.log("Validation error: Invalid mobile number");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email.toLowerCase());
            formData.append('password', password);
            formData.append('address[fullName]', address.fullName);
            formData.append('address[street]', address.street);
            formData.append('address[city]', address.city);
            formData.append('address[state]', address.state);
            formData.append('address[zipCode]', address.zipCode);
            formData.append('mobileNumber', mobileNumber);
            if (fileList.length > 0 && fileList[0].originFileObj) {
                console.log('Sending profilePicture:', fileList[0].originFileObj);
                formData.append('profilePicture', fileList[0].originFileObj);
            } else {
                console.log('No profilePicture selected');
            }
            console.log('FormData contents:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value instanceof File ? `[File: ${value.name}]` : value}`);
            }
            await signup(formData);
            console.log("Signup successful, navigating to /");
            message.success("Registration successful!");
            navigate('/');
        } catch (err) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            console.error("Signup error:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
            console.log('Removed file from fileList');
        },
        beforeUpload: (file) => {
            console.log('Selected file:', file);
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
                return false;
            }
            setFileList([file]);
            console.log('Updated fileList:', [file]);
            return false;
        },
        onChange: (info) => {
            console.log('Upload onChange:', info);
            setFileList(info.fileList);
        },
        fileList,
        accept: 'image/*',
    };

    return (
        <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Create an Account</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Column 1 */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label htmlFor="address-fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name for Address
                    </label>
                    <input
                        id="address-fullName"
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="address-street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                    </label>
                    <input
                        id="address-street"
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="123 Main St"
                    />
                </div>
                <div>
                    <label htmlFor="address-city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                    </label>
                    <input
                        id="address-city"
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Anytown"
                    />
                </div>
                <div>
                    <label htmlFor="address-state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                    </label>
                    <input
                        id="address-state"
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="CA"
                    />
                </div>
                <div>
                    <label htmlFor="address-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                    </label>
                    <input
                        id="address-zipCode"
                        type="text"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="12345"
                    />
                </div>
                <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                    </label>
                    <input
                        id="mobileNumber"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1234567890"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture (Optional)
                    </label>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} disabled={isLoading}>
                            Upload Profile Picture
                        </Button>
                    </Upload>
                </div>
                <div className="col-span-2 flex items-center">
                    <input
                        id="terms"
                        type="checkbox"
                        required
                        disabled={isLoading}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to the{' '}
                        <Link to="/privacy-policy" className="font-medium text-green-600 hover:text-green-500">
                            Terms of Service and Privacy Policy
                        </Link>
                    </label>
                </div>
                <div className="col-span-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
