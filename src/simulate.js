const axios = require("axios");

// Function to send GPS data
async function sendGpsData(latitude, longitude) {
    try {
        const response = await axios.post(
            "http://localhost:3000/api/location",
            {
                latitude,
                longitude,
            }
        );
        console.log("Response:", response.data);
    } catch (error) {
        console.error(
            "Error:",
            error.response ? error.response.data : error.message
        );
    }
}

// Simulate multiple GPS data points with a delay
async function simulateGpsData() {
    const locations = [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.775, longitude: -122.4195 },
        { latitude: 37.7751, longitude: -122.4196 },
        { latitude: 37.7752, longitude: -122.4197 },
    ];

    for (let i = 0; i < locations.length; i++) {
        const { latitude, longitude } = locations[i];
        await sendGpsData(latitude, longitude);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
    }
}

simulateGpsData();
