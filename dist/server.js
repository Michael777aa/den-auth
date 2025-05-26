"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
// 데이터베이스 연결 및 서버 시작
// Database connection and server startup
mongoose_1.default.set("strictQuery", false);
mongoose_1.default
    .connect(process.env.MONGO_URL, {})
    .then(async () => {
    console.log("MongoDB successfully connected to the server");
    const PORT = process.env.PORT ?? 3000;
    const server = await (0, app_1.default)();
    server.listen({
        port: Number(PORT),
        host: "0.0.0.0",
    }, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Project running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    console.log("ERROR on connection MongoDB", err);
});
//# sourceMappingURL=server.js.map