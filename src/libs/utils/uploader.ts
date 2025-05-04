import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (
  data: Buffer,
  fileName: string,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<string> => {
  try {
    const uploadPath = path.join(__dirname, "../../../uploads/members");

    // Create directory if not exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generate unique filename with extension
    const extension = path.extname(fileName);
    const filename = `${uuidv4()}${extension}`;
    const filePath = path.join(uploadPath, filename);

    // Process image with sharp
    await sharp(data)
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFile(filePath);

    return filename;
  } catch (error) {
    console.error("Image processing error:", error);
    throw new Error("Failed to process image");
  }
};

export const deleteImage = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(__dirname, "../../../uploads/members", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Image deletion error:", error);
    throw new Error("Failed to delete image");
  }
};
