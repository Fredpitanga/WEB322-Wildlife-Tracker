/************************************************************************
 * WEB322 - Assignment 01
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Fred da Silveira Pitanga Filho
 * Student ID:  154169213
 * Date: feb 4, 2026
 *
 ***********************************************************************/

// Import required modules
const express = require('express');
const path = require('path');
const { loadSightings } = require('./utils/dataLoader');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

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
        
        // Using .filter() with arrow function as required
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
        
        // Using .map() with arrow function as required
        const allSpecies = sightings.map(sighting => sighting.species);
        
        // Remove duplicates using Set
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
        
        // Using .filter() with arrow function as required
        const forestSightings = sightings.filter(sighting => 
            sighting.habitat.toLowerCase() === "forest"
        );
        
        // Create response object with required structure
        const response = {
            habitat: "forest",
            sightings: forestSightings,
            count: forestSightings.length  // Count of sighting records
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
        
        // Using .find() with arrow function as required
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
        
        // Using .findIndex() with arrow function as required
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
        
        // Sort by date (most recent first)
        const sortedSightings = [...sightings].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Get top 3 most recent
        const recentSightings = sortedSightings.slice(0, 3);
        
        // Format response with specific fields only
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

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 About page: http://localhost:${PORT}/`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/sightings`);
    console.log(`Press Ctrl+C to stop the server`);
});

module.exports = app; // Export for testing purposes