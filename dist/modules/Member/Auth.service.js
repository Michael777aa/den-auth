"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../libs/config");
const Error_1 = __importStar(require("../../libs/Error"));
class AuthService {
    constructor(fastify) {
        this.fastify = fastify;
    }
    async createToken(payload) {
        try {
            const duration = `${config_1.AUTH_TIMER}h`;
            return this.fastify.jwt.sign(payload, { expiresIn: duration });
        }
        catch (err) {
            console.error("Token creation error:", err);
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.TOKEN_CREATION_FAILED);
        }
    }
    async checkAuth(token) {
        try {
            return await this.fastify.jwt.verify(token);
        }
        catch (err) {
            console.error("Token verification error:", err);
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.NOT_AUTHENTICATED);
        }
    }
    static decorateFastifyInstance(fastify) {
        fastify.decorateRequest("member", null);
        fastify.decorate("authenticate", async (request, reply) => {
            try {
                await request.jwtVerify();
                request.member = request.user;
            }
            catch (err) {
                throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.NOT_AUTHENTICATED);
            }
        });
    }
}
exports.default = AuthService;
//# sourceMappingURL=Auth.service.js.map