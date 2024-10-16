const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const OrderModel = require('./models/order'); // Adjust the path as necessary
const ProductModel = require('./models/products'); // Adjust the path as necessary
const http = require('http'); // Ensure this is included
const { exec, spawn } = require('child_process');
const nodemailer = require('nodemailer');
const path = require('path');


require('dotenv').config();
require('./models/db');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173/', 
    'https://smart-box-using-iot.netlify.app/'
];

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json());

// Ping route for health check
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// Serve static files from the frontend dist folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/', 'index.html'));
});

app.use((req, res, next) => {
    if (req.path.endsWith('.js') || req.path.endsWith('.jsx')) {
        res.type('application/javascript'); // Set MIME type for JS/JSX files
    }
    next();
});

// Serve index.html for all other requests

// Auth routes
app.use('/auth', authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


let latestGpsData = { latitude: null, longitude: null, unique_key: null };


app.post('/gps', (req, res) => {
    const { latitude, longitude, unique_key } = req.body;

  
    // console.log(`Received GPS Data: Latitude: ${latitude}, Longitude: ${longitude}, Unique Key: ${unique_key}`);

    latestGpsData = { latitude, longitude, unique_key };
    console.log("Updated latest GPS data:", latestGpsData); 
    res.send('GPS data received');
});

app.post('/receivedlocation', async (req, res) => {
    try {
        console.log("Received request:", req.body); 

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).send({ message: "Order ID is required" });
        }

        const order = await OrderModel.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).send({ message: "No order found for this Order ID" });
        }

        const { esp32_id } = order;

        if (!esp32_id) {
            return res.status(400).send({ message: "No ESP32 ID associated with this order" });
        }

        // Log latest GPS data
        // console.log('Latest GPS Data:', latestGpsData);

        // Access latestGpsData
        if (!latestGpsData || !latestGpsData.unique_key) {
            return res.status(400).send({ message: "No unique key found in latest GPS data" });
        }

        // Check if the product exists by esp32_id
        const product = await ProductModel.findOne({ esp32_id: latestGpsData.unique_key });

        // console.log('Product found:', product);
        
        if (!product) {
            return res.status(404).send({ message: `No product found for unique key: ${latestGpsData.unique_key}` });
        }

        // Return the latest GPS data
        return res.send(latestGpsData);
    } catch (error) {
        console.error("Error in /receivedlocation:", error); // Log the error
        return res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

app.get('/getLatestGPS/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).send({ message: "Order ID is required" });
        }

        const order = await OrderModel.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).send({ message: "No order found for this Order ID" });
        }

        const { esp32_id } = order;

        if (!esp32_id) {
            return res.status(400).send({ message: "No ESP32 ID associated with this order" });
        }

        // Check if latest GPS data exists
        if (!latestGpsData || latestGpsData.unique_key !== esp32_id) {
            return res.status(404).send({ message: "No GPS data available for this order" });
        }

        // Send the latest GPS data back to the client
        return res.status(200).send({
            message: "Latest GPS data retrieved successfully",
            data: latestGpsData
        });
    } catch (error) {
        console.error("Error in /getLatestGPS:", error); // Log the error
        return res.status(500).send({ message: "Internal server error", error: error.message });
    }
});


app.get('/receivedlocation/gps', (req, res) => {
    res.send(latestGpsData);
});





let fetchedOrderId; // Variable to hold the fetched orderId
let pythonProcess; // Variable to hold the Python process
let lastToggleTime = 0; // Initialize to a default value
const TOGGLE_INTERVAL = 30 * 1000;  // Interval for toggling the servo (5 seconds)
 // Interval for toggling the servo

// Function to toggle the servo motor
const toggleServoMotor = async () => {
    return new Promise((resolve, reject) => {
        const esp32Url = 'http://192.168.241.179/operate'; // Adjust the IP address and endpoint as needed
        const postData = JSON.stringify({ command: "TOGGLE" });

        const options = {
            hostname: '192.168.241.179',
            port: 80,
            path: '/operate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const esp32Req = http.request(options, (response) => {
            let responseData = '';

            response.on('data', (chunk) => {
                responseData += chunk;
            });

            response.on('end', () => {
                console.log(`ESP32 response: ${responseData}`);
                resolve(`Servo motor operated successfully`);
            });
        });

        esp32Req.on('error', (error) => {
            console.error(`Error sending signal to ESP32: ${error}`);
            reject('Failed to communicate with ESP32');
        });

        esp32Req.write(postData);
        esp32Req.end();
    });
};

// Function to run a Python script

const runPythonScript = (scriptPath) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python script output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python script error: ${data}`);
        });

        pythonProcess.on('exit', (code) => {
            console.log(`Python script exited with code: ${code}`);
            resolve(`Script executed successfully.`);
        });

        pythonProcess.on('error', (error) => {
            console.error(`Error starting Python script: ${error}`);
            reject('Error executing script.');
        });

        // Set a timeout to kill the process after 20 seconds
        const timeout = setTimeout(() => {
            pythonProcess.kill(); // Terminate the Python process
            console.log('Python script terminated after 20 seconds.');
            reject('Script execution timed out after 20 seconds.');
        }, 20000); // 20000 milliseconds = 20 seconds

        // Clear the timeout if the process exits before the timeout
        pythonProcess.on('exit', (code) => {
            clearTimeout(timeout);
        });
    });
};


// Endpoint to run the main Python script
app.post('/runScript', async (req, res) => {
    const scriptPath = './script.py'; // Ensure this path is correct
    try {
        const message = await runPythonScript(scriptPath);
        res.send(message);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint to run the receiver Python script
app.post('/runReceiverScript', async (req, res) => {
    const receiverScriptPath = './receiver.py'; // Ensure this path is correct
    try {
        const message = await runPythonScript(receiverScriptPath);
        res.send(message);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Function to handle requests for the main operation
const handleRequest = async (req, res) => {
    const data = req.body.data; // This is the QR code data
    const orderId = req.body.orderId; // This is the orderId received in the request body

    console.log('Received QR code data:', data);

    // If orderId is received, store it in fetchedOrderId
    if (orderId) {
        fetchedOrderId = orderId; // Store the fetched orderId
        console.log('Received order ID:', fetchedOrderId);
    }

    // Check if both the data and fetchedOrderId are available before comparing
    if (data && fetchedOrderId) {
        // Compare the QR code data with the fetched orderId
        if (data === fetchedOrderId || data === admin) {
            const currentTime = Date.now(); // Get the current time

            // Check if 30 seconds have passed since the last toggle command
            if (currentTime - lastToggleTime >= TOGGLE_INTERVAL) {
                try {
                    // Send the TOGGLE command since data matches orderId
                    await toggleServoMotor(); // Pass "TOGGLE" as the command
                    lastToggleTime = currentTime; // Update the last toggle time

                    // Update the boxStatus to 'Opened' in the database
                    await OrderModel.findByIdAndUpdate(fetchedOrderId, { boxStatus: 'Opened' });

                    console.log(`Order ${fetchedOrderId} boxStatus updated to 'Opened'.`);

                    // Respond with a success message
                    res.send({
                        success: true,
                        message: 'Your box has been opened successfully.' // Custom message to indicate success
                    });
                } catch (error) {
                    res.status(500).send({ success: false, message: 'Failed to open the box.' }); // Handle any errors
                }
            } else {
                const timeRemaining = Math.ceil((TOGGLE_INTERVAL - (currentTime - lastToggleTime)) / 1000);
                res.send({
                    success: false,
                    message: `TOGGLE command already sent. Please wait ${timeRemaining} seconds before toggling again.`
                });
            }
        } else {
            res.send({
                success: false,
                message: 'No matching order ID found.' // Respond if there's no match
            });
        }
    } else {
        res.send({
            success: false,
            message: 'Waiting for data or order ID...' // Inform client to wait
        });
    }
};

// Function to handle requests for the receiver operation
const handleRequestForReceiver = async (req, res) => {
    const data = req.body.data; // This is the QR code data
    const orderId = req.body.orderId; // This is the orderId received in the request body

    console.log('Received QR code data:', data);

    // If orderId is received, store it in fetchedOrderId
    if (orderId) {
        fetchedOrderId = orderId; // Store the fetched orderId
        console.log('Received order ID:', fetchedOrderId);
    }

    // Check if both the data and fetchedOrderId are available before comparing
    if (data && fetchedOrderId) {
        // Compare the QR code data with the fetched orderId
        if (data === fetchedOrderId || data === admin) {
            const currentTime = Date.now(); // Get the current time

            // Check if 30 seconds have passed since the last toggle command
            if (currentTime - lastToggleTime >= TOGGLE_INTERVAL) {
                try {
                    // Send the TOGGLE command since data matches orderId
                    await toggleServoMotor(); // Pass "TOGGLE" as the command
                    lastToggleTime = currentTime; // Update the last toggle time

                    // Update the receiverBoxStatus to 'Opened' in the database
                    const orderUpdate = await OrderModel.findByIdAndUpdate(fetchedOrderId, { receiverBoxStatus: 'Opened' });

                    console.log(`Order ${fetchedOrderId} receiverBoxStatus updated to 'Opened'.`);

                    // Send email notification to senderEmail
                    const senderEmail = orderUpdate.senderEmail; // Assume senderEmail is stored in the order
                    await sendReceiverBoxOpenedEmail(senderEmail, fetchedOrderId); // Call your email function here

                    // Respond with a success message
                    res.send({
                        success: true,
                        message: 'Your box has been opened successfully.' // Custom message to indicate success
                    });
                } catch (error) {
                    console.error('Error opening the box:', error);
                    res.status(500).send({ success: false, message: 'Failed to open the box.' }); // Handle any errors
                }
            } else {
                const timeRemaining = Math.ceil((TOGGLE_INTERVAL - (currentTime - lastToggleTime)) / 1000);
                res.send({
                    success: false,
                    message: `TOGGLE command already sent. Please wait ${timeRemaining} seconds before toggling again.`
                });
            }
        } else {
            res.send({
                success: false,
                message: 'No matching order ID found.' // Respond if there's no match
            });
        }
    } else {
        res.send({
            success: false,
            message: 'Waiting for data or order ID...' // Inform client to wait
        });
    }
};

// Function to send email notification
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send an email
const sendReceiverBoxOpenedEmail = async (recipientEmail, orderId) => {
    const mailOptions = {
        from: `Smart Box using IoT <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Smart Box using IoT - Box Opened Notification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Your Box Has Been Opened!</h1>
                </div>
                <p style="font-size: 16px; color: #333;">
                    Dear Customer,
                </p>
                <p style="font-size: 16px; color: #333;">
                    We are pleased to inform you that your ordered box with the ID <strong style="color: #555;">#${orderId}</strong> has been successfully opened.
                </p>
                <p style="font-size: 16px; color: #333;">
                    Thank you for using our service! If you have any questions or need further assistance, please feel free to reach out to us.
                </p>
                <p style="font-size: 16px; color: #333;">
                    Best regards,<br>
                    Smart Box using IoT Team
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
<p style="font-size: 14px; color: #888; text-align: center;">
If you have any questions, reply to this email or contact our support at <a href="mailto:aryanhinglajia2663@gmail.com" style="color: #ff4d4f;">support@example.com</a>.
</p>
<p style="font-size: 14px; color: #888; text-align: center;">
© 2024 Smart Box using Iot All rights reserved.
</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', recipientEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


// Endpoints for different operations
app.post('/endpoint', handleRequest);
app.post('/endpointforreceiver', handleRequestForReceiver);


app.post('/searchOrder', async (req, res) => {
    try {
        const { orderId } = req.body; // Extract orderId from request body

        // Validate the orderId
        if (!orderId) {
            return res.status(400).send({ message: "Order ID is required" });
        }

        // Log the received orderId for debugging
        console.log(`Received request to search for order ID: ${orderId}`);

        // Find the order in the database using the orderId
        const order = await OrderModel.findById(orderId);

        // Check if order exists
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }

        // Log the full order details for debugging
        console.log('Order details:', order);

        // Store the orderId for future comparison
        fetchedOrderId = orderId; // Store the fetched orderId

        // Return a response including the orderId, status, and boxStatus
        return res.status(200).send({
            message: "Order found successfully",
            orderId: orderId, // Send the orderId
            status: order.status, // Send the order status
            boxStatus: order.boxStatus,
            receiverBoxStatus:order.receiverBoxStatus // Send the boxStatus
        });
    } catch (error) {
        console.error("Error in /searchOrder:", error); // Log the error
        return res.status(500).send({ message: "Internal server error", error: error.message });
    }
});




app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// console.log(`Received GPS Data: Latitude: "22.296255", Longitude: "73.247021", Unique Key: "D8BC38FB509C"`);