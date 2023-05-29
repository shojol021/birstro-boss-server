const express = require("express")
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6c8obk5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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


    const userCollection = client.db('BistroDb').collection('user')
    const menuCollection = client.db('BistroDb').collection('menu')
    const reviewsCollection = client.db('BistroDb').collection('reviews')
    const cartCollection = client.db('BistroDb').collection('cart')

    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray()
      res.send(result)
    })

    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray()
      res.send(result)
    })


    app.get('/cart', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([])
      }
      const query = { email: email }
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/cart', async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })

    app.delete('/cart/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    //users......................

    app.get('/users', async(req,res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async(req, res) => {
      const userInfo = req.body;
      const query =  {email: userInfo.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        
        return res.send({message: 'User Already exist'})
      }
      const result = await userCollection.insertOne(userInfo)
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc = {
        $set: {
          role: "admin"
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Bistro Boss Running')
}),

  app.listen(port)