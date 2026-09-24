const bcrypt = require('bcrypt');
const { User, toApi } = require('../models');
const generateToken = require('../utils/generateToken');

function publicUser(user) {
  const result = toApi(user);
  delete result.password;
  return result;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'customer' });
    const safeUser = publicUser(user);
    res.status(201).json({ user: safeUser, token: generateToken(safeUser) });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' });
    const safeUser = publicUser(user);
    res.json({ user: safeUser, token: generateToken(safeUser) });
  } catch (err) { next(err); }
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(publicUser(user));
  } catch (err) { next(err); }
}

module.exports = { register, login, getMe };
