const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eted0lc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const brandCollection = client.db('brandDB').collection('brand');
    const brandUserCollection = client.db('brandDB').collection('userBrands');
    const NewBrandCollection = client.db('brandDB').collection('newBrand');
    const allProductCollection = client.db('brandDB').collection('allProducts');
    const userCollection = client.db('coffee2DB').collection('user');

    app.get('/brands', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/newBrand', async (req, res) => {
      const cursor = NewBrandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/userBrands', async (req, res) => {
      const cursor = brandUserCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/userBrands/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await brandUserCollection.findOne(query);
      res.send(result);
    });

    app.get('/allProducts', async (req, res) => {
      const cursor = allProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/allProducts', async (req, res) => {
      const allProducts = req.body;
      console.log(allProducts);
      const result = await allProductCollection.insertOne(allProducts);
      res.send(result);
    });

    app.post('/brands', async (req, res) => {
      const allBrands = req.body;
      console.log(allBrands);
      const result = await brandCollection.insertOne(allBrands);
      res.send(result);
    });

    app.post('/userBrands', async (req, res) => {
      const brandUsers = req.body;
      console.log(brandUsers);
      const result = await brandUserCollection.insertOne(brandUsers);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Brand Shop server is running perfectly');
});

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
