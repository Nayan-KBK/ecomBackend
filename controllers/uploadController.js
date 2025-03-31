const fs = require('fs');
const path = require('path');
const { b2, authorize } = require('../config/b2Config');
const File = require('../models/FileModel.js');

exports.uploadFile = async (req, res) => {
    try {
        await authorize(); // ✅ Authorize Backblaze

        const filePath = req.file.path;
        const originalFileName = req.file.originalname;
        const storedFileName = `${Date.now()}-${originalFileName}`; // ✅ Add timestamp to prevent conflicts
        const tags = req.body.tags ? req.body.tags.split(',') : [];

        // ✅ Read File
        const fileBuffer = fs.readFileSync(filePath);

        // ✅ Step 1: Get Upload URL from Backblaze
        const uploadUrlResponse = await b2.getUploadUrl({
            bucketId: process.env.B2_BUCKET_ID
        });

        const uploadUrl = uploadUrlResponse.data.uploadUrl;
        const authToken = uploadUrlResponse.data.authorizationToken;

        // ✅ Step 2: Upload the File to Backblaze (Use `storedFileName`)
        const uploadResponse = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authToken,
            fileName: storedFileName, // ✅ Use renamed file
            data: fileBuffer
        });

        // ✅ Step 3: Construct File URL manually
        const fileUrl = `https://${process.env.B2_BUCKET_NAME}.s3.us-east-005.backblazeb2.com/${storedFileName}`;

        // ✅ Step 4: Save File Data in MongoDB
        const fileData = new File({
            originalFileName: originalFileName, // ✅ Store original name
            storedFileName: storedFileName,     // ✅ Store actual Backblaze name
            tags: tags,
            fileUrl: fileUrl
        });

        await fileData.save();

        // ✅ Step 5: Delete File from Local Storage
        fs.unlinkSync(filePath);

        // ✅ Step 6: Send Response
        res.status(201).json({
            message: 'File uploaded successfully',
            data: fileData
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({
            error: 'Failed to upload file',
            details: error.message
        });
    }
};
