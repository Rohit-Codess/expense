import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const cleanupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pocketledger');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Check if users collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      console.log('ℹ️  Users collection does not exist yet. Nothing to clean up.');
      return;
    }

    // Get current indexes
    const indexes = await db.collection('users').indexes();
    console.log('📋 Current indexes:', indexes.map(idx => idx.name));

    // Drop old mobile_1 index if it exists
    try {
      await db.collection('users').dropIndex('mobile_1');
      console.log('✅ Dropped old mobile_1 index');
    } catch (error: any) {
      if (error.code === 27) { // Index not found
        console.log('ℹ️  mobile_1 index does not exist');
      } else {
        console.log('❌ Error dropping mobile_1 index:', error.message);
      }
    }

    // Drop the collection and recreate it (this will also remove all old data)
    console.log('🔄 Cleaning up users collection...');
    await db.collection('users').drop();
    console.log('✅ Users collection cleaned up');

    // The collection will be recreated with proper schema when the server starts

  } catch (error) {
    console.error('❌ Database cleanup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
};

// Run cleanup
cleanupDatabase().then(() => {
  console.log('🎉 Database cleanup completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Cleanup failed:', error);
  process.exit(1);
});