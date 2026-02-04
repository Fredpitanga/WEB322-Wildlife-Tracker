const fs = require('fs').promises;
const path = require('path');

/**
 * Loads wildlife sightings data from the JSON file
 * @returns {Promise<Array>} Array of sighting objects
 * @throws {Error} If file cannot be read or parsed
 */
async function loadSightings() {
    try {
        // Construct the file path to sightings.json
        const filePath = path.join(__dirname, '..', 'data', 'sightings.json');
        
        // Read the file asynchronously
        const dataString = await fs.readFile(filePath, 'utf-8');
        
        // Parse the JSON string to JavaScript object
        const data = JSON.parse(dataString);
        
        // Extract and return the sightings array
        if (data && Array.isArray(data.sightings)) {
            console.log(`Successfully loaded ${data.sightings.length} sightings`);
            return data.sightings;
        } else {
            throw new Error('Invalid data structure: sightings array not found');
        }
        
    } catch (error) {
        // Log the error for debugging
        console.error('Error loading sightings data:', error.message);
        
        // Re-throw with a descriptive message
        if (error.code === 'ENOENT') {
            throw new Error('Sightings data file not found. Please ensure sightings.json exists in the data folder.');
        } else if (error instanceof SyntaxError) {
            throw new Error('Invalid JSON format in sightings.json file.');
        } else {
            throw new Error(`Failed to load sightings data: ${error.message}`);
        }
    }
}



module.exports = { loadSightings };
