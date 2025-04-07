 const express = require('express');
 const router = express.Router();
 const Document = require('../models/document');
 const mongoose = require('mongoose');
 const { BlobServiceClient } = require('@azure/storage-blob');
 //const upload = require('../middleware/fileUpload');

 const multer = require('multer');
 const upload = multer(); // Default configuration (store files in memory)
// const multer = require('multer');

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
 
 // Ensure that environment variables are loaded
 require('dotenv').config();
 
 // Check if the Azure Storage connection string exists
 const azureConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
 if (!azureConnectionString) {
   console.error('Azure Storage connection string is missing');
   process.exit(1);  // Exit the app if connection string is missing
 }
 
 // Azure Blob Storage setup
 const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString);
 const containerClient = blobServiceClient.getContainerClient('sql-automation');
 
 // API to get a new Interaction ID
 router.get('/generate-interaction-id', async (req, res) => {
     try {
       // Try to get the counter document
       let counter = await mongoose.connection.db.collection('interactionid').findOne({ _id: 'counter' });
   
       // If the counter document doesn't exist or seq is undefined, initialize it
       if (!counter || counter.seq === undefined) {
         await mongoose.connection.db.collection('interactionid').updateOne(
           { _id: 'counter' },
           { $set: { seq: 1 } }, // Initialize the seq field
           { upsert: true } // Ensure the document is created if it doesn't exist
         );
         counter = { seq: 1 }; // Set the counter manually to 1 after initialization
       } else {
         // Increment the seq field
         await mongoose.connection.db.collection('interactionid').updateOne(
           { _id: 'counter' },
           { $inc: { seq: 1 } }
         );
       }
   
       // Generate the new interaction ID based on the incremented counter
       const newInteractionId = `RD${counter.seq.toString().padStart(3, '0')}`;
       res.status(200).json({ interactionId: newInteractionId });
     } catch (error) {
       console.error('Error generating interaction ID:', error);  // Log the error for debugging
       res.status(500).send('Error generating interaction ID');
     }
   });
 
   router.post('/upload', upload.single('files'), async (req, res) => {
    console.log('Incoming file:', req.file);  // Log the file info
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
  
    const fileName = req.file.originalname; // The original file name
    const interactionId = req.body.interactionId; // Extract interaction ID
    const newFileName = `${fileName.replace('.docx', '')}_${interactionId}.docx`; // Append Interaction ID to the file name
  
    const blobName = `${Date.now()}-${newFileName}`; // Blob name with interaction ID
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    try {
      await blockBlobClient.upload(req.file.buffer, req.file.size);
  
      const interactionId = req.body.interactionId;
      const user = req.body.user || 'default_user';
  
      const newDocument = new Document({
        user: user,
        pathInputFile: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/rd-upload-portal-documents/${blobName}`,
        interactionId: interactionId,
      });
  
      await newDocument.save();
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).send('Error uploading file');
    }
  });
 
 router.post('/delete-file', async (req, res) => {
   const { interactionId } = req.body;
   if (!interactionId) return res.status(400).send('Interaction ID is required');
 
   try {
     // Find the document by interactionId
     const document = await Document.findOne({ interactionId });
     if (!document) return res.status(404).send('File not found');
 
     // Extract the blob name from the path
     const blobName = document.pathInputFile.split('/').pop();
     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
 
     // Delete the file from Azure Blob Storage
     await blockBlobClient.delete();
 
     // Delete metadata from MongoDB
     await Document.deleteOne({ interactionId });
 
     res.status(200).send('File and metadata deleted successfully');
   } catch (error) {
	     console.error('Error deleting file:', error);
     res.status(500).send('Error deleting file');
   }
 });

module.exports = router;
