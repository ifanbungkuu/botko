const Jimp = require('jimp');

class Watermarker {
    static async apply(imageBuffer, text) {
        try {
            // Use Jimp properly - it might be a default export
            const JimpLib = Jimp.default || Jimp;
            const image = await JimpLib.read(imageBuffer);
            const font = await JimpLib.loadFont(JimpLib.FONT_SANS_32_WHITE);
            
            // Create text overlay with background
            const textWidth = image.bitmap.width;
            const textHeight = 60;
            const watermarkImage = new JimpLib(textWidth, textHeight, 0x00000080); // Semi-transparent black background
            
            watermarkImage.print(font, 0, 10, {
                text: text,
                alignmentX: JimpLib.HORIZONTAL_ALIGN_CENTER,
                alignmentY: JimpLib.VERTICAL_ALIGN_TOP
            }, textWidth, textHeight);

            // Composite watermark at bottom of image
            image.composite(watermarkImage, 0, image.bitmap.height - textHeight);
            
            return await image.getBufferAsync(JimpLib.MIME_JPEG);
        } catch (error) {
            console.error("Error applying watermark:", error);
            // Return original image if watermarking fails
            return imageBuffer;
        }
    }
}

module.exports = Watermarker;
