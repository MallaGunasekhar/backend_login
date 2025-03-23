
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

// const corsOptions = {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
//   };
  app.use(cors({
    origin: ['https://googlemapass.vercel.app'] // Your frontend URL
  }));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// SINGLE SOURCE OF TRUTH FOR USERS
const users = [
  { id: 1, username: 'user', password: 'pass' },
  { id: 2, username: 'admin', password: 'admin123' } // Add new users here
];

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Remove the duplicate users declaration here
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// ... rest of the code remains unchanged

// Protected APIs Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'User not logged in' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Dashboard API
// In server.js
app.get('/api/dashboard', authenticate, (req, res) => {
    try {
      const cards = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        title: `Card ${i + 1}`,
        description: `Sample card ${i + 1}` // Add more data if needed
      }));
      
      // Explicit response format
      res.status(200).json({
        success: true,
        cards: cards
      });
      
    } catch (error) {
      console.error('Dashboard API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });
// Map View API
app.get('/api/map', authenticate, (req, res) => {
  res.json({
    center: [20.5937, 78.9629], // India coordinates
    zoom: 4
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));