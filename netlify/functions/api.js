import mongoose from "mongoose";
import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser())

mongoose.connect(process.env.DATABASE_FITNESSFIEN);

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

const reviewSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  rating: Number,
  text: String,
  product: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  date: String
},{
  timestamps: true
});

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: { type: mongoose.Decimal128, get: getPrice },
  image: String,
});

const BasketSchema = new mongoose.Schema({
  items: [ProductSchema]
})

const userSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date,
    required: true
  },
  items: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Basket'
  }
})


const Review = mongoose.model("Review", reviewSchema);
const Basket = mongoose.model('Basket', BasketSchema);
const Product = mongoose.model('Products', ProductSchema);
const User = mongoose.model('User', userSchema);

function getPrice(value) {
    return parseFloat(value.toString())
  }
  
router.get('/Collection', async (req, res) => {
    try {
      const product = await Product.find({});
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
router.get('/Basket/:email', async (req, res) => {
    const email = req.params.email
    try {
      const user = await User.findOne({ userEmail: email });
      const basket = await Basket.findOne({ _id: user.items });
      res.json(basket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  router.get('/Collection', async (req, res) => {
    try {
      const product = await Product.find({});
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  router.get('/Product/:id/Review', async (req, res) => {
    const id = req.params.id
    try {
      const reviews = await Review.find({product: id});
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  router.post("/AddProduct", async (req, res) => {
    try {
      const data = req.body;
      let product = await Product.findOne({ _id: data._id });
      if (!product) {
        product = new Product({
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image
        });
        await product.save();
        res.sendStatus(200)
      }
    } catch (err) {
      console.log("ERROR MESSAGE HERE ->", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  
  });
  
  router.post("/Product/:id/AddReview", async (req, res) => {
    try {
      const data = req.body;
      const productId = req.params.id
      console.log(data.date);
      const review = new Review({
        userEmail: data.email,
        rating: parseInt(data.rating),
        text: data.text,
        product: productId,
        name: data.name,
        image: data.image,
        date: data.date
        
      })
        await review.save();
        res.sendStatus(200)
      }
    catch (err) {
      console.log("ERROR MESSAGE HERE ->", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  
  });
  
  router.post("/AddToBasket", async (req, res) => {
    const data = req.body;
    try {
      const product = await Product.findOne({ _id: data.id });
      const user = await User.findOne({ userEmail: data.email })
      let basket = await Basket.findOne({ _id: user.items });
      basket.items.push(product)
      await basket.save()
      res.json(basket)
    }
    catch (err) {
      console.log("ERROR MESSAGE HERE ->", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  router.get("/Product/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Product.findById(id);
      res.json(product)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  router.delete('/Product/:id', async (req, res) => {
    Product.deleteOne({ "_id": req.params.id })
      .then(() => {
        res.json({ message: 'Deleted' })
      })
      .catch(error => {
        res.sendStatus(500)
      })
  })
  
  router.delete('/Product', async (req, res) => {
    const email = req.body.email
    try {
      const user = await User.findOne({ userEmail: email });
      const basket = await Basket.findOne({ _id: user.items })
      const item = basket.items.findIndex(items =>
        items.id === req.body.id
      )
      basket.items.splice((item), 1);
      await basket.save()
      console.log(basket);
      res.json(basket)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
  
    }
  })
  router.delete('/user/Basket', async (req, res) => {
    const email = req.body.email
    const itemsId = req.body.id
    try {
      const user = await User.findOne({ userEmail: email });
      const basket = await Basket.findOne({ _id: user.items })
      const item = basket.items.findIndex(items =>
        items.id === itemsId
      )
      basket.items.splice((item), 1);
      await basket.save()
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
  
    }
  })
  router.delete('/Basket/User', async (req, res) => {
    const email = req.body.email
    console.log(email);
    try {
      const user = await User.findOne({ userEmail: email });
      const basket = await Basket.findOne({ _id: user.items })
      basket.items.splice(0,basket.items.length);
      await basket.save()
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
  
    }
  })
  
  router.delete("/Product/:id/Review", async (req, res) => {
    try {
      await Review.deleteOne({ _id: req.params.id });
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
  
  router.get('/Product/user/:email', async (req, res) => {
    const email = req.params.email
    try {
      const user = await User.findOne({ userEmail: email });
      const basket = await Basket.findOne({ _id: user.items })
      console.log(basket);
      res.json(basket)
    } catch (error) {
      console.log(error)
      res.json({ basket: [] })
    }
  })
  
  router.post('/EditProduct/:id', async (req, res) => {
    try {
      Product.updateOne({ "_id": req.params.id }, {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        image: req.body.image
      })
        .then(() => {
          res.sendStatus(200)
        })
    } catch { error } {
      // console.log(error)
      res.status(500)
    }
  })
  
  
    router.post("/user/login", async (req, res) => {
      const now = new Date()
      if (await User.count({ "userEmail": req.body.email }) === 0) {
        const newBasket = new Basket([])
        newBasket.save()
        const newuser = new User({ userEmail: req.body.email, lastLogin: now, items: newBasket })
        newuser.save()
          .then(() => {
            res.sendStatus(200)
          })
      } else {
        await User.findOneAndUpdate({ "userEmail": req.body.email }, { lastLogin: now })
        res.sendStatus(200)
      }
    })
    
    app.use("/app/", router);
    export const handler = serverless(app);
