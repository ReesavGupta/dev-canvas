"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFile = exports.fetchContent = exports.fetchDir = void 0;
const fs_1 = __importDefault(require("fs"));
const fetchDir = (dirName, baseDir) => {
    return new Promise((resolve, reject) => {
        fs_1.default.readdir(dirName, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files.map((file) => ({
                    type: file.isDirectory() ? 'dir' : 'file',
                    name: file.name,
                    path: `${baseDir}/${file.name}`,
                })));
            }
        });
    });
};
exports.fetchDir = fetchDir;
const fetchContent = (path) => {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
exports.fetchContent = fetchContent;
const saveFile = (file, content) => {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(file, content, 'utf-8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};
exports.saveFile = saveFile;
