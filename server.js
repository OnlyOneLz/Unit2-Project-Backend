import mongoose from "mongoose";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";



const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser())


mongoose.connect(process.env.DATABASE_FITNESSFIEN);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});

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
  }
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

app.get('/Collection', async (req, res) => {
  try {
    const product = await Product.find({});
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/Basket/:email', async (req, res) => {
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

app.get('/Collection', async (req, res) => {
  try {
    const product = await Product.find({});
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/Product/:id/Review', async (req, res) => {
  const id = req.params.id
  console.log('REVIEWS');
  try {
    const reviews = await Review.find({product: id});
    console.log(reviews);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get('/Home', async (req, res) => {
//   try {
//     const product = await Product.findById({_id: '652663ccf856f0929ce2217e'});
//     const productTwo = await Product.findById({_id: '6526640af856f0929ce22181'});
//     const productThree = await Product.findById({_id: '65266420f856f0929ce22184'});
//     const productFour = await Product.findById({_id: '65266439f856f0929ce22187'});
//     res.json(product);
//     res.json(productTwo);
//     res.json(productThree);
//     res.json(productFour);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/AddProduct", async (req, res) => {
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

app.post("/Product/:id/AddReview", async (req, res) => {
  try {
    const data = req.body;
    const productId = req.params.id
    const review = new Review({
      userEmail: data.email,
      rating: parseInt(data.rating),
      text: data.text,
      product: productId
      
    })
      await review.save();
      res.sendStatus(200)
    }
  catch (err) {
    console.log("ERROR MESSAGE HERE ->", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }

});

app.post("/AddToBasket", async (req, res) => {
  const data = req.body;
  try {
    const product = await Product.findOne({ _id: data.id });
    const user = await User.findOne({ userEmail: data.email })
    let basket = await Basket.findOne({ _id: user.items });
    basket.items.push(product)
    await basket.save()
  }
  catch (err) {
    console.log("ERROR MESSAGE HERE ->", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/Product/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    res.json(product)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete('/Product/:id', async (req, res) => {
  Product.deleteOne({ "_id": req.params.id })
    .then(() => {
      res.json({ message: 'Deleted' })
    })
    .catch(error => {
      res.sendStatus(500)
    })
})

app.delete('/Product', async (req, res) => {
  const email = req.body.email
  try {
    const user = await User.findOne({ userEmail: email });
    const basket = await Basket.findOne({ _id: user.items })
    const item = basket.items.findIndex(items =>
      items.id === req.body.id
    )
    basket.items.splice((item), 1);
    await basket.save()
  } catch (error) {
    console.log(error)
    res.sendStatus(500)

  }
})
app.delete('/user/Basket', async (req, res) => {
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
app.delete('/Basket/User', async (req, res) => {
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

app.delete("/Product/:id/Review", async (req, res) => {
  try {
    await Review.deleteOne({ _id: req.params.id });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/Product/user/:email', async (req, res) => {
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

app.post('/EditProduct/:id', async (req, res) => {
  try {
    console.log(req.body);
    Product.updateOne({ "_id": req.params.id }, {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      image: req.body.image
    })
      // const product = await Basket.items.findOne({_id: req.body.id})
      // const user = await User.findOne({userEmail: req.body.email});
      // Basket.updateOne({_id: user.items}, {
      //   items: {
      //     product {
      //       price: req.body.price
      //     }
          
      //   } 
      // })
      .then(() => {
        res.sendStatus(200)
      })
  } catch { error } {
    // console.log(error)
    res.status(500)
  }
})


  app.post("/user/login", async (req, res) => {
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

  app.post("/addReview", async (req, res) => {
    try {
      const data = req.body;
      const review = new Review({
        name: data.name,
        date: data.date,
        rating: data.rating,
        text: data.text,
      });
      await review.save();
      return res.status(200).json(review);
    } catch (err) {
      console.log("ERROR MESSAGE HERE ->", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

