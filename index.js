const express = require ('express')
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://mediqueue:hF1wfuZxMYKE2zk5@ph1-cluster0.obx0lau.mongodb.net/?appName=ph1-Cluster0";
const app =  express()
const PORT = 3000

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// Root API

app.get('/', (req, res) => {
  res.send('Server is running successfully')
})


// Users API
app.get('/users', (req, res) => {
  res.send('All users data')
})


// Tutors API
app.get('/tutors', (req, res) => {
  res.send('All tutors data')
})


// Server Run
app.listen(PORT, ()=>{
  console.log(`sever running on port ${PORT}`)
})