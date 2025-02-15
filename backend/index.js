const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const OrderModel = require('./models/order'); // Adjust the path as necessary
const ProductModel = require('./models/products'); // Adjust the path as necessary
const http = require('http'); // Ensure this is included
const { exec, spawn } = require('child_process');
const nodemailer = require('nodemailer');
const { Console } = require('console');



require('dotenv').config();
require('./models/db');

const FRONTEND_URL = "https://smart-boxx.netlify.app"; 


const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(
    cors({
      origin: FRONTEND_URL, // This should be your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE"], 
      allowedHeaders: ["Content-Type", "Authorization"], 
      credentials: true, // Enable if using cookies or sessions
    })
  );

  app.get("/", (req, res) => {
    res.send("Backend is running with CORS setup!");
  });
app.use(express.json());

app.get('/ping', (req, res) => {
    res.send('PONG');
});

app.use('/auth', authRouter);


let latestGpsData = { latitude: null, longitude: null, unique_key: null };



app.post('/gps', (req, res) => {
    const { latitude, longitude, unique_key } = req.body;

  
    console.log(`Received GPS Data: Latitude: ${latitude}, Longitude: ${longitude}, Unique Key: ${unique_key}`);


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
        res.status(500).send({ message: "Internal server error", error: error.message });
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
            data: latestGpsData,
            order:orderId
        });
    } catch (error) {
        console.error("Error in /getLatestGPS:", error); // Log the error
        return res.status(500).send({ message: "Internal server error", error: error.message });
    }
});



app.get('/receivedlocation/gps', (req, res) => {
    // Check if latestGpsData is defined and has valid data
    if (!latestGpsData || !latestGpsData.latitude || !latestGpsData.longitude) {
        res.status(404).send({ message: "No GPS data found." });
    }

    // If GPS data exists, send it as a response
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



















// app.post('/endpoint', async (req, res) => {
//     console.log('Request Body:', req.body); // Log the entire request body

//     const { orderId, data } = req.body; // Get the orderId and data from the request body

//     // Check if orderId and data are provided
//     if (!orderId || !data) {
//         console.log("Missing orderId or data.");
//         return res.status(400).send({ message: "Order ID and action data are required" });
//     }

//     // Log the received QR code data
//     console.log('Data received from QR code:', data);

//     try {
//         // Find the order using the orderId
//         const order = await OrderModel.findOne({ _id: orderId });

//         // Check if order exists
//         if (!order) {
//             console.log("No order found for this Order ID:", orderId);
//             return res.status(404).send({ message: "No order found for this Order ID" });
//         }

//         const { esp32_id } = order; // Get the esp32_id from the order

//         // Check if esp32_id is present
//         if (!esp32_id) {
//             return res.status(400).send({ message: "No ESP32 ID associated with this order" });
//         }

//         // Log the received order and esp32_id
//         console.log('Order found:', order);
//         console.log('ESP32 ID:', esp32_id);

//         // Compare the QR code data with the esp32_id
//         if (data === esp32_id) {
//             // If the QR code data matches the esp32_id, trigger the servo motor
//             console.log(Triggering servo motor operation on ESP32...);

//             // Prepare the data to send to the ESP32
//             const postData = JSON.stringify({ command: 'CLOSE' }); // Assuming we want to open the box

//             // Set up the request options to communicate with ESP32
//             const options = {
//                 hostname: '192.168.0.106', // ESP32 IP
//                 port: 80,
//                 path: '/operate', // ESP32 endpoint
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Content-Length': Buffer.byteLength(postData)
//                 }
//             };

//             // Make the HTTP request to the ESP32
//             const req = http.request(options, (response) => {
//                 let responseData = '';

//                 // Receive the response from ESP32
//                 response.on('data', (chunk) => {
//                     responseData += chunk;
//                 });

//                 response.on('end', () => {
//                     console.log(ESP32 response: ${responseData});
//                     res.send(Servo motor operated successfully with command: OPEN);
//                 });
//             });

//             // Handle errors
//             req.on('error', (error) => {
//                 console.error(Error sending signal to ESP32: ${error});
//                 res.status(500).send('Failed to communicate with ESP32');
//             });

//             // Write data to request body
//             req.write(postData);
//             req.end();
//         } else {
//             // If the QR code data does not match the esp32_id
//             console.log('QR code data does not match the associated ESP32 ID.');
//             res.status(400).send({ message: 'QR code data does not match the associated ESP32 ID.' });
//         }
//     } catch (error) {
//         console.error("Error in /endpoint:", error);
//         return res.status(500).send({ message: "Internal server error", error: error.message });
//     }
// });

// app.post('/endpoint', async (req, res) => {
//     console.log('Request Body:', req.body); // Log the entire request body

//     // Run the script.py file before processing the rest of the logic
//     // exec('python script.py', (error, stdout, stderr) => {
//     //     if (error) {
//     //         console.error(Error executing script: ${error.message});
//     //         return res.status(500).send('Error executing script');
//     //     }
//     //     if (stderr) {
//     //         console.error(Script stderr: ${stderr});
//     //         return res.status(500).send('Script execution error');
//     //     }
//     //     console.log(Script output: ${stdout}); // Log the output of the script

//         // Proceed with the rest of the logic after running the script
//         const { orderId, data } = req.body; // Get the orderId and data from the request body

//         // Check if orderId and data are provided
//         if (!orderId || !data) {
//             console.log("Missing orderId or data.");
//             return res.status(400).send({ message: "Order ID and action data are required" });
//         }

//         // Log the received QR code data
//         console.log('Data received from QR code:', data);

//         // Find the order using the orderId
//         OrderModel.findOne({ _id: orderId }).then(order => {
//             // Check if order exists
//             if (!order) {
//                 console.log("No order found for this Order ID:", orderId);
//                 return res.status(404).send({ message: "No order found for this Order ID" });
//             }

//             const { esp32_id } = order; // Get the esp32_id from the order

//             // Check if esp32_id is present
//             if (!esp32_id) {
//                 return res.status(400).send({ message: "No ESP32 ID associated with this order" });
//             }

//             // Log the received order and esp32_id
//             console.log('Order found:', order);
//             console.log('ESP32 ID:', esp32_id);

//             // Compare the QR code data with the orderId
//             if (data === orderId) { // Compare data from QR code with orderId from the database
//                 // If the QR code data matches the orderId, trigger the servo motor
//                 console.log(Triggering servo motor operation on ESP32...);

//                 // Prepare the data to send to the ESP32
//                 const postData = JSON.stringify({ command: 'OPEN' }); // Or 'CLOSE', depending on your logic

//                 // Set up the request options to communicate with ESP32
//                 const options = {
//                     hostname: '192.168.0.106', // ESP32 IP
//                     port: 80,
//                     path: '/operate', // ESP32 endpoint
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Content-Length': Buffer.byteLength(postData)
//                     }
//                 };

//                 // Make the HTTP request to the ESP32
//                 const reqEsp32 = http.request(options, (response) => {
//                     let responseData = '';

//                     // Receive the response from ESP32
//                     response.on('data', (chunk) => {
//                         responseData += chunk;
//                     });

//                     response.on('end', () => {
//                         console.log(ESP32 response: ${responseData});
//                         res.send(Servo motor operated successfully with command: OPEN); // or CLOSE
//                     });
//                 });

//                 // Handle errors
//                 reqEsp32.on('error', (error) => {
//                     console.error(Error sending signal to ESP32: ${error});
//                     res.status(500).send('Failed to communicate with ESP32');
//                 });

//                 // Write data to request body
//                 reqEsp32.write(postData);
//                 reqEsp32.end();
//             } else {
//                 // If the QR code data does not match the orderId
//                 console.log('QR code data does not match the associated Order ID.');
//                 res.status(400).send({ message: 'QR code data does not match the associated Order ID.' });
//             }
//         }).catch(error => {
//             console.error("Error in finding order:", error);
//             return res.status(500).send({ message: "Internal server error", error: error.message });
//         });
//     });



// let scriptExecuted = false; // Flag to track if the script has been executed

// app.post('/endpoint', async (req, res) => {
//     console.log('Request Body:', req.body); // Log the entire request body

//     const { orderId, data } = req.body; // Get the orderId and data from the request body

//     // Check if orderId and data are provided
//     if (!orderId || !data) {
//         console.log("Missing orderId or data.");
//         return res.status(400).send({ message: "Order ID and action data are required" });
//     }

//     // Log the received QR code data
//     console.log('Data received from QR code:', data);

//     try {
//         // Attempt to find the order using the orderId
//         console.log(Searching for order with ID: ${orderId});
//         const order = await OrderModel.findOne({ _id: orderId });

//         // Check if order exists
//         if (!order) {
//             console.log("No order found for this Order ID:", orderId);
//             return res.status(404).send({ message: "No order found for this Order ID" });
//         }

//         const { esp32_id } = order; // Get the esp32_id from the order

//         // Check if esp32_id is present
//         if (!esp32_id) {
//             console.log("No ESP32 ID associated with this order.");
//             return res.status(400).send({ message: "No ESP32 ID associated with this order" });
//         }

//         // Log the found order and esp32_id
//         console.log('Order found:', order);
//         console.log('ESP32 ID:', esp32_id);

//         // Compare the QR code data with the orderId
//         console.log(Comparing QR code data (${data}) with order ID (${orderId}));
//         if (data === orderId) { // Compare data from QR code with orderId from the database
//             console.log(Match found: ${data} equals ${orderId});

//             // Check if the script has already been executed
//             if (!scriptExecuted) {
//                 console.log(Running Python script with order ID...);

//                 // Command to run the Python script with the order ID as an argument
//                 const pythonScript = 'python script.py'; // Adjust the path to your script if necessary
//                 exec(${pythonScript} ${orderId}, (error, stdout, stderr) => {
//                     if (error) {
//                         console.error(Error executing script: ${error.message});
//                         return res.status(500).send('Failed to execute Python script');
//                     }
//                     if (stderr) {
//                         console.error(Script stderr: ${stderr});
//                     }

//                     // Log the output from the script
//                     console.log(Script output: ${stdout});
//                     scriptExecuted = true; // Mark the script as executed
//                     res.send(Python script executed successfully with order ID: ${orderId});
//                 });
//             } else {
//                 console.log('Python script has already been executed. Skipping...');
//                 return res.status(400).send({ message: 'Script already executed for this request.' });
//             }
//         } else {
//             // If the QR code data does not match the orderId
//             console.log('QR code data does not match the associated Order ID.');
//             res.status(400).send({ message: 'QR code data does not match the associated Order ID.' });
//         }
//     } catch (error) {
//         console.error("Error in /endpoint:", error);
//         return res.status(500).send({ message: "Internal server error", error: error.message });
//     }
// });

// app.post('/endpoint', async (req, res) => {
//     console.log('Request Body:', req.body); // Log the entire request body

//     const { orderId } = req.body; // Get the orderId from the request body

//     // Check if orderId is provided
//     if (!orderId) {
//         console.log("Missing orderId.");
//         return res.status(400).send({ message: "Order ID is required" });
//     }

//     try {
//         // Run the Python script first, passing the order ID
//         console.log(Running Python script with order ID: ${orderId}...);

//         const pythonScript = 'python script.py'; // Adjust the path as needed
//         exec(${pythonScript} ${orderId}, async (error, stdout, stderr) => {
//             if (error) {
//                 console.error(Error executing script: ${error.message});
//                 return res.status(500).send('Failed to execute Python script');
//             }
//             if (stderr) {
//                 console.error(Script stderr: ${stderr});
//             }

//             // Log the output from the script
//             console.log(Script output: ${stdout});

//             // After executing the script, retrieve the QR code data
//             // Implement your logic to retrieve the QR code data here.
//             const qrData = "someData"; // Replace this with actual QR data fetching logic

//             // Now, fetch the order using the orderId
//             console.log(Searching for order with ID: ${orderId});
//             const order = await OrderModel.findOne({ _id: orderId });

//             // Check if order exists
//             if (!order) {
//                 console.log("No order found for this Order ID:", orderId);
//                 return res.status(404).send({ message: "No order found for this Order ID" });
//             }

//             // Log the found order
//             console.log('Order found:', order);

//             // Compare the QR code data with the orderId
//             console.log(Comparing QR code data (${qrData}) with order ID (${orderId}));
//             if (qrData === orderId) { // Compare data from QR code with orderId from the database
//                 console.log(Match found: ${qrData} equals ${orderId});
                
//                 // If the QR code data matches the orderId, you can trigger further actions here
//                 // Example: Trigger the servo motor operation on ESP32 here if needed
                
//                 res.send(Order ID matched successfully: ${orderId}.);
//             } else {
//                 // If the QR code data does not match the orderId
//                 console.log('QR code data does not match the associated Order ID.');
//                 res.status(400).send({ message: 'QR code data does not match the associated Order ID.' });
//             }
//         });
//     } catch (error) {
//         console.error("Error in /endpoint:", error);
//         return res.status(500).send({ message: "Internal server error", error: error.message });
//     }
// });




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
