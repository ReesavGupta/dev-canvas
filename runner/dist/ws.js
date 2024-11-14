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
exports.initWsConnection = void 0;
const socket_io_1 = require("socket.io");
const fs_1 = require("./fs");
const aws_1 = require("./aws");
const pty_1 = require("./pty");
const terminalManager = new pty_1.TerminalManager();
const initWsConnection = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: ['https://example.com'], // Only allow specific domain(s)
            methods: ['GET', 'POST'], // Limit to necessary HTTP methods
            allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
            credentials: false, // Disable credentials if not needed
            maxAge: 600, // Cache preflight responses for 10 minutes
            preflightContinue: false, // Stop after handling preflight request
            optionsSuccessStatus: 200, // Status for successful preflight requests
            exposedHeaders: ['X-Custom-Header'], // Expose only necessary headers
        },
    });
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        const host = socket.handshake.headers.host;
        console.log(`\nthis is the host: ${host}`);
        const canvasID = host === null || host === void 0 ? void 0 : host.split('.')[0];
        if (!canvasID) {
            socket.disconnect();
            // need to clear the terminal manager here with the corresponding socketID
            return;
        }
        socket.emit('loaded', {
            rootContent: yield (0, fs_1.fetchDir)('/workspace', ''),
        });
        initHandlers(socket, canvasID);
    }));
};
exports.initWsConnection = initWsConnection;
function initHandlers(socket, canvasID) {
    socket.on('fetchDir', (dir, callback) => __awaiter(this, void 0, void 0, function* () {
        const dirPath = `/workspace/${dir}`;
        const contents = yield (0, fs_1.fetchDir)(dirPath, dir);
        callback(contents);
    }));
    socket.on('fetchContent', (_a, callback_1) => __awaiter(this, [_a, callback_1], void 0, function* ({ path: filePath }, callback) {
        const fullPath = `/workspace/${filePath}`;
        const data = yield (0, fs_1.fetchContent)(fullPath);
        callback(data);
    }));
    socket.on('updateContent', (_a) => __awaiter(this, [_a], void 0, function* ({ path: filePath, content }) {
        const fullPath = `/workspace/${filePath}`;
        yield (0, fs_1.saveFile)(fullPath, content);
        yield (0, aws_1.saveToS3)(`code/${canvasID}`, filePath, content);
    }));
    socket.on('requestTerminal', () => __awaiter(this, void 0, void 0, function* () {
        terminalManager.createPty(socket.id, canvasID, (data, id) => {
            socket.emit('terminal', {
                data: Buffer.from(data, 'utf-8'),
            });
        });
    }));
    socket.on('terminalData', (_a) => __awaiter(this, [_a], void 0, function* ({ data }) {
        terminalManager.write(socket.id, data);
    }));
}
