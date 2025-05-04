export declare enum HttpCode {
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}
export declare enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed!",
    UPDATE_FAILED = "Update is failed!",
    BLOCKED_USER = "You have been blocked, contact the restaurant!",
    USED_NICK_PHONE = "You are inserting already used nick or phone!",
    NO_MEMBER_EMAIL = "No member with that member email!",
    WRONG_PASSWORD = "Wrong password, please try again!",
    WRONG_EMAIL = "Wrong Email entered, please try again!",
    NOT_AUTHENTICATED = "You are not authenticated, Please Login first!",
    TOKEN_CREATION_FAILED = "Token creation error!",
    FILE_UPLOAD_ERROR = "Error during file upload"
}
declare class Errors extends Error {
    code: HttpCode;
    message: Message;
    static standard: {
        code: HttpCode;
        message: Message;
    };
    constructor(statusCode: HttpCode, statusMessage: Message);
}
export default Errors;
