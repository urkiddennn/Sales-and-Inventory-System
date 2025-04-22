import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    address: {
        fullName: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String }
    },
    mobileNumber: { type: String, required: true },
    profileUrl: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    active: { type: Boolean, default: true },
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
            console.log('Pre-save: Hashing password for', this.email);
            this.password = await bcrypt.hash(this.password, 10);
        } else {
            console.log('Pre-save: Password already hashed for', this.email, 'skipping hash');
        }
    } else {
        console.log('Pre-save: Password not modified for', this.email, 'skipping hash');
    }
    next();
});

export const User = mongoose.model('User', userSchema);
