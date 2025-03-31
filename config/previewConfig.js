const BackblazeB2 = require('backblaze-b2');
const dotenv = require('dotenv');

dotenv.config();

const previewB2 = new BackblazeB2({
    applicationKeyId: process.env.B2_PREVIEW_KEY_ID,
    applicationKey: process.env.B2_PREVIEW_APPLICATION_KEY
});

async function previewAuthorize() {
    await previewB2.authorize();
}

module.exports = { previewB2, previewAuthorize };
