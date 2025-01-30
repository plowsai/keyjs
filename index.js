const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tokenServer', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    tokens: [String] // Store active tokens
});

const User = mongoose.model('User', userSchema);

// Secret key for JWT
const secretKey = 'your-secret-key';

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    user.tokens.push(token);
    await user.save();
    res.json({ token });
});

// Token revocation endpoint
app.post('/revoke-token', async (req, res) => {
    const { username, token } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).send('User not found');
    }
    user.tokens = user.tokens.filter(t => t !== token);
    await user.save();
    res.send('Token revoked');
});

// Endpoint to verify a token
app.get('/verify-token', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Token is required');
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findOne({ username: decoded.username, tokens: token });
        if (!user) {
            return res.status(401).send('Invalid token');
        }
        res.json({ data: decoded });
    } catch (err) {
        res.status(401).send('Invalid token');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
