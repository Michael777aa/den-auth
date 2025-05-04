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
const member_schema_1 = require("./member.schema");
const Error_1 = __importStar(require("../../libs/Error"));
const bcrypt = __importStar(require("bcryptjs"));
const config_1 = require("../../libs/config");
class MemberService {
    constructor() {
        this.memberModel = member_schema_1.memberModel;
    }
    async signup(input) {
        try {
            if (!input.memberEmail ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.memberEmail)) {
                throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.WRONG_EMAIL);
            }
            if (!input.memberPassword || input.memberPassword.length < 6) {
                throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.WRONG_PASSWORD);
            }
            const salt = await bcrypt.genSalt();
            input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
            const result = await this.memberModel.create(input);
            if (!result)
                throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATE_FAILED);
            return result.toObject();
        }
        catch (err) {
            console.error("Error, model: signup", err);
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATE_FAILED);
        }
    }
    async login(input) {
        try {
            if (!input.memberEmail || !input.memberPassword) {
                throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.NO_DATA_FOUND);
            }
            const member = await this.memberModel
                .findOne({ memberEmail: input.memberEmail })
                .select("+memberPassword")
                .lean()
                .exec();
            if (!member) {
                throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NO_MEMBER_EMAIL);
            }
            const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);
            if (!isMatch) {
                throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.WRONG_PASSWORD);
            }
            return member;
        }
        catch (err) {
            if (err instanceof Error_1.default)
                throw err;
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATE_FAILED);
        }
    }
    async updateMember(member, input) {
        try {
            if (!input || Object.keys(input).length === 0) {
                throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.NO_DATA_FOUND);
            }
            const memberId = (0, config_1.shapeIntoMongooseObjectId)(member._id);
            const result = await this.memberModel
                .findOneAndUpdate({ _id: memberId }, { $set: input }, { new: true, runValidators: true })
                .lean()
                .exec();
            if (!result)
                throw new Error_1.default(Error_1.HttpCode.NOT_MODIFIED, Error_1.Message.UPDATE_FAILED);
            return result;
        }
        catch (err) {
            if (err instanceof Error_1.default)
                throw err;
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATE_FAILED);
        }
    }
    async findOrCreateOAuthUser(input) {
        try {
            if (!input.provider || !input.providerId) {
                throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.NO_DATA_FOUND);
            }
            let member = await this.memberModel
                .findOne({
                provider: input.provider,
                providerId: input.providerId,
            })
                .lean()
                .exec();
            if (!member) {
                const newMember = await this.memberModel.create(input);
                return newMember.toObject();
            }
            return member;
        }
        catch (err) {
            if (err instanceof Error_1.default)
                throw err;
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATE_FAILED);
        }
    }
}
exports.default = MemberService;
//# sourceMappingURL=member.service.js.map