require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
console.log('Testing native MongoDB driver connection...');
console.log('URI:', uri);

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB');
    
    // Test ping
    await client.db("professional-networking").command({ ping: 1 });
    console.log('✅ Ping successful');
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('✅ Available databases:', dbs.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testConnection();
