/************************************************************************
 * WEB322 - Assignment 01
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Fred da Silveira Pitanga Filho
 * Student ID: 154169213
 * Date: feb 4, 2026
 *
 ***********************************************************************/

// Import required modules
const express = require('express');
const path = require('path');
const { loadSightings } = require('./utils/dataLoader');

// Initialize Express app
const app = express();

// 1. Middleware to serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. Root route - serve the about page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Helper function to handle errors in API routes
const handleRouteError = (res, error, routeName) => {
    console.error(`Error in ${routeName}:`, error);
    res.status(500).json({
        error: error.message || 'Internal server error',
        route: routeName,
        timestamp: new Date().toISOString()
    });
};

// 3. API Endpoints

// GET /api/sightings - Return ALL sighting records
app.get('/api/sightings', async (req, res) => {
    try {
        const sightings = await loadSightings();
        res.json(sightings);
    } catch (error) {
        handleRouteError(res, error, '/api/sightings');
    }
});

// GET /api/sightings/verified - Filter and return only VERIFIED sightings
app.get('/api/sightings/verified', async (req, res) => {
    try {
        const sightings = await loadSightings();
        const verifiedSightings = sightings.filter(sighting => sighting.verified === true);
        res.json(verifiedSightings);
    } catch (error) {
        handleRouteError(res, error, '/api/sightings/verified');
    }
});

// GET /api/sightings/species-list - Extract unique species names
app.get('/api/sightings/species-list', async (req, res) => {
    try {
        const sightings = await loadSightings();
        const allSpecies = sightings.map(sighting => sighting.species);
        const uniqueSpecies = [...new Set(allSpecies)];
        res.json(uniqueSpecies);
    } catch (error) {
        handleRouteError(res, error, '/api/sightings/species-list');
    }
});

// GET /api/sightings/habitat/forest - Forest habitat sightings with count
app.get('/api/sightings/habitat/forest', async (req, res) => {
    try {
        const sightings = await loadSightings();
        const forestSightings = sightings.filter(sighting => 
            sighting.habitat.toLowerCase() === "forest"
        );
        const response = {
            habitat: "forest",
            sightings: forestSightings,
            count: forestSightings.length
        };
        res.json(response);
    } catch (error) {
        handleRouteError(res, error, '/api/sightings/habitat/forest');
    }
});

// GET /api/sightings/search/eagle - Find first eagle sighting
app.get('/api/sightings/search/eagle', async (req, res) => {
    try {
        const sightings = await loadSightings();
        const eagleSighting = sightings.find(sighting => 
            sighting.species.toLowerCase().includes("eagle")
        );
        res.json(eagleSighting || { message: "No eagle sighting found" });
    } catch (error) {
        handleRouteError(res, error, '/api/sightings/search/eagle');
    }
});

// GET /api/sightings/find-index/moose - Find index of moose sighting
app.get('/api/sightings/find-index/moose', async (req, res) => {
    try {
        const sightings = await loadSightings();
        const mooseIndex = sightings.findIndex(sighting => 
            sighting.species === "Moose"
        );
        const response = {
            index: mooseIndex,
            sighting: mooseIndex !== -1 ? sightings[mooseIndex] : null,
            found: mooseIndex !== -1
        };
        res.json(response);
    } catch (error) {
        handleRouteError(res, error, '/api/sightings/find-index/moose');
    }
});

// GET /api/sightings/recent - Get 3 most recent sightings
app.get('/api/sightings/recent', async (req, res) => {
    try {
        const sightings = await loadSightings();
        const sortedSightings = [...sightings].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        const recentSightings = sortedSightings.slice(0, 3);
        const formattedSightings = recentSightings.map(sighting => ({
            species: sighting.species,
            date: sighting.date,
            location: sighting.location,
            verified: sighting.verified,
            notes: sighting.notes ? sighting.notes.substring(0, 100) + '...' : ''
        }));
        res.json(formattedSightings);
    } catch (error) {
        handleRouteError(res, error, '/api/sightings/recent');
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist on this server`,
        availableRoutes: [
            'GET /',
            'GET /api/sightings',
            'GET /api/sightings/verified',
            'GET /api/sightings/species-list',
            'GET /api/sightings/habitat/forest',
            'GET /api/sightings/search/eagle',
            'GET /api/sightings/find-index/moose',
            'GET /api/sightings/recent'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Export for Vercel (serverless function)
module.exports = app;

// For local development only
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📄 About page: http://localhost:${PORT}/`);
        console.log(`🔗 API Base: http://localhost:${PORT}/api/sightings`);
    });
}