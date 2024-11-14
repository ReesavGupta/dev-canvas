"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = __importDefault(require("node:http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = require("./ws");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const runnerHttpServer = node_http_1.default.createServer(app);
(0, ws_1.initWsConnection)(runnerHttpServer);
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001;
runnerHttpServer.listen(port, () => {
    console.log(`Runner Server listening on port: ${port}`);
});
