"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToS3 = void 0;
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto',
    signatureVersion: 'v4',
});
const saveToS3 = (key, path, content) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const params = {
        Key: `${key}${path}`,
        Body: content,
        Bucket: (_a = process.env.R2_BUCKET) !== null && _a !== void 0 ? _a : '',
    };
    yield s3.putObject(params).promise();
});
exports.saveToS3 = saveToS3;
