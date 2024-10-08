const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const Callback = require('./Model/Model');
const User = require('./Model/User');
const Earning = require('./Model/Upload');
const Admin = require('./Model/Admin');
const Collections = require('./Model/Collections');
const Menu = require('./Model/Menu');
const AddtoCart = require('./Model/AddtoCart');
const checkout = require('./Model/checkout');
const proofPayment = require('./Model/proofPayment');

const app = express();
const port = 5000;

const storage = multer.memoryStorage();
const upload = multer({ dest: 'uploads/' });

cloudinary.config({
  cloud_name: 'dz9bcnibg',
  api_key: '115551573484143',
  api_secret: 'RTq59gWZoQoshhFsibXONTAI-nE'
});

mongoose.connect('mongodb+srv://Subhan:NLB2TBnONFehVF8e@occasion-style.qdi9g.mongodb.net/?retryWrites=true&w=majority&appName=Occasion-Style', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

app.use(cors());
app.use(express.json()); //json reques handling


//Singup api
app.post('/singginupp', async (req, res) => {
  try {
    const { fname, lname, pnumber, email, address, password, city } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fname, lname, pnumber, email, address, password: hashedPassword, city });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//occasion project  for login//
app.post('/loggering', async (req, res) => {
  const { email, password } = req.body;
  // console.log('Login request:', { email, password });

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // console.log('Login successful');
    // console.log('user', user);
    res.json({ message: 'Login successful', fname: user.fname, userId: user._id });
  } catch (error) {
    // console.error('Error during login:', error);
    res.status(500).json({ message: error.message });
  }
});
// admin register
app.post('/admin', async (req, res) => {
  try {
    const { fname, lname, pnumber, email, address, password, } = req.body;
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Admin({ fname, lname, pnumber, email, address, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


///logging
app.post('/admins', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request:', { email, password });

  try {
    const user = await Admin.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('Login successful');
    console.log('user', user);
    res.json({ message: 'Login successful', fname: user.fname });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: error.message });
  }
});

///login all user detais
app.get('/all-the-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Assuming your User model is imported and defined somewhere in your code

// Route to get user details by ID
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

///login all user delete
app.delete('/dell/:_id', async (req, res) => {
  const { _id } = req.body; // Corrected accessing _id from req.body
  if (!_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(_id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'Occasionstyle3@gmail.com',
    pass: 'nfvb ejuu mike wqlw'
  }
});

//post api for password reset
app.post('/forgoott', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hashing the new password

    await User.updateOne({ email }, { password: hashedPassword });

    await transporter.sendMail({
      from: 'Ocassionstyles@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`
    });

    res.status(200).json({ message: 'Password reset successful. Check your email for the new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//now for the logout system
app.post('/logout', async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    // Handle any unexpected errors
    console.error('Logout failed:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});


//post for the callback function
app.post('/call', async (req, res) => {
  try {
    const { fname, lname, pnumber, email, message } = req.body;

    const existingUser = await Callback.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new Callback({ fname, lname, pnumber, email, message });
    await newUser.save();

    res.status(201).json({ message: 'Call Back created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//multer cloudinary

// app.post('/imaginnes', upload.single('image'), async (req, res) => {
//   try {
//     // Upload image to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'your_folder_name',
//       public_id: 'optional_public_id',
//       resource_type: 'auto'
//     });

//     const newPost = new Earning({
//       fname: req.body.fname,
//       lname: req.body.lname,
//       pnumber: req.body.pnumber,
//       email: req.body.email,
//       image: result.secure_url,
//     });
//     await newPost.save();
//     res.status(201).json({ success: true, data: newPost });
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// });

app.post('/imaginnes', upload.array('images', 5), async (req, res) => { // 'images' is the field name in the form and 10 is the max number of files
  try {
    const uploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path, {
        folder: 'your_folder_name',
        resource_type: 'auto'
      })
    );

    // Wait for all uploads to finish
    const results = await Promise.all(uploadPromises);

    // Create a new post with the image URLs
    const newPost = new Earning({
      fname: req.body.fname,
      lname: req.body.lname,
      pnumber: req.body.pnumber,
      email: req.body.email,
      images: results.map(result => result.secure_url) // Store multiple image URLs
    });

    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


//checkout
app.post('/checkout/:data', async (req, res) => {
  console.log("--->", req.params.data)
  const dataArrayString = req.params.data; // Assuming req.params.data contains "value1,value2,value3"
  dataString = dataArrayString.replace(/[\[\]"]/g, '');
  const dataArray = dataString.split(',');

  try {
    const newPost = new checkout({
      fname: dataArray[0],
      lname: dataArray[1],
      pnumber: dataArray[2],
      email: dataArray[3],
      address: dataArray[4],
      city: dataArray[5],
      shippingMethod: dataArray[6],
      paymetMethod: dataArray[7],
      orderNumber: dataArray[8],

    });
    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


//proofpayment
app.post('/proofPayment', upload.single('image'), async (req, res) => {
  console.log("req.body proofPayment --> ", req.body);
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'your_folder_name',
      public_id: 'optional_public_id',
      resource_type: 'auto'
    });

    // Get the array of product IDs from the request body
    const productIds = req.body.productIds;

    const newPost = new proofPayment({
      orderNumber: req.body.orderNumber,
      // productIds: productIds,
      image: result.secure_url,
      // list of productId, orders it
    });
    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

//Collection
app.post('/collections', upload.single('image'), async (req, res) => {
  console.log("req.body Collections --> ", req.body);
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'your_folder_name',
      public_id: 'optional_public_id',
      resource_type: 'auto'
    });

    const newPost = new Collections({
      name: req.body.name,
      description: req.body.description,
      buyPrice: req.body.buyPrice,
      rentPrice: req.body.rentPrice,
      status: req.body.status,
      category: req.body.category,
      type: req.body.type,
      image: result.secure_url,
    });
    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/menu/:data', async (req, res) => {
  console.log("--->", req.params.data)
  const dataArrayString = req.params.data; // Assuming req.params.data contains "value1,value2,value3"
  dataString = dataArrayString.replace(/[\[\]"]/g, '');
  const dataArray = dataString.split(',');
  try {
    const newPost = new Menu({
      name: dataArray[0],
      category: dataArray[1],
    });
    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/collectionsAddToCart/:data', async (req, res) => {
  console.log("req.body Collections Add tocart --> ", req.params.data);
  console.log("req.body Collections Add tocart --> ", req.body);
  const dataArrayString = req.params.data; // Assuming req.params.data contains "value1,value2,value3"
  dataString = dataArrayString.replace(/[\[\]"]/g, '');
  const dataArray = dataString.split(',');
  try {
    const newPost = new AddtoCart({
      productId: dataArray[0],
      userId: dataArray[1],
      name: dataArray[2],
      description: dataArray[3],
      buyPrice: dataArray[4],
      rentPrice: dataArray[5],
      status: dataArray[6],
      selfStatus: dataArray[7],
      rentFromDate: dataArray[8],
      renttillDate: dataArray[9],
      //image: req.body.image,
    });
    await newPost.save();
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


//INCard status update
app.put('/collectionsAddToCart/rent/:id', async (req, res) => {
  try {
    const updateid = req.params.id;

    const { status } = req.body;

    const updatedCallback = await Collections.findByIdAndUpdate(
      updateid,
      { rentStatus: 'InCard' },
      { new: true }
    ).exec();

    if (!updatedCallback) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(updatedCallback);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.put('/collectionsAddToCart/buy/:id', async (req, res) => {
  try {
    const updateid = req.params.id;

    const updatedCallback = await Collections.findByIdAndUpdate(
      updateid,
      { buyStatus: 'InCard' },
      { new: true }
    ).exec();

    if (!updatedCallback) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(updatedCallback);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//billgenerate
app.get('/collectionsAddToCart/rent/bill/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const { status } = req.body;

    const updatedCallback = await AddtoCart.find({ userId: userId, selfStatus: "Rent" });
    const totalRentPrice = updatedCallback.reduce((total, item) => total + parseFloat(item.rentPrice), 0);

    res.status(200).json(totalRentPrice);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/collectionsAddToCart/buy/bill/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const { status } = req.body;

    const updatedCallback = await AddtoCart.find({ userId: userId, selfStatus: "Buy" });
    const totalBuyPrice = updatedCallback.reduce((total, item) => total + parseFloat(item.buyPrice), 0);

    res.status(200).json(totalBuyPrice);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/collectionsAddToCart/rentplusbuy/bill/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const { status } = req.body;

    const updatedCallback = await AddtoCart.find({ userId: userId, selfStatus: "Rent" });
    const updatedCallback2 = await AddtoCart.find({ userId: userId, selfStatus: "Buy" });
    const totalRentPrice = updatedCallback.reduce((total, item) => total + parseFloat(item.rentPrice), 0);
    const totalBuyPrice = updatedCallback2.reduce((total, item) => total + parseFloat(item.buyPrice), 0);
    const total = totalRentPrice + totalBuyPrice;
    res.status(200).json(total);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Filter Routes
app.get('/collections/filter/rent/lowtohigh', async (req, res) => {
  try {

    // Find all products
    const products = await Collections.find();

    // Sort the products based on rentPrice from low to high
    const sortedProducts = products.sort((a, b) => parseFloat(a.rentPrice) - parseFloat(b.rentPrice));

    if (!sortedProducts) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(sortedProducts);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/collections/filter/rent/highttolow', async (req, res) => {
  try {

    // Find all products
    const products = await Collections.find();

    // Sort the products based on rentPrice from low to high
    const sortedProducts = products.sort((a, b) => parseFloat(b.rentPrice) - parseFloat(a.rentPrice));

    if (!sortedProducts) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(sortedProducts);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/collections/filter/buy/lowtohigh', async (req, res) => {
  try {

    // Find all products
    const products = await Collections.find();

    // Sort the products based on rentPrice from low to high
    const sortedProducts = products.sort((a, b) => parseFloat(a.buyPrice) - parseFloat(b.buyPrice));

    if (!sortedProducts) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(sortedProducts);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/collections/filter/buy/highttolow', async (req, res) => {
  try {

    // Find all products
    const products = await Collections.find();

    // Sort the products based on rentPrice from low to high
    const sortedProducts = products.sort((a, b) => parseFloat(b.buyPrice) - parseFloat(a.buyPrice));

    if (!sortedProducts) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(sortedProducts);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//OutofCard status update
app.put('/collectionsAddToCart/rent/OutOfCard/:id', async (req, res) => {
  try {
    const updateid = req.params.id;

    const { status } = req.body;

    const updatedCallback = await Collections.findByIdAndUpdate(
      updateid,
      { rentStatus: 'OutOfCard' },
      { new: true }
    ).exec();

    if (!updatedCallback) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(updatedCallback);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.put('/collectionsAddToCart/buy/OutOfCard/:id', async (req, res) => {
  try {
    const updateid = req.params.id;

    const updatedCallback = await Collections.findByIdAndUpdate(
      updateid,
      { buyStatus: 'OutOfCard' },
      { new: true }
    ).exec();

    if (!updatedCallback) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(updatedCallback);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//delete
app.delete('/collections/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await Collections.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.delete('/menu/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await Menu.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/collectionsAddToCart/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await AddtoCart.findByIdAndDelete(_id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.delete('/collectionsAddToCart/rentonly/deleteItemfromCart/:productId', async (req, res) => {
  const productId = req.params.productId;
  console.log("productId ///////", productId)

  try {
    const deletedItems = await AddtoCart.deleteMany({ productId: productId, selfStatus: "Rent" });
    if (deletedItems.deletedCount === 0) {
      return res.status(404).json({ message: 'Items not found' });
    }
    res.json({ message: 'Items deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/collectionsAddToCart/buyonly/deleteItemfromCart/:productId', async (req, res) => {
  const productId = req.params.productId;
  console.log("productId ///////", productId)

  try {
    const deletedItems = await AddtoCart.deleteMany({ productId: productId, selfStatus: "Buy" });
    if (deletedItems.deletedCount === 0) {
      return res.status(404).json({ message: 'Items not found' });
    }
    res.json({ message: 'Items deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//update
app.put('/menu/update/:data', async (req, res) => {
  console.log("--->", req.params.data);
  const dataArrayString = req.params.data; // Assuming req.params.data contains "value1,value2,value3"
  dataString = dataArrayString.replace(/[\[\]"]/g, '');
  const dataArray = dataString.split(',');
  const id = dataArray[2];

  try {
    // Update the document with the provided ID using values from dataArray
    const updatedCallback = await Menu.findByIdAndUpdate(id, {
      name: dataArray[0],
      category: dataArray[1],
    }, { new: true }).exec();

    // Respond with the updated document
    res.status(201).json({ success: true, data: updatedCallback });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/collections/update/:id', upload.single('image'), async (req, res) => {
  console.log("req.body Collections --> ", req.params.id);
  console.log("req.body Collections --> ", req.body);
  const id = req.params.id;
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'your_folder_name',
      public_id: 'optional_public_id',
      resource_type: 'auto'
    });

    const updatedCallback = await Collections.findByIdAndUpdate(id, {
      name: req.body.name,
      description: req.body.description,
      buyPrice: req.body.buyPrice,
      rentPrice: req.body.rentPrice,
      status: req.body.status,
      category: req.body.category,
      type: req.body.type,
      image: result.secure_url,
    });
    res.status(201).json({ success: true, data: updatedCallback });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
// app.put('/collections/update/:data', async (req, res) => {
//   console.log("--->", req.params.data);
//   const dataArrayString = req.params.data; // Assuming req.params.data contains "value1,value2,value3"
//   dataString = dataArrayString.replace(/[\[\]"]/g, '');
//   const dataArray = dataString.split(',');
//   const id = dataArray[8];

//   try {
//     // Update the document with the provided ID using values from dataArray
//     const updatedCallback = await Collection.findByIdAndUpdate(id, {
//       productId:dataArray[0],
//       userId:dataArray[1],
//       name: dataArray[2],
//       description: dataArray[3],
//       buyPrice: dataArray[4],
//       rentPrice:dataArray[5],
//       status:dataArray[6],
//       selfStatus:dataArray[7],
//     }, { new: true }).exec();

//     // Respond with the updated document
//     res.status(201).json({ success: true, data: updatedCallback });
//   } catch (error) {
//     console.error('Error updating document:', error);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// });


//collection get
app.get('/getCollection', async (req, res) => {
  try {
    const collection = await Collections.find();
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


//checkout get
app.get('/checkout', async (req, res) => {
  try {
    const collection = await checkout.find();
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

//proofPayment get
app.get('/proofPayment', async (req, res) => {
  try {
    const collection = await proofPayment.find();
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


//collection get
app.get('/getMenu', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json({ success: true, data: menu });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// get items of peoduct
app.get('/getCollection/cart/category/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const collection = await Collections.find({ category: category });
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/getCollection/cart/type/:type', async (req, res) => {
  const type = req.params.type;
  try {
    const collection = await Collections.find({ type: type });
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.get('/getCollection/cart/search/:search', async (req, res) => {
  const search = req.params.search;
  try {
    const collection = await Collections.find({ name: { $regex: `^${search}`, $options: 'i' } });
    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});







//collectionAddTocart get
app.get('/getCollectionAddToCart/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const addToCart = await AddtoCart.find({ userId: userId });
    //const data = res.json({ success: true, data: addToCart });
    const productIds = addToCart.map(item => item.productId);
    const productSelfStatus = addToCart.map(item => item.selfStatus);
    console.log(productIds);
    console.log(productSelfStatus);
    try {
      const collection = await Collections.find({ _id: { $in: productIds } });
      res.json({ success: true, data: collection });
      console.log("==========", collection);

    } catch (error) {
      console.error('Error fetching collection:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

//earning
app.get('/kamial', async (req, res) => {
  try {
    const earnings = await Earning.find({ status: "pending" });
    res.json({ success: true, data: earnings });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



// Earnings put
app.put('/pasa', async (req, res) => {
  try {
    const callbackId = req.body._id;
    if (!mongoose.Types.ObjectId.isValid(callbackId)) {
      console.log('Invalid _id parameter');
      return res.status(400).json({ message: 'Invalid _id parameter' });
    }

    const { status } = req.body;

    const updatedCallback = await Earning.findByIdAndUpdate(
      callbackId,
      { status },
      { new: true }
    ).exec();

    if (!updatedCallback) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(updatedCallback);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//get for the request 
app.get('/calling', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 14;

    const skip = (page - 1) * limit;

    const callbacks = await Callback.find({ status: "pending" }).skip(skip).limit(limit);

    res.status(200).json(callbacks);
  } catch (error) {
    console.error('Error fetching callbacks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//callback status update
app.put('/id', async (req, res) => {
  try {
    const callbackId = req.body._id;
    if (!mongoose.Types.ObjectId.isValid(callbackId)) {
      console.log('Invalid _id parameter');
      return res.status(400).json({ message: 'Invalid _id parameter' });
    }

    const { status } = req.body;

    const updatedCallback = await Callback.findByIdAndUpdate(
      callbackId,
      { status },
      { new: true }
    ).exec();

    if (!updatedCallback) {
      console.log('Callback not found');
      return res.status(404).json({ message: 'Callback not found' });
    }

    res.status(200).json(updatedCallback);
  } catch (error) {
    console.error('Error updating callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Handle termination and  case of the error
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// --------------------------------------------------------------------------


//  get product id  Or fetch product id

app.get('/getCollection/:productId', async (req, res) => {
  try {
    const { productId } = req.params; 
    console.log("Product Id", productId);
    

    const collection = await Collections.findById(productId);

    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
