import { User } from '../model/User.js';
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';

export const getUser = async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    } catch (error) {
        console.error('Error in getUser:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.jwtPayload.id;
        const {
            name,
            email,
            password,
            'address[fullName]': fullName,
            'address[street]': street,
            'address[city]': city,
            'address[state]': state,
            'address[zipCode]': zipCode,
            mobileNumber,
        } = req.body;

        if (id !== userId && req.jwtPayload.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to edit this user' });
        }

        const updates = {
            name,
            email: email ? email.toLowerCase() : undefined,
            address: { fullName, street, city, state, zipCode },
            mobileNumber,
        };

        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        let profileUrl;
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'user_profiles' });
            profileUrl = uploadResult.secure_url;
            updates.profileUrl = profileUrl;
        }

        const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Error in editUser:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.jwtPayload.id;

        if (id !== userId && req.jwtPayload.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete this user' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const getAdminUser = async (req, res) => {
    try {
        const user = await User.findOne({ role: 'admin' }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'No admin user found' });
        }
        return res.json(user);
    } catch (error) {
        console.error('Error in getAdminUser:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    } catch (error) {
        console.error('Error in getUserById:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
