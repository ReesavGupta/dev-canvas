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
exports.copyS3Folder = void 0;
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto',
    signatureVersion: 'v4',
});
const copyS3Folder = (sourcePrefix, destinationPrefix, continuationToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('/n', process.env.R2_ENDPOINT, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, process.env.R2_BUCKET);
        const bucketName = process.env.R2_BUCKET;
        if (!bucketName) {
            throw new Error('Environment variablae is undefined: R2_Bucket');
        }
        const listParams = {
            Bucket: bucketName,
            Prefix: sourcePrefix,
            continuationToken,
        };
        console.log(listParams);
        const listedObjects = yield s3.listObjectsV2(listParams).promise();
        console.log(listedObjects);
        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            throw new Error('Nothing to copy from s3');
        }
        yield Promise.all(listedObjects.Contents.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            if (!file.Key)
                return;
            const destinationKey = file.Key.replace(sourcePrefix, destinationPrefix);
            const destinationS3Directory = process.env.R2_BUCKET;
            if (!destinationS3Directory) {
                throw new Error('Environment variable undefined');
            }
            const copyParams = {
                Bucket: destinationS3Directory,
                CopySource: `${destinationS3Directory}/${file.Key}`,
                Key: destinationKey,
            };
            yield s3.copyObject(copyParams).promise();
            console.log(`Copied ${file.Key} to ${destinationKey}`);
        })));
        if (listedObjects.IsTruncated) {
            listParams.continuationToken = listedObjects.NextContinuationToken;
            yield (0, exports.copyS3Folder)(sourcePrefix, destinationPrefix, continuationToken);
        }
    }
    catch (error) {
        console.log(`Something went wrong while copying file to s3:` + error);
        return;
    }
});
exports.copyS3Folder = copyS3Folder;
