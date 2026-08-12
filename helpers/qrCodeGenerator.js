const crypto = require("crypto");

// 32-byte key (store in env variable in real apps)
const SECRET_KEY = Buffer.from(process.env.QRCODE_SECRET_KEY, "utf8");

const generateQrCode = (location, amk_number, lot_number, lot_quantity, condition, pkg_type) => {
    const text = `?location=${location}&amk_number=${amk_number}&lot_number=${lot_number}&lot_quantity=${lot_quantity}&condition=${condition}&pkg_type=${pkg_type}`;

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);
    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // iv + authTag + encrypted → Base64
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

module.exports = generateQrCode