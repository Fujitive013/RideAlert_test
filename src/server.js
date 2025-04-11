const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/ridealert");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

// Define a schema for GPS data
const gpsSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now },
});
const GpsData = mongoose.model("GpsData", gpsSchema);

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

// Initialize WebSocket server
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
    },
});

// Middleware to parse JSON
app.use(express.json());

// API endpoint to receive GPS data from IoT device
app.post("/api/location", async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res
            .status(400)
            .json({ error: "Latitude and longitude are required" });
    }

    try {
        // Save GPS data to MongoDB
        const gpsData = new GpsData({ latitude, longitude });
        await gpsData.save();

        // Emit the location to all connected WebSocket clients
        io.emit("locationUpdate", { latitude, longitude });

        res.status(201).json({ message: "Location saved and broadcasted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save location" });
    }
});

// Serve a basic route
app.get("/", (req, res) => {
    res.send("RideAlert backend is running");
});

// WebSocket connection handler
io.on("connection", (socket) => {
    console.log("A client connected");

    // Handle client disconnection
    socket.on("disconnect", () => {
        console.log("A client disconnected");
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
