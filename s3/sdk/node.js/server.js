//uploading a file into aws-s3 using the sdk

import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Configure AWS S3
const s3 = new AWS.S3();

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: 'your-bucket-name', // replace with your bucket name
    Key: `${uuidv4()}_${file.originalname}`, // Generate a unique filename
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.upload(params).promise();
    res.send(`File uploaded successfully: ${params.Key}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
