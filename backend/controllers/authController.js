const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../models/user");
const AdminModel = require("../models/admin");
const ProductModel = require("../models/products");
const OrderModel = require("../models/order");
const DeliveryBoyModel = require("../models/deliveryboy");
const OTPModel = require("../models/otpmodel");
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs'); // File system module for file operations
const path = require('path'); // Path module for handling file paths
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

require('dotenv').config();
const mongoose = require('mongoose');
// const JWT_SECRET = "secret123";
const Joi = require('joi');

const signup = async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;

        if (!username || !name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists', success: false });
        }

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already exists', success: false });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

        // Save the user details temporarily without password and role
        const otpModel = new OTPModel({
            username,
            name,
            email,
            password,
            role,
            otp,
            otpExpiry: moment.tz(Date.now() + 3 * 60 * 1000, "Asia/Kolkata").toDate(), // Set expiry to 3 minutes later in IST
        });

        await otpModel.save();

        // Setup Nodemailer to send the OTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `Smart Box using IoT <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your One-Time Password (OTP) Code',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #0044cc; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Your OTP Code</h1>
                    </div>
                    <div style="padding: 20px; text-align: left;">
                        <p style="font-size: 18px; color: #555;">Dear User,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            You are just one step away from completing your verification for <strong>Smart Box using IoT</strong>. Please use the OTP code below to verify your email address.
                        </p>
                        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; margin: 20px 0; border-radius: 8px;">
                            <p style="font-size: 20px; font-weight: bold; color: #0044cc;">${otp}</p>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            This code is valid for <strong>3 minutes</strong>. Please make sure to enter it promptly.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #ff4d4f;">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
                    </div>
                </div>
            </div>
            `
        };

        // Send OTP email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully. Please verify to complete signup.', success: true });

    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Please Try after 3 Minutes.', success: false });
    }
};

const verifySignup = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const tempUser = await OTPModel.findOne({ email });

        if (!tempUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Check if OTP matches and hasn't expired (considering IST)
        const currentIST = moment.tz("Asia/Kolkata");
        if (tempUser.otp === otp && currentIST.isBefore(tempUser.otpExpiry)) {
            // OTP is correct, create the user account
            const hashedPassword = await bcrypt.hash(tempUser.password, 10);
            const userModel = new UserModel({
                username: tempUser.username,
                name: tempUser.name,
                email: tempUser.email,
                password: hashedPassword,
                role: tempUser.role
            });

            await userModel.save();
            await OTPModel.deleteOne({ email }); // Delete temporary OTP record after successful signup

            // Send a success email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `Smart Box using IoT <${process.env.EMAIL_USER}>`, // Use backticks for template literals
                to: email,
                subject: 'Welcome to Smart Box using IOT - Signup Successful',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                            <div style="background-color: #0044cc; color: white; padding: 20px;">
                                <h1 style="margin: 0; font-size: 24px; text-align: center;">Welcome to Smart Box using IOT!</h1>
                            </div>
                            <div style="padding: 20px; text-align: left;">
                                <p style="font-size: 18px; color: #555;">Dear ${userModel.name},</p>
                                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                    We are excited to have you on board at <strong>Smart Box using IOT</strong>! Your signup was successful, and you're all set to explore our platform.
                                </p>
                                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                    Thank you for choosing <strong>Smart Box using IOT</strong>. We look forward to a successful journey together!
                                </p>
                                <p style="font-size: 18px; line-height: 1.6; color: #555;">
                                    Best regards,<br />
                                    The Smart Box using IOT Team
                                </p>
                                <hr style="border: none; border-top: 1px solid #ff4d4f; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: 
#3B82F6;">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
                            </div>
                        </div>
                    </div>
                `,
            };
            

            // Send the email after OTP verification
            await transporter.sendMail(mailOptions);

            return res.status(201).json({ message: 'Signup successful', success: true });
        } else {
            return res.status(400).json({ message: 'Invalid or expired OTP', success: false });
        }
    } catch (err) {
        console.error('OTP Verification Error:', err);
        res.status(500).json({ message: 'Please try after 3 Minutes', success: false });
    }
};

const deleteExpiredOTPs = async () => {
    const now = new Date();
    await OTPModel.deleteMany({ otpExpiry: { $lt: now } });
};

// **Add the following line to run the deletion function every minute**
setInterval(deleteExpiredOTPs, 60 * 1000);





const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                success: false
            });
        }

        let currentUser = await AdminModel.findOne({ email });

        if (!currentUser) {
            currentUser = await UserModel.findOne({ email });
        }

        if (!currentUser) {
            currentUser = await DeliveryBoyModel.findOne({ email });
        }

        if (!currentUser) {
            return res.status(403).json({
                message: 'Authentication failed: User not found',
                success: false
            });
        }

        const isPassEqual = await bcrypt.compare(password, currentUser.password);
        if (!isPassEqual) {
            return res.status(403).json({
                message: 'Authentication failed: Incorrect password',
                success: false
            });
        }

        const jwtToken = jwt.sign(
            { email: currentUser.email, _id: currentUser._id, role: currentUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const roleRedirectMap = {
            'admin': '/admindashboard',
            'deliveryBoy': '/deliveryboydashboard',
            'user': '/home'
        };
        const redirectUrl = roleRedirectMap[currentUser.role] || '/home';

        res.status(200).json({
            message: 'Login successful',
            success: true,
            jwtToken,
            name: currentUser.name,
            id: currentUser._id,
            role: currentUser.role,
            redirectUrl
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};





const adminsignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists in the Admin collection
        const existingUser = await AdminModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Admin already exists, you can login', success: false });
        }

        // Check if there are already 2 admins in the Admin collection
        const adminCount = await AdminModel.countDocuments();
        if (adminCount >= 1) {
            return res.status(403).json({ message: 'Only one admin are allowed', success: false });
        }

        // Create a new admin user
        const admin = new AdminModel({ name, email, password });
        admin.password = await bcrypt.hash(password, 10);
        await admin.save();

        res.status(201).json({
            message: "Signup successful",
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const fetchAdminById = async (req, res) => {
    try {
        const { id } = req.params; 
        // console.log('Admin ID:', id); // Log the ID being queried

        // Fetch the admin by ID from the Admin collection
        const admin = await AdminModel.findById(id).select('-password').exec(); // Exclude the password field for security

        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'Admin fetched successfully',
            success: true,
            data: admin
        });
    } catch (err) {
        console.error('Error fetching admin:', err); // Log the error for debugging
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

const deliveryBoySignup = async (req, res) => {
    try {
        // Destructure and stringify all fields
        let { name, email, password, username, contact, vehicleDetails } = req.body;

        // Convert all fields to strings
        name = String(name);
        email = String(email);
        password = String(password);
        username = String(username);
        contact = String(contact);
        vehicleDetails = String(vehicleDetails);

        // Log received data for debugging (sensitive info removed)
        console.log('Received data:', { name, email, username, contact, vehicleDetails });

        // Check if all required fields are provided
        if (!name || !email || !password || !username || !contact || !vehicleDetails) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        // Validate contact number format (for example, it should be a number and of a specific length)
        if (!/^\d{10}$/.test(contact)) {
            return res.status(400).json({ message: 'Contact number must be 10 digits', success: false });
        }

        // Check if the delivery boy already exists by email
        const existingDeliveryBoyByEmail = await DeliveryBoyModel.findOne({ email });
        if (existingDeliveryBoyByEmail) {
            return res.status(409).json({ message: 'Delivery boy with this email already exists, you can login', success: false });
        }

        // Check if the delivery boy already exists by username
        const existingDeliveryBoyByUsername = await DeliveryBoyModel.findOne({ username });
        if (existingDeliveryBoyByUsername) {
            return res.status(409).json({ message: 'Delivery boy with this username already exists, please choose a different username', success: false });
        }

        // Check if there are already 2 delivery boys in the DeliveryBoy collection
        const deliveryBoyCount = await DeliveryBoyModel.countDocuments();
        if (deliveryBoyCount >= 2) {
            return res.status(403).json({ message: 'Only two delivery boys are allowed', success: false });
        }

        // Create a new delivery boy user with initialized earnings
        const deliveryBoy = new DeliveryBoyModel({
            name,
            email,
            password: await bcrypt.hash(password, 10), // Hash the password here
            username,
            contact,
            vehicleDetails,
            earnings: 0 // Initialize earnings to 0
        });

        await deliveryBoy.save();

        res.status(201).json({
            message: "Signup successful",
            success: true
        });
    } catch (err) {
        console.error('Error occurred:', err); // Log error details
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};




const fetchUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the user by ID from the User collection, including the password field
        const user = await UserModel.findById(id).select('+password'); // Include the password field

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'User fetched successfully',
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Error fetching user:', err); // Log the error for debugging
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};



const fetchDeliveryBoyById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the delivery boy by ID from the DeliveryBoy collection
        const deliveryBoy = await DeliveryBoyModel.findById(id);

        if (!deliveryBoy) {
            return res.status(404).json({
                message: 'Delivery boy not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'Delivery boy fetched successfully',
            success: true,
            data: deliveryBoy
        });
    } catch (err) {
        console.error('Error fetching delivery boy:', err); // Log the error for debugging
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};




const fetchAllUsers = async (req, res) => {
    try {
        const { role } = req.query; // Assuming role is passed as a query parameter

        let filter = {};
        if (role === 'admin') {
            filter = { role: 'admin' }; // Modify this according to your schema
        }

        // Fetch all users based on the filter
        const users = await UserModel.find(filter);

        // Count the total number of users based on the same filter
        const totalUsers = await UserModel.countDocuments(filter);

        if (!users || users.length === 0) {
            return res.status(404).json({
                message: 'No users found',
                success: false,
                data: { totalUsers: 0 } // Include totalUsers in response
            });
        }

        res.status(200).json({
            message: "Users fetched successfully",
            success: true,
            data: {
                users,
                totalUsers // Include totalUsers in response
            }
        });
    } catch (err) {
        console.error('Error fetching users:', err); // Log the error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const fetchUserCount = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        
        if (!token) {
            console.warn('No token provided');
        }

        const totalUsers = await UserModel.countDocuments();

        res.status(200).json({
            message: "Total number of users fetched successfully",
            success: true,
            data: { totalUsers }
        });
    } catch (err) {
        console.error('Error fetching user count:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



const fetchAllDeliveryBoys = async (req, res) => {
    try {
        const { role } = req.query;

        let filter = {};
        if (role === 'admin') {
            filter = { role: 'admin' };
        } else {
            filter = { role: 'deliveryBoy' };
        }

        // Fetch delivery boys based on the filter
        const deliveryBoys = await DeliveryBoyModel.find(filter);

        // Count all delivery boys
        const totalDeliveryBoys = await DeliveryBoyModel.countDocuments({ role: 'deliveryBoy' });

        if (!deliveryBoys || deliveryBoys.length === 0) {
            return res.status(404).json({
                message: 'No delivery boys found',
                success: false,
                count: 0,
                total: totalDeliveryBoys // Include total count of delivery boys
            });
        }

        res.status(200).json({
            message: "Delivery boys fetched successfully",
            success: true,
            data: deliveryBoys,
            count: deliveryBoys.length, // Count of filtered delivery boys
            total: totalDeliveryBoys // Total number of delivery boys
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const fetchDeliveryBoyCount = async (req, res) => {
    try {
        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminModel.findById(decoded._id);

        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Count the total number of delivery boys
        const totalDeliveryBoys = await DeliveryBoyModel.countDocuments({ role: 'deliveryBoy' });

        // Return the total number of delivery boys
        res.status(200).json({
            message: "Total number of delivery boys fetched successfully",
            success: true,
            data: { totalDeliveryBoys }
        });
    } catch (err) {
        console.error('Error fetching delivery boy count:', err); // Log the error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const fetchOrderCountsByStatus = async (req, res) => {
    try {
        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token', success: false });
        }

        const admin = await AdminModel.findById(decoded._id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Count the number of orders by status
        const [totalOrders, deliveredOrders, cancelledOrders, shippedOrders] = await Promise.all([
            OrderModel.countDocuments(), // Total orders
            OrderModel.countDocuments({ status: 'Delivered' }), // Delivered orders
            OrderModel.countDocuments({ status: 'Cancelled' }), // Cancelled orders
            OrderModel.countDocuments({ status: 'Shipped' }) // Shipped orders
        ]);

        // Return the counts of orders with different statuses
        res.status(200).json({
            message: "Order counts fetched successfully",
            success: true,
            data: {
                totalOrders,
                deliveredOrders,
                cancelledOrders,
                shippedOrders
            }
        });
    } catch (err) {
        console.error('Error fetching order counts:', err); // Log the error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const fetchProductCount = async (req, res) => {
    try {
        // Log the incoming request headers for debugging
        // console.log('Request Headers:', req.headers);

        // Check if the requester is an admin by verifying the token
        const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
        if (!token) {
            console.error('No token provided');
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        // console.log('Token found:', token);

        // Verify token and decode to get admin ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded Token:', decoded);

        const admin = await AdminModel.findById(decoded._id);
        // console.log('Admin Info:', admin);

        // Check if the user is an admin
        if (!admin || admin.role !== 'admin') {
            console.error('Not authorized or not an admin');
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // console.log('User is authorized as admin.');

        // Count the total number of products in the database
        const totalProducts = await ProductModel.countDocuments();
        // console.log('Total Products:', totalProducts);

        // Send back the product count
        res.status(200).json({
            message: "Total number of products fetched successfully!",
            success: true,
            data: { totalProducts }
        });
    } catch (err) {
        console.error('Error fetching product count:', err); // Log any potential error
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};









const createProduct = async (req, res) => {
    try {
        const { esp32_id, product_name, product_Id, product_Size, product_Description } = req.body;

        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded._id) {
            return res.status(401).json({ message: 'Invalid token', success: false });
        }

        const admin = await AdminModel.findById(decoded._id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Check if a product with the given esp32_id already exists
        const existingProduct = await ProductModel.findOne({ esp32_id });

        if (existingProduct) {
            return res.status(400).json({ message: 'Product with this ESP32 ID already exists', success: false });
        }

        // Create and save a new product if it doesn't exist
        const newProduct = new ProductModel({
            esp32_id,
            product_name,
            product_Id,
            product_Size,
            product_Description
        });
        await newProduct.save();

        res.status(201).json({
            message: 'Product created successfully',
            success: true,
            data: newProduct
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};




const fetchAllProducts = async (req, res) => {
    try {
        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminModel.findById(decoded._id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Fetch all products from the database
        const products = await ProductModel.find();

        // Return the list of products, even if none are found
        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            data: products
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const fetchAllProductsForUsers = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded._id);

        if (!user) {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Fetch products with status 'available'
        const products = await ProductModel.find({ status: 'available' }).lean(); // `.lean()` converts documents to plain JavaScript objects

        if (!products.length) {
            return res.status(404).json({ message: 'No available products found', success: true, data: [] });
        }

        res.status(200).json({
            message: "Available products fetched successfully",
            success: true,
            data: products
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};




const fetchProductById = async (req, res) => {
    try {
        const { id } = req.params; // Get the product ID from the route parameters

        // Ensure that id is defined and valid
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required', success: false });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID format', success: false });
        }

        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminModel.findById(decoded._id);

        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Fetch the product by ID from the database
        const product = await ProductModel.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found', success: false });
        }

        // Return the product details
        res.status(200).json({
            message: "Product fetched successfully",
            success: true,
            data: product
        });
    } catch (err) {
        console.error('Error fetching product:', err); // Log the error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// const fetchProductQuantities = async (req, res) => {
//     try {
//         // Check if the requester is an admin
//         const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer scheme
//         if (!token) {
//             return res.status(401).json({ message: 'No token provided', success: false });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const admin = await AdminModel.findById(decoded._id);

//         if (!admin || admin.role !== 'admin') {
//             return res.status(403).json({ message: 'Not authorized', success: false });
//         }

//         // Fetch all products
//         const products = await ProductModel.find(); // Get all products
//         if (!products) {
//             return res.status(404).json({ message: 'No products found', success: false });
//         }

//         // Calculate the total quantity of all products
//         const totalQuantity = products.reduce((sum, product) => sum + product.product_Quantity, 0);

//         // Return the total quantity of all products
//         res.status(200).json({
//             message: 'Total product quantity fetched successfully',
//             success: true,
//             data: { totalQuantity }
//         });
//     } catch (err) {
//         console.error('Error fetching product quantities:', err); // Log the error for debugging
//         res.status(500).json({
//             message: 'Internal server error',
//             success: false
//         });
//     }
// };



const editProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID', success: false });
        }

        const { status } = req.body;

        // console.log('Received status:', status);

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminModel.findById(decoded._id);

        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Updated list of valid statuses
        const validStatuses = ['assigned', 'available'];
        if (!status || !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid status', success: false });
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            { status: status.toLowerCase() },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found', success: false });
        }

        res.status(200).json({
            message: 'Product status updated successfully',
            success: true,
            data: updatedProduct
        });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};




const editUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid User ID', success: false });
        }

        const { name, username, email, password, contact, profileImage } = req.body; // Added `username`

        // Extract and verify token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await UserModel.findById(decoded._id);

        if (!currentUser) {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Check authorization
        if (currentUser._id.toString() !== id) {
            return res.status(403).json({ message: 'Not authorized to update this user', success: false });
        }

        // Prepare fields to update
        const updateFields = {};
        if (name) updateFields.name = name;
        if (username) updateFields.username = username; // Handle username update
        if (email) updateFields.email = email;
        if (contact) updateFields.contact = contact;
        if (password) {
            // Hash new password if provided
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password = hashedPassword;
        }

        // Handle profile image update or removal
        if (profileImage !== undefined) {
            // If an empty string is provided, clear the image
            updateFields.profileImage = profileImage === "" ? "" : profileImage;
        }

        // Perform update
        const updatedUser = await UserModel.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        res.status(200).json({
            message: 'User profile updated successfully',
            success: true,
            data: updatedUser
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};



const validateNewPassword = (password) => {
    const schema = Joi.string().min(5).max(12).required();
    const { error } = schema.validate(password);
    return error;
};

const changePassword = async (req, res) => {
    const { id, oldPassword, newPassword } = req.body;

    // Validate request input
    if (!id || !oldPassword || !newPassword) {
        console.error('Missing required fields:', { id });
        return res.status(400).json({
            message: 'User ID, old password, and new password are required.',
            success: false
        });
    }

    // Validate the new password
    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
        console.error('New password validation error:', passwordError.details);
        return res.status(400).json({
            message: 'New password does not meet the required criteria.',
            success: false
        });
    }

    try {
        // Fetch only the password field of the user by ID
        console.log('Fetching user by ID:', id);
        const user = await UserModel.findById(id, 'password');

        if (!user) {
            console.error('User not found:', id);
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Compare the old password with the stored hashed password
        console.log('Comparing old password with stored hashed password');
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            console.error('Old password does not match for user:', id);
            return res.status(400).json({
                message: 'Old password is incorrect',
                success: false
            });
        }

        // Hash the new password
        console.log('Hashing new password');
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;

        // Attempt to save the updated user
        console.log('Saving updated user:', id);
        await user.save();

        console.log('Password changed successfully for user:', id);
        return res.status(200).json({
            message: 'Password changed successfully',
            success: true
        });
    } catch (err) {
        console.error('Error changing password for user:', id, err); // Log the complete error object
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                success: false,
                details: err.errors
            });
        }
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Ensure productId is valid
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required', success: false });
        }

        // Delete the product
        const result = await ProductModel.findByIdAndDelete(productId);
        if (!result) {
            return res.status(404).json({ message: 'Product not found', success: false });
        }

        res.status(200).json({
            message: 'Product deleted successfully',
            success: true
        });
    } catch (err) {
        console.error('Error deleting product:', err.message); // Log the specific error message
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

       
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required', success: false });
        }

        // Delete the user
        const result = await UserModel.findByIdAndDelete(userId);
        if (!result) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            success: true
        });
    } catch (err) {
        console.error('Error deleting user:', err); // Log the full error object
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

const deleteDeliveryBoy = async (req, res) => {
    try {
        const deliveryBoyId = req.params.id;

        if (!deliveryBoyId) {
            return res.status(400).json({ message: 'Delivery Boy ID is required', success: false });
        }

        const result = await DeliveryBoyModel.findByIdAndDelete(deliveryBoyId);
        if (!result) {
            return res.status(404).json({ message: 'Delivery Boy not found', success: false });
        }

        res.status(200).json({
            message: 'Delivery Boy deleted successfully',
            success: true
        });
    } catch (err) {
        console.error('Error deleting delivery boy:', err.message);
        res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};



const fetchAllOrdersById = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const orders = await OrderModel.find({ customerId: userId }).populate('customerId', 'name email');

        // Return an empty array if no orders are found
        if (orders.length === 0) {
            return res.status(200).json({ orders: [] });
        }

        const customerIdFromOrder = orders[0].customerId._id.toString();
        if (customerIdFromOrder !== userId) {
            return res.status(400).json({ message: 'Mismatch in customer ID' });
        }

        res.status(200).json({ orders });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};






const cancelOrder = async (req, res) => {
    const { userId } = req.body;
    const { orderId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid user ID or order ID' });
        }

        // Find and update the order status to 'Cancelled'
        const order = await OrderModel.findOneAndUpdate(
            { _id: orderId, customerId: userId },
            { status: 'Cancelled' },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found or not authorized' });
        }

        // Validate and update the associated product status
        const esp32Id = order.esp32_id; // Use esp32_id from the order
        if (!mongoose.Types.ObjectId.isValid(esp32Id)) {
            return res.status(400).json({ message: 'Invalid ESP32 ID' });
        }

        const product = await ProductModel.findOne({ _id: esp32Id });
        if (!product) {
            return res.status(404).json({ message: 'Associated product not found' });
        }

        // Update product status to 'available'
        product.status = 'available'; // Set the status to available
        await product.save();

        // Send an email notification about the order cancellation
        if (order.senderEmail) {
            await sendCancellationEmail(order.senderEmail, order._id);
        } else {
            console.warn('No sender email found in order.');
        }

        res.status(200).json({
            message: 'Order canceled successfully, product status updated to available',
            productId: product._id
        });
    } catch (err) {
        console.error('Error during cancel order:', err);
        res.status(500).json({ message: 'Failed to cancel order and update product', error: err.message });
    }
};

// Function to send a cancellation email
const sendCancellationEmail = async (recipientEmail, orderId) => {
    const nodemailer = require('nodemailer');
    
    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email from .env
            pass: process.env.EMAIL_PASS, // Your password from .env
        },
    });

    const mailOptions = {
        from: `Smart Box using IoT <${process.env.EMAIL_USER}>`, // Sender address from .env
        to: recipientEmail, // Recipient's email
        subject: 'Smart Box using IOT - Order Cancellation Confirmation',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Your Order QR Code</h1>
                    </div>
                <p style="font-size: 16px; color: #333;">
                    Dear Customer,
                </p>
                <p style="font-size: 16px; color: #333;">
                    We wanted to let you know that your order with the ID <strong style="color: #555;">#${orderId}</strong> has been successfully cancelled.
                </p>
                <p style="font-size: 16px; color: #333;">
                    We're sorry to see this order go, but if you need any assistance or have any questions, feel free to reach out to our support team. We're always here to help.
                </p>
                <p style="font-size: 16px; color: #333;">
                    Thank you for choosing us, and we hope to serve you again soon.
                </p>
               <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #3B82F6;">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
            </div>
        `,
    };
    

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        // console.log(`Cancellation email sent to: ${recipientEmail}`);
    } catch (error) {
        // console.error('Error sending email:', error.message);
        // throw new Error('Email sending failed');
    }
};

// const getGpsData = async (req, res) => {
//     try {
//         // Get the order ID from query parameters
//         const { orderId } = req.query;

//         if (!orderId) {
//             return res.status(400).json({ message: 'Order ID is required' });
//         }

//         // Validate the order ID format
//         if (!mongoose.Types.ObjectId.isValid(orderId)) {
//             return res.status(400).json({ message: 'Invalid Order ID format' });
//         }

//         // Find the order by ID and populate the esp32Id field with GPS data
//         const order = await OrderModel.findById(orderId).populate('esp32Id', 'gpsData');

//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         // Extract GPS data from the populated esp32Id
//         const gpsData = order.esp32Id ? order.esp32Id.gpsData : null;

//         if (!gpsData) {
//             return res.status(404).json({ message: 'GPS data not found for this order' });
//         }

//         // Send the GPS data as a response
//         res.json(gpsData);
//     } catch (error) {
//         console.error('Error fetching GPS data:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };



const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status, role, deliveryBoyId } = req.body;

    console.log(`Received request to update order ${orderId} with status: ${status} by user role: ${role}`);

    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        console.error('Invalid status provided:', status);
        return res.status(400).json({ success: false, message: 'Invalid status. Only "Pending", "Shipped", "Delivered", and "Cancelled" are allowed.' });
    }

    try {
        const order = await OrderModel.findById(orderId);
        console.log('Order fetched:', order);

        if (!order) {
            console.error('Order not found for ID:', orderId);
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        if (role !== 'admin' && role !== 'deliveryBoy') {
            console.error('Unauthorized access attempt by role:', role);
            return res.status(403).json({ success: false, message: 'Unauthorized to update order status.' });
        }

        // Update the order's status
        order.status = status;
        await order.save();
        console.log('Order status updated to:', status);

        // Send an email notification if the status is 'Cancelled'
        if (status === 'Cancelled') {
            const recipientEmail = order.senderEmail;
            const deliveryBoyId = order.deliveryBoyId // Assume order has a customerEmail field
            await sendOrderCancellationEmail(recipientEmail, orderId, role, deliveryBoyId); // Call the new function
        } else if (status === 'Delivered') {
            const recipientEmail = order.senderEmail; // Assume order has a customerEmail field
            await sendDeliveryEmail(recipientEmail, orderId); // Call the sendDeliveryEmail function
        }else if (status === 'Shipped') {
            const recipientEmail = order.senderEmail; // Assume order has a customerEmail field
            await sendShippedEmail(recipientEmail, orderId); // Call the sendDeliveryEmail function
        }

        // Validate and update the associated product status
        const esp32Id = order.esp32_id;
        if (!mongoose.Types.ObjectId.isValid(esp32Id)) {
            console.error('Invalid ESP32 ID:', esp32Id);
            return res.status(400).json({ success: false, message: 'Invalid ESP32 ID' });
        }

        const product = await ProductModel.findOne({ _id: esp32Id });
        console.log('Product fetched for order by esp32_id:', product);

        if (!product) {
            console.error('Associated product not found for esp32_id:', esp32Id);
            return res.status(404).json({ success: false, message: 'Associated product not found' });
        }

        let newProductStatus;
        if (status === 'Delivered' || status === 'Cancelled') {
            newProductStatus = 'available';
        } else {
            newProductStatus = 'assigned';
        }

        console.log(`Updating product status to '${newProductStatus}' due to order status: ${status}`);
        product.status = newProductStatus;
        await product.save();
        console.log('Product status updated to:', product.status);

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


const sendOrderCancellationEmail = async (recipientEmail, orderId, role, deliveryBoyId) => {
    const nodemailer = require('nodemailer');

    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email from .env
            pass: process.env.EMAIL_PASS, // Your password from .env
        },
    });

    let subject;
    let htmlContent;

    // Define subject and HTML content based on the role
    if (role === 'admin') {
        subject = 'Smart Box using IoT - Order Cancellation Notification from Admin';
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Order Cancellation Alert</h1>
    </div>
    <p style="font-size: 16px; color: #333;">
        Dear Customer,
    </p>
    <p style="font-size: 16px; color: #333;">
        We regret to inform you that your order with the ID <strong style="color: #555;">#${orderId}</strong> has been cancelled by the admin.
    </p>
    <p style="font-size: 16px; color: #333;">
        Please review your order history for more details.
    </p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #ff4d4f;">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
</div>

        `;
    } else if (role === 'deliveryBoy') {
        subject = 'Smart Box using IoT - Order Cancellation Notification from Delivery Personnel';
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Order Cancellation Notification</h1>
    </div>
    <p style="font-size: 16px; color: #333;">
        Dear Customer,
    </p>
    <p style="font-size: 16px; color: #333;">
        We regret to inform you that your order with the ID <strong style="color: #555;">#${orderId}</strong> has been cancelled by the delivery personnel.
    </p>
    <p style="font-size: 16px; color: #333;">
        Delivery Personnel ID: <strong style="color: #555;">${deliveryBoyId}</strong>
    </p>
    <p style="font-size: 16px; color: #333;">
        Please feel free to reach out to us if you have any questions or need further assistance.
    </p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #ff4d4f;">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
</div>


        `;
    } else {
        throw new Error('Invalid role provided. Valid roles are: admin, deliveryBoy.');
    }

    const mailOptions = {
        from: `Smart Box using IoT <${process.env.EMAIL_USER}>`, // Sender address from .env
        to: recipientEmail, // Recipient's email
        subject: subject, // Dynamic subject based on role
        html: htmlContent, // Dynamic HTML content based on role
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Cancellation email sent to: ${recipientEmail}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Email sending failed');
    }
};


const updateBoxStatus = async (req, res) => {
    const { orderId } = req.params;
    const { boxStatus, role } = req.body; // Only keep boxStatus in the destructured body

    console.log(`Received request to update box status for order ${orderId} by user role: ${role}`);

    // Validate input
    const validBoxStatuses = ['Closed', 'Opened'];
    if (boxStatus && !validBoxStatuses.includes(boxStatus)) {
        console.error('Invalid box status provided:', boxStatus);
        return res.status(400).json({ success: false, message: 'Invalid box status. Only "Closed" and "Opened" are allowed.' });
    }

    try {
        const order = await OrderModel.findById(orderId);
        console.log('Order fetched:', order);

        if (!order) {
            console.error('Order not found for ID:', orderId);
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Check user role
        if (role !== 'admin' && role !== 'deliveryBoy') {
            console.error('Unauthorized access attempt by role:', role);
            return res.status(403).json({ success: false, message: 'Unauthorized to update box status.' });
        }

        // Update the box status
        if (boxStatus) {
            order.boxStatus = boxStatus; // Update only boxStatus
            console.log('Box status updated to:', boxStatus);
        }

        await order.save(); // Save the changes to the order
        res.status(200).json({ success: true, data: order }); // Respond with the updated order
    } catch (error) {
        console.error('Error updating box status:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


const updateBoxStatusReceiver = async (req, res) => {
    const { orderId } = req.params;
    const { receiverBoxStatus, role } = req.body; // Updated variable name

    console.log(`Received request to update receiver box status for order ${orderId} by user role: ${role}`);

    // Validate input
    const validBoxStatuses = ['Closed', 'Opened'];
    if (receiverBoxStatus && !validBoxStatuses.includes(receiverBoxStatus)) { // Updated variable name
        console.error('Invalid receiver box status provided:', receiverBoxStatus); // Updated variable name
        return res.status(400).json({ success: false, message: 'Invalid receiver box status. Only "Closed" and "Opened" are allowed.' });
    }

    try {
        const order = await OrderModel.findById(orderId);
        console.log('Order fetched:', order);

        if (!order) {
            console.error('Order not found for ID:', orderId);
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Check user role
        if (role !== 'admin' && role !== 'deliveryBoy') {
            console.error('Unauthorized access attempt by role:', role);
            return res.status(403).json({ success: false, message: 'Unauthorized to update receiver box status.' });
        }

        // Update the receiver's box status if provided
        if (receiverBoxStatus) { // Updated variable name
            order.receiverBoxStatus = receiverBoxStatus; // Update to new status
            console.log('Receiver box status updated to:', receiverBoxStatus); // Updated variable name
        } else {
            console.log('No receiver box status provided; no update made.'); // Updated variable name
        }

        await order.save();
        console.log('Order saved successfully:', order);
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Error updating receiver box status:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const sendDeliveryEmail = async (recipientEmail, orderId) => {
    const nodemailer = require('nodemailer');

    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email from .env
            pass: process.env.EMAIL_PASS, // Your password from .env
        },
    });

    const mailOptions = {
        from: `Smart Box using IoT <${process.env.EMAIL_USER}>`, // Sender address from .env
        to: recipientEmail, // Recipient's email
        subject: 'Smart Box using IOT - Order Delivery Confirmation',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Your Order Has Been Delivered!</h1>
                </div>
                <p style="font-size: 16px; color: #333;">
                    Dear Customer,
                </p>
                <p style="font-size: 16px; color: #333;">
                    We are pleased to inform you that your order with the ID <strong style="color: #555;">#${orderId}</strong> has been successfully delivered.
                </p>
                <p style="font-size: 16px; color: #333;">
                    We hope you enjoy your purchase! If you have any questions or need further assistance, please don't hesitate to contact our support team.
                </p>
                <p style="font-size: 16px; color: #333;">
                    Thank you for choosing us, and we look forward to serving you again!
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 14px; color: #888; text-align: center;">
                    If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #3B82F6;">support@example.com</a>.
                </p>
                <p style="font-size: 14px; color: #888; text-align: center;">
                    © 2024 Smart Box using IOT All rights reserved.
                </p>
            </div>
        `,
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Delivery email sent to: ${recipientEmail}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Email sending failed');
    }
};

const sendShippedEmail = async (recipientEmail, orderId) => {
    const nodemailer = require('nodemailer');

    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email from .env
            pass: process.env.EMAIL_PASS, // Your password from .env
        },
    });

    const mailOptions = {
        from: `Smart Box using IoT <${process.env.EMAIL_USER}>`, // Sender address from .env
        to: recipientEmail, // Recipient's email
        subject: 'Smart Box using IoT - Order Shipped Confirmation',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Your Order Has Been Shipped!</h1>
                </div>
                <p style="font-size: 16px; color: #333;">
                    Dear Customer,
                </p>
                <p style="font-size: 16px; color: #333;">
                    We are pleased to inform you that your order with the ID <strong style="color: #555;">#${orderId}</strong> has been successfully shipped.
                </p>
                <p style="font-size: 16px; color: #333;">
                    Your order will be delivered soon to the following address:
                </p>
                <p style="font-size: 16px; color: #333;">
                    <strong style="color: #555;">Receiver's Address</strong> <!-- Add the recipient's address here -->
                </p>
                <p style="font-size: 16px; color: #333;">
                    We hope you enjoy your purchase! If you have any questions or need further assistance, please don't hesitate to contact our support team.
                </p>
                <p style="font-size: 16px; color: #333;">
                    Thank you for choosing us, and we look forward to serving you again!
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 14px; color: #888; text-align: center;">
                    If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #3B82F6;">support@example.com</a>.
                </p>
                <p style="font-size: 14px; color: #888; text-align: center;">
                    © 2024 Smart Box using IoT. All rights reserved.
                </p>
            </div>
        `,
    };
    

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Delivery email sent to: ${recipientEmail}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Email sending failed');
    }
};






// const updateEarnings = async (deliveryBoyId) => {
//     const amountToAdd = 100; // Fixed amount to add

//     try {
//         // Log the parameters for debugging
//         console.log(`Updating earnings for delivery boy ID: ${deliveryBoyId} by amount: Rs ${amountToAdd}`);

//         // Fetch the delivery boy by ID
//         const deliveryBoy = await DeliveryBoyModel.findById(deliveryBoyId);
//         if (!deliveryBoy) {
//             console.error('Delivery boy not found for ID:', deliveryBoyId);
//             return { success: false, message: 'Delivery boy not found.' };
//         }

//         // Add Rs 100 to earnings
//         deliveryBoy.earnings = (deliveryBoy.earnings || 0) + amountToAdd; // Initialize to 0 if undefined
//         await deliveryBoy.save();

//         console.log('Delivery boy earnings updated to:', deliveryBoy.earnings);
//         return { success: true, earnings: deliveryBoy.earnings };
//     } catch (error) {
//         console.error('Error updating earnings:', error);
//         return { success: false, message: 'Internal server error.' };
//     }
// };















const updateProductQuantity = async (productId, quantity, status) => {
    try {
        // Find the product by ID
        const product = await ProductModel.findById(productId);

        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        // Ensure quantity is a number
        const currentQuantity = Number(product.product_Quantity);
        const updateQuantity = Number(quantity);

        if (isNaN(currentQuantity) || isNaN(updateQuantity)) {
            console.error('Invalid product quantity:', { currentQuantity, updateQuantity });
            return;
        }

        // Update the product's quantity
        if (status === 'Delivered' || status === 'Cancelled') {
            product.product_Quantity = currentQuantity + updateQuantity; // Increase quantity if delivered or cancelled
        }

        // Ensure quantity does not go negative
        if (product.product_Quantity < 0) {
            product.product_Quantity = 0;
        }

        await product.save();
        // console.log('Updated product quantity:', product.product_Quantity);
    } catch (error) {
        console.error('Error updating product quantity:', error);
    }
};











const createOrder = async (req, res) => {
    try {
        // Destructure the incoming request body
        const {
            customerId,
            productName,
            size,
            deliveryTime,
            deliveryAddress,
            currentAddress,
            price,
            senderEmail,
            receiverEmail,
            receiverName, // New field for receiver's name
            receiverContactNumber // New field for receiver's contact number
        } = req.body;

        // Check for required fields
        const requiredFields = [customerId, productName, size, deliveryAddress, currentAddress, price, senderEmail, receiverEmail, receiverName, receiverContactNumber];
        if (requiredFields.some(field => !field)) {
            return res.status(400).json({ message: 'Missing required fields', success: false });
        }

        // Check for token in the headers
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        // Verify token and decode user information
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token', success: false });
        }

        // Check if the decoded token contains a valid user ID
        if (!decoded._id) {
            return res.status(401).json({ message: 'Invalid token payload', success: false });
        }

        // Find the user associated with the token
        const user = await UserModel.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Find an available ESP32 device
        const availableDevice = await ProductModel.findOne({ status: 'available' });
        if (!availableDevice) {
            return res.status(404).json({ message: 'No available ESP32 devices', success: false });
        }

        // Create the new order and link the ESP32 device
        const newOrder = new OrderModel({
            productName,
            size,
            deliveryTime,
            customerId,
            deliveryAddress,
            currentAddress,
            price,
            esp32_id: availableDevice._id, // Link the available ESP32 device
            senderEmail,
            receiverEmail,
            receiverName, // Include receiver's name
            receiverContactNumber, // Include receiver's contact number
            boxStatus: 'Closed' // Default box status
        });

        // Save the new order to the database
        await newOrder.save();

        // Mark the ESP32 device as assigned and update its status
        availableDevice.status = 'assigned';
        availableDevice.assignedUserId = customerId;
        await availableDevice.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use 'gmail' for Gmail
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS,  // Your email password or app password
            },
        });
        
        // Generate QR code as buffer (binary data)
        const qrCodeData = `${newOrder._id}`;
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeData); // Generate QR code as a buffer

        // Use uuid to create a unique file name for the QR code
        const uniqueFileName = `${uuidv4()}.png`;

        // Prepare email for sender
        const senderMailOptions = {
            from: `Smart Box using IoT <${process.env.EMAIL_USER}>`,
            to: senderEmail,
            subject: 'Your Order QR Code - Smart Box using IoT',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Your Order QR Code</h1>
                    </div>
                    <div style="padding: 20px; text-align: left;">
                        <p style="font-size: 18px; color: #555;">Dear ${user.name},</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Thank you for placing your order with <strong>Smart Box using IoT</strong>! We appreciate your business.
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your order ID is: <strong>${newOrder._id}</strong>
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Please find your unique QR code below. You can scan this code to access your box using this QR Code.
                        </p>
                        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; margin: 20px 0; border-radius: 8px;">
                            <img src="cid:qrCodeImage" alt="QR Code" style="width: 200px; height: 200px;" />
                        </div>
                        <h3 style="color: #0044cc;">Steps to Unlock Your Order:</h3>
                        <div style="padding-left:4px;">
                        <ol style="font-size: 16px; line-height: 1.6; color: #555;">
                        
                             
    <li>Visit the <strong>My Orders</strong> page on our <strong>website</strong>.</li> <li>Plug the <strong>red USB pin</strong> into the <strong>USB 1 slot</strong> on the power bank.</li> <li>Click on the <strong>Unlock</strong> button. A camera window will open.</li> <li>Scan the <strong>QR code</strong> displayed on the camera inside the box. The box will unlock.</li> <li>Place the item you want to transfer inside the box, and it will automatically close after <strong>30 seconds</strong>.</li> <li>After the box is closed, unplug the <strong>red USB pin</strong>.</li> 


                        </ol>
                        </div>
                       <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color:#3b82f6">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
                    </div>
                    
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: uniqueFileName,  // Unique file name generated using uuid
                    content: qrCodeBuffer,     // The buffer containing the QR code image
                    cid: 'qrCodeImage'         // Same cid as in the HTML <img> tag
                }
            ]
        };
        
        
        

        // Prepare email for receiver
        const receiverMailOptions = {
            from: `Smart Box using IoT <${process.env.EMAIL_USER}>`,
            to: receiverEmail,
            subject: 'Order Confirmation - Smart Box using IoT',
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
                    </div>
                    <div style="padding: 20px; text-align: left;">
                        <p style="font-size: 18px; color: #555;">Dear Customer,</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your order has been successfully confirmed with <strong>Smart Box using IoT</strong>. Thank you for choosing us!
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your order ID is: <strong>${newOrder._id}</strong> <!-- Insert order ID dynamically -->
                        </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Please find your unique QR code below. You can scan this code to access your box.
                        </p>
                        <div style="text-align: center; padding: 20px; background-color: #f4f4f4; margin: 20px 0; border-radius: 8px;">
                            <img src="cid:qrCodeImage" alt="QR Code" style="width: 200px; height: 200px;" />
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            To unlock the box, click the link below:
                        </p>
                        <p style="text-align: center;">
    <a href="http://192.168.241.211:5173/unlockreceiver/${newOrder._id}" 
       style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #3B82F6; text-decoration: none; border-radius: 5px;">
        Unlock Your Smart Box
    </a>
</p>

                        <h3 style="color: #0044cc;">Steps to Access Your Smart Box:</h3>
                        <div style="padding-left:4px;">
                        <ol style="font-size: 16px; line-height: 1.6; color: #555;">
    <li><strong>Connect the red USB pin to the USB 1 slot on the power bank.</strong></li>
    <li><strong>Click the link above</strong> to access the camera on the box.</li>
    <li><strong>Present the QR code</strong> to the camera inside the box, and it will unlock.</li>
    <li><strong>Place the item</strong> you wish to transfer inside the box, and it will automatically close.</li>
    <li><strong>Once the box is closed, disconnect the red USB pin.</strong></li>
</ol>



                        
                        </div>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color:#3b82f6">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
                </div>
            </div>
            `,
            attachments: [
                {
                    filename: uniqueFileName,  // Unique file name generated using uuid
                    content: qrCodeBuffer,     // The buffer containing the QR code image
                    cid: 'qrCodeImage'         // Same cid as in the HTML <img> tag
                }
            ]
        };
        
        
        

        // Send email to the sender
        await transporter.sendMail(senderMailOptions);
        console.log('QR code email sent successfully to:', senderEmail);

        // Send email to the receiver
        await transporter.sendMail(receiverMailOptions);
        console.log('Order confirmation email sent successfully to:', receiverEmail);

        // Send a success response with the created order details
        res.status(201).json({
            message: 'Order created successfully and emails sent',
            success: true,
            data: newOrder,
        });
    } catch (err) {
        // Log the error and return an internal server error response
        console.error('Error creating order:', err);
        res.status(500).json({
            message: 'Internal server error',
            success: false,
        });
    }
};
















const fetchAllOrders = async (req, res) => {
    try {
        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminModel.findById(decoded._id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Fetch all orders from the database
        const orders = await OrderModel.find();

        // Return the list of orders, even if none are found
        res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            data: orders
        });
    } catch (err) {
        console.error('Error fetching orders:', err); // Log error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const assignOrderToDeliveryBoy = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;

        // Check if the required fields are provided
        if (!orderId || !deliveryBoyId) {
            console.warn('Missing required fields: orderId or deliveryBoyId');
            return res.status(400).json({ message: 'Order ID and Delivery Boy ID are required', success: false });
        }

        // Check if the requester is an admin
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            console.warn('No token provided');
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            console.error('Token verification failed:', jwtErr);
            return res.status(401).json({ message: 'Invalid token', success: false });
        }

        const admin = await AdminModel.findById(decoded._id);
        if (!admin || admin.role !== 'admin') {
            console.warn('Unauthorized access attempt by non-admin user');
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Check if the order exists
        const order = await OrderModel.findById(orderId);
        if (!order) {
            console.warn('Order not found:', orderId);
            return res.status(404).json({ message: 'Order not found', success: false });
        }

        // Check if the delivery boy exists
        const deliveryBoy = await DeliveryBoyModel.findById(deliveryBoyId);
        if (!deliveryBoy) {
            console.warn('Delivery Boy not found:', deliveryBoyId);
            return res.status(404).json({ message: 'Delivery Boy not found', success: false });
        }

        // Assign the order to the delivery boy
        deliveryBoy.assignedOrders.push(orderId); // Assuming assignedOrders is an array in the DeliveryBoy schema
        await deliveryBoy.save();
        console.log('Updated delivery boy with assigned order:', deliveryBoyId);

        // Update the order with the delivery boy's ID
        order.deliveryBoyId = deliveryBoyId; // Assign the deliveryBoyId to the order
        await order.save(); // Save the updated order
        console.log('Updated order with delivery boy ID:', orderId);

        res.status(200).json({
            message: "Order assigned to the delivery boy successfully",
            success: true,
            data: {
                orderId: orderId,
                deliveryBoyId: deliveryBoyId,
            }
        });
    } catch (err) {
        console.error('Error assigning order to delivery boy:', err); // Log error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};




const getAssignedOrders = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params; // Extract the deliveryBoyId from the request params

    if (!deliveryBoyId) {
      return res.status(400).json({ success: false, message: 'Delivery boy ID is required' });
    }

    // Find orders where the deliveryBoyId matches
    const orders = await OrderModel.find({ deliveryBoyId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders assigned to this delivery boy' });
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching assigned orders',
    });
  }
};





  

// const createGpsSignal = async (req, res) => {
//     try {
//       const { userId, latitude, longitude, altitude, speed, heading, accuracy, additionalInfo } = req.body;
  
//       const newGpsSignal = new GpsSignal({
//         userId,
//         latitude,
//         longitude,
//         altitude: altitude || null,
//         speed: speed || null,
//         heading: heading || null,
//         accuracy: accuracy || null,
//         additionalInfo: additionalInfo || {}
//       });
  
//       const savedGpsSignal = await newGpsSignal.save();
//       res.status(201).json({
//         success: true,
//         data: savedGpsSignal
//       });
//     } catch (error) {
//       console.error('Error creating GPS signal:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Server error'
//       });
//     }
//   };
  
//   // Update an existing GPS signal
//  const updateGpsSignal = async (req, res) => {
//     try {
//       const { id } = req.params; // The ID of the GPS signal to update
//       const updates = req.body; // Object containing fields to update
  
//       const updatedGpsSignal = await GpsSignal.findByIdAndUpdate(id, updates, { new: true });
  
//       if (!updatedGpsSignal) {
//         return res.status(404).json({
//           success: false,
//           message: 'GPS signal not found'
//         });
//       }
  
//       res.status(200).json({
//         success: true,
//         data: updatedGpsSignal
//       });
//     } catch (error) {
//       console.error('Error updating GPS signal:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Server error'
//       });
//     }
//   };

// const getGpsData = async (req, res) => {
//     try {
//       // Extract orderId from the request query
//       const { orderId } = req.query;
  
//       if (!orderId) {
//         return res.status(400).send({ message: "Order ID is required" });
//       }
  
//       // Step 1: Search for the orderId in the OrderModel
//       const order = await OrderModel.findOne({ _id: orderId });
  
//       if (!order) {
//         return res.status(404).send({ message: "No order found for this Order ID" });
//       }
  
//       // Step 2: Extract esp32_id from the order
//       const { esp32_id } = order;
  
//       if (!esp32_id) {
//         return res.status(400).send({ message: "No ESP32 ID associated with this order" });
//       }
  
//       // Step 3: Search for the esp32_id in the ProductModel
//       const product = await ProductModel.findOne({ esp32_id });
  
//       if (!product) {
//         return res.status(404).send({ message: "No product found for this ESP32 ID" });
//       }
  
//       // Step 4: Compare esp32_id from latestGpsData and ProductModel
//       if (product.esp32_id === esp32_id) {
//         // Assuming latestGpsData contains the current ESP32 ID and GPS data
//         res.send(latestGpsData); // Send the latest GPS data if IDs match
//       } else {
//         res.status(400).send({ message: "ESP32 ID mismatch" });
//       }
  
//     } catch (error) {
//       console.error("Error fetching GPS data:", error);
//       res.status(500).send({ message: "Internal server error" });
//     }
//   };

const fetchDeliveryBoyOrders = async (req, res) => {
    try {
        // Check for the Bearer token in the authorization header
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }

        // Verify the token and get the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch the delivery boy using the ID from the token
        const deliveryBoy = await DeliveryBoyModel.findById(decoded._id);
        if (!deliveryBoy) {
            return res.status(403).json({ message: 'Not authorized', success: false });
        }

        // Fetch orders associated with the delivery boy
        const orders = await OrderModel.find({ deliveryBoyId: deliveryBoy._id });

        // Log the orders received from the database
        console.log('Fetched orders:', orders); // Log the orders for debugging

        // Return the list of orders, even if none are found
        res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            data: orders
        });
    } catch (err) {
        console.error('Error fetching orders:', err); // Log error for debugging
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const orderForReceiver = async (req, res) => {
    try {
        // Get orderId from the route parameters
        const { orderId } = req.params; 
        // console.log("Received request for Order ID:", orderId); // Debugging line

        // Validate orderId
        if (!orderId) {
            console.warn("Order ID is missing in the request."); // Debugging warning
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Fetch the order from the database using the Order model
        const order = await OrderModel.findById(orderId);
        // console.log("Fetched order from database:", order); // Debugging line

        // If order not found, return a 404 status with a message
        if (!order) {
            console.warn(`Order not found for ID: ${orderId}`); // Debugging warning
            return res.status(404).json({ message: 'Order not found' });
        }

        // If order is found, send it as JSON response
        res.status(200).json(order);
        // console.log("Successfully sent order details:", order); // Debugging line
    } catch (error) {
        // Log error and return 500 status if a server error occurs
        console.error('Error fetching order:', error); // Error logging
        res.status(500).json({ message: 'Server error' });
    }
};













module.exports = {
    signup,
    login,
    adminsignup,
    fetchAdminById,
    fetchAllUsers,
    createProduct,
    fetchAllProducts,
    deleteProduct,
    deleteUser,
    fetchAllOrdersById,
    fetchUserById,
    editProduct,
    fetchProductById,
    editUser ,
    changePassword,
    fetchAllProductsForUsers,
    deliveryBoySignup,
    fetchDeliveryBoyById,
    fetchAllDeliveryBoys,
    deleteDeliveryBoy,
    // fetchProductQuantities,
    fetchUserCount,
    fetchDeliveryBoyCount,
    createOrder,
    cancelOrder,
    fetchAllOrders,
    updateOrderStatus,
    updateProductQuantity ,
    fetchOrderCountsByStatus,
    assignOrderToDeliveryBoy,
    getAssignedOrders,
    fetchDeliveryBoyOrders,
    verifySignup,
    orderForReceiver,
    fetchProductCount,
    updateBoxStatus,
    updateBoxStatusReceiver
    // getGpsData
    // getGpsData
    // uploadImage
}