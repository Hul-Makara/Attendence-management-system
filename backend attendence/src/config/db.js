const mongoose = require('mongoose');

let cached = null;

async function connectDB() {
  if (cached) return cached;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  cached = await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.host);

  // Safely drop old non-partial user_1 index on students if it exists
  try {
    const collections = await cached.connection.db.listCollections({ name: 'students' }).toArray();
    if (collections.length > 0) {
      const studentIndexes = await cached.connection.db.collection('students').indexes();
      const oldUserIndex = studentIndexes.find(
        (idx) => idx.name === 'user_1' && !idx.partialFilterExpression
      );
      if (oldUserIndex) {
        await cached.connection.db.collection('students').dropIndex('user_1');
        console.log('Cleaned up old non-partial user_1 index on students collection');
      }
    }
  } catch (err) {
    console.warn('Note on index check:', err.message);
  }

  return cached;
}

module.exports = connectDB;
