const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

//Database Connection
mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("MongoDB connected");
}).catch((err)=>{
        console.log("MongoDB connection failed:", err.message);
});

const corsOptions = {
  origin: "http://localhost:5173",   // frontend origin
  credentials: true,                 // allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

//Routes import
const userRoute = require('./routes/user');
const farmerRoute = require('./routes/farmer');
const smallScaleIndustryRoute = require('./routes/smallScaleIndustry');
const loginRoute = require('./routes/login');

//api calls
app.use('/api/farmer', farmerRoute);
app.use('/api/small-scale-industry', smallScaleIndustryRoute);
app.use('/api/user', userRoute);
app.use('/api/login', loginRoute);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
});


// Expose io to controllers via app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('buy', (data) => {
        console.log('Buy event received:', data);
        // Here you would process the buy request (create order, charge, etc.)
        socket.emit('purchaseConfirmed', { success: true, data });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

server.listen(process.env.PORT || 8000, ()=>{
        console.log("Backend server (with sockets) is running");
});
