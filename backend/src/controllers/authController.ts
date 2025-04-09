import { Context } from 'hono';
import { User } from '../model/User';
import jwt from "jsonwebtoken"
import { env } from '../config/env';
import bcrypt from 'bcryptjs';

export const register = async (c: Context) => {
  const { email, password, name } = await c.req.json();
  const user = new User({ email, password, name });
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET);
  return c.json({ token, user: { id: user._id, email, name, role: user.role } });
};

export const login = async (c: Context) => {
  const { email, password } = await c.req.json();
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET);
  return c.json({ token, user: { id: user._id, email, name: user.name, role: user.role } });
};
