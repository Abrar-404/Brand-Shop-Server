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
    const cartCollection = client.db('brandDB').collection('cart');
    const userCollection = client.db('brandDB').collection('user');

    // Old json data infos
    app.get('/brands', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Main 6 types data json
    app.get('/newBrand', async (req, res) => {
      const cursor = NewBrandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Data of add product form and added products page cards
    // app.get('/userBrands', async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const result = await brandUserCollection.find(query);
    //   res.send(result);
    // });

    app.get('/userBrands', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await brandUserCollection.find(query).toArray();

      res.send(result);
    });

    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/cart', async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //
    app.get('/userBrands/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await brandUserCollection.findOne(query);
      res.send(result);
    });

    // Update get and patch
    app.get('/updateItem/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await brandUserCollection.findOne(query);
      res.send(result);
    });

    // Update get and patch
    app.patch('/updateItem/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const updateDoc = {
        $set: {
          name: data.name,
          price: data.price,
          type: data.type,
          email: data.email,
          brandName: data.brandName,
          description: data.description,
          image: data.image,
        },
      };
      const result = await brandUserCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        updateDoc
      );
      res.send(result);
    });

    // Different products under brand name related data
    app.get('/allProducts', async (req, res) => {
      const cursor = allProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Different products under brand name related data
    app.post('/allProducts', async (req, res) => {
      const allProducts = req.body;
      console.log(allProducts);
      const result = await allProductCollection.insertOne(allProducts);
      res.send(result);
    });

    // Old json data infos
    app.post('/brands', async (req, res) => {
      const allBrands = req.body;
      console.log(allBrands);
      const result = await brandCollection.insertOne(allBrands);
      res.send(result);
    });

    // Cart data
    app.post('/cart', async (req, res) => {
      const product = req.body;
      const query = { id: product.id };
      const existingProduct = await cartCollection.findOne(query);

      if (existingProduct) {
        // Product already exists, set 400 status and send a JSON response
        return res
          .status(400)
          .json({ message: 'Product already exists in the cart' });
      } else {
        // Product doesn't exist, add it to the cart and set 200 status
        const result = await cartCollection.insertOne(product);
        res.status(200).json({ message: 'Product added to cart' });
      }
    });

    // Data of add product form and added products page cards
    app.post('/userBrands', async (req, res) => {
      const brandUsers = req.body;
      console.log(brandUsers);
      const result = await brandUserCollection.insertOne(brandUsers);
      res.send(result);
    });

    app.put('/userBrands/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCars = req.body;
      const cars = {
        $set: {
          name: updatedCars.name,
          price: updatedCars.price,
          selectedOption: updatedCars.selectedOption,
          selectedOptionNew: updatedCars.selectedOptionNew,
          description: updatedCars.description,
          image: updatedCars.image,
        },
      };
      const result = await brandUserCollection.updateOne(filter, cars, options);
      res.send(result);
    });

    // adding new user
    app.post('/user', async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return;
      }
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // Added products deletation related data
    app.delete('/userBrands/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await brandUserCollection.deleteOne(query);
      res.send(result);
    });

    // cart deletation related data
    // app.delete('/cart/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await cartCollection.deleteOne(query);
    //   res.send(result);
    // });

    app.delete('/cart/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          // Item deleted successfully
          res.status(204).send(); // 204 No Content
        } else {
          // Item not found or not deleted
          res.status(404).json({ message: 'Item not found or not deleted' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
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
