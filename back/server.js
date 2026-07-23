require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./Config/DB');
const userRoutes = require('./Routes/userRoutes');
const productRoutes = require('./Routes/productRoutes');
const orderRoutes = require('./Routes/orderRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server running on http://localhost:${PORT}`));