const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Secret key for JWT
const secretKey = 'your_secret_key_here';

// Generate token
function generateToken(userId) {
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
}

// Endpoint to generate token
app.post('/token', limiter, (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).send('User ID is required');
  }
  
  const token = generateToken(userId);
  res.send({ token });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
