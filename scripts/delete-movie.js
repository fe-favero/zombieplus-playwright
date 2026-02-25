const path = require('path');
const { executeSQL, ensureMoviesTableExists } = require(path.join(__dirname, '..', 'tests', 'support', 'database'));

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: node scripts/delete-movie.js "Movie Title"');
  process.exit(1);
}

(async () => {
  try {
    await ensureMoviesTableExists();
    const res = await executeSQL('DELETE FROM movies WHERE title = $1', [title]);
    console.log('DELETE rowCount:', res.rowCount);
    process.exit(0);
  } catch (err) {
    console.error('Error executing delete:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
