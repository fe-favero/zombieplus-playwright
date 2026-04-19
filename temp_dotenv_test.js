process.env.DOTENVX_QUIET = '1';
const result = require('dotenv').config({ path: '.env' });
console.log('loaded', result.parsed ? Object.keys(result.parsed).length : 'none');
