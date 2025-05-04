"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.HttpCode = void 0;
var HttpCode;
(function (HttpCode) {
    HttpCode[HttpCode["OK"] = 200] = "OK";
    HttpCode[HttpCode["CREATED"] = 201] = "CREATED";
    HttpCode[HttpCode["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    HttpCode[HttpCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpCode[HttpCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpCode[HttpCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpCode[HttpCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpCode[HttpCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpCode || (exports.HttpCode = HttpCode = {}));
var Message;
(function (Message) {
    Message["SOMETHING_WENT_WRONG"] = "Something went wrong!";
    Message["NO_DATA_FOUND"] = "No data is found!";
    Message["CREATE_FAILED"] = "Create is failed!";
    Message["UPDATE_FAILED"] = "Update is failed!";
    Message["BLOCKED_USER"] = "You have been blocked, contact the restaurant!";
    Message["USED_NICK_PHONE"] = "You are inserting already used nick or phone!";
    Message["NO_MEMBER_EMAIL"] = "No member with that member email!";
    Message["WRONG_PASSWORD"] = "Wrong password, please try again!";
    Message["WRONG_EMAIL"] = "Wrong Email entered, please try again!";
    Message["NOT_AUTHENTICATED"] = "You are not authenticated, Please Login first!";
    Message["TOKEN_CREATION_FAILED"] = "Token creation error!";
    Message["FILE_UPLOAD_ERROR"] = "Error during file upload";
})(Message || (exports.Message = Message = {}));
class Errors extends Error {
    constructor(statusCode, statusMessage) {
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }
}
Errors.standard = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
};
exports.default = Errors;
//# sourceMappingURL=Error.js.map