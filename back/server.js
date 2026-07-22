require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./Config/DB');
const userRoutes = require('./Routes/userRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server running on http://localhost:${PORT}`));