"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const uploadImage = async (data, fileName, maxWidth = 800, maxHeight = 800) => {
    try {
        const uploadPath = path_1.default.join(__dirname, "../../../uploads/members");
        // Create directory if not exists
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        // Generate unique filename with extension
        const extension = path_1.default.extname(fileName);
        const filename = `${(0, uuid_1.v4)()}${extension}`;
        const filePath = path_1.default.join(uploadPath, filename);
        // Process image with sharp
        await (0, sharp_1.default)(data)
            .resize(maxWidth, maxHeight, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .toFile(filePath);
        return filename;
    }
    catch (error) {
        console.error("Image processing error:", error);
        throw new Error("Failed to process image");
    }
};
exports.uploadImage = uploadImage;
const deleteImage = async (filename) => {
    try {
        const filePath = path_1.default.join(__dirname, "../../../uploads/members", filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error("Image deletion error:", error);
        throw new Error("Failed to delete image");
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=uploader.js.map