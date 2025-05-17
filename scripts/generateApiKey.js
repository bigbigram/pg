const crypto = require('crypto');

// Generate a secure random API key
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('Generated API Key:', apiKey);
