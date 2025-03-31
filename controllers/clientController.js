const File = require("../models/FileModel");
const transporter = require("../config/emailConfig");
const axios = require("axios");

const keyId = process.env.B2_KEY_ID;
const applicationKey = process.env.B2_APPLICATION_KEY;
const bucketId = process.env.B2_BUCKET_ID;
const bucketName = process.env.B2_BUCKET_NAME;

exports.sendFileToClient = async (req, res) => {
    try {
        const { email, fileId } = req.body;
        if (!email || !fileId) {
            return res.status(400).json({ error: "Email and file ID are required" });
        }

        // ✅ Find File in Database
        const fileData = await File.findById(fileId);
        if (!fileData) {
            return res.status(404).json({ error: "File not found" });
        }

        const actualStoredFileName = fileData.storedFileName; // ✅ Use stored filename with timestamp

        console.log("✅ File Info:");
        console.log("🔹 File Name:", actualStoredFileName);
        console.log("🔹 File ID:", fileData._id);

        // ✅ Authorize Backblaze API
        const authResponse = await axios.get("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
            auth: { username: keyId, password: applicationKey }
        });

        const authToken = authResponse.data.authorizationToken;
        const apiUrl = authResponse.data.apiUrl;
        const downloadUrl = authResponse.data.downloadUrl;

        console.log("✅ Backblaze API Authorized:");
        console.log("🔹 API URL:", apiUrl);
        console.log("🔹 Download URL:", downloadUrl);

        // ✅ Get Download Authorization for the Correct File
        const downloadAuthResponse = await axios.post(`${apiUrl}/b2api/v2/b2_get_download_authorization`, {
            bucketId: bucketId,
            fileNamePrefix: actualStoredFileName, // ✅ Use stored file name with timestamp
            validDurationInSeconds: 3600 // 1 hour
        }, { headers: { Authorization: authToken } });

        const downloadToken = downloadAuthResponse.data.authorizationToken;

        // ✅ Correct Backblaze Private File URL
        const authorizedFileUrl = `${downloadUrl}/file/${bucketName}/${actualStoredFileName}?Authorization=${downloadToken}`;

        console.log("✅ Generated File URL:", authorizedFileUrl);

        // ✅ Send Email with Secure Download Link
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your File Download Link",
            html: `<p>Hello,</p>
                   <p>Your requested file <b>${actualStoredFileName}</b> is ready for download:</p>
                   <p><a href="${authorizedFileUrl}" target="_blank">Download File</a></p>
                   <p>Thank you!</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);

        res.json({ message: "File sent successfully to email", fileUrl: authorizedFileUrl });
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to send file", details: error.message });
    }
};
