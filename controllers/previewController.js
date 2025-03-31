const { previewB2, previewAuthorize } = require("../config/previewConfig");

const previewGetSignedUrl = async (req, res) => {
  try {
    await previewAuthorize();
    const { fileName } = req.params;

    const previewBucketId = process.env.B2_PREVIEW_BUCKET_ID;

    // Generate a signed download authorization
    const response = await previewB2.getDownloadAuthorization({
      bucketId: previewBucketId,
      fileNamePrefix: fileName, // Only grants access to the requested file
      validDurationInSeconds: 300, // URL valid for 5 minutes
    });

    // Construct the signed URL
    const previewSignedUrl = `https://f005.backblazeb2.com/file/${process.env.B2_PREVIEW_BUCKET_NAME}/${fileName}?Authorization=${response.data.authorizationToken}`;

    res.json({ previewUrl: previewSignedUrl });
  } catch (error) {
    console.error("Error generating preview signed URL:", error);
    res.status(500).json({ error: "Failed to generate preview signed URL" });
  }
};

module.exports = { previewGetSignedUrl };
