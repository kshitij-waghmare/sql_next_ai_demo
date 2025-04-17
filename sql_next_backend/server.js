const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database'); // Assuming you still want to use a separate database connection logic

// Import routes from both versions
const documentRoutes = require('./Routes/documentRoutes');
const sqlRoutes = require('./Routes/sqlRoutes');
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');
const roleRoutes = require('./Routes/roleRoutes');
const reportRoutes = require('./Routes/reportRoutes');
const topUsersRoutes = require('./Routes/topUsersRoutes');
const logRoutes = require('./Routes/logRoutes'); // This will serve POST /log/log-user-action

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Custom origin function
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST','PUT','DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
};

// Apply CORS middleware with the custom options
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'static')));

// Connect to MongoDB (using either your custom connection or mongoose directly)
connectDB(); // If using a custom database connection logic
// OR, you could use this if you're directly using mongoose for connection:
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/documentDB', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Routes from both versions
app.use('/documents', documentRoutes);
app.use('/sql', sqlRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/role', roleRoutes);
app.use('/report',reportRoutes);// Root route
app.use('/top-sql-automation-users', topUsersRoutes);
app.use('/log-user-action', logRoutes); // This will serve POST /log/log-user-action


app.get("/", (req, res) => {
  res.status(200).json({
    message: 'Backend Server of Mastek Enterprise AI is running.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
