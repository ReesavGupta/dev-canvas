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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_node_1 = require("@kubernetes/client-node");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*',
}));
const kubeconfig = new client_node_1.KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(client_node_1.CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(client_node_1.AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(client_node_1.NetworkingV1Api);
// Utility function to read and parse multi-document YAML
const readAndParseKubeYaml = (filePath, canvasID) => {
    const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
    const docs = yaml_1.default.parseAllDocuments(fileContent);
    return docs.map((doc) => {
        let docString = doc.toString();
        const regex = new RegExp('service_name', 'g');
        docString = docString.replace(regex, canvasID);
        return yaml_1.default.parse(docString);
    });
};
app.post('/start', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, canvasID } = req.body; // Assuming these values are passed in the request
    const namespace = 'default'; // Define the namespace you want to use
    try {
        // Parse and replace placeholders in the YAML manifest
        const kubeManifests = readAndParseKubeYaml(path_1.default.join(__dirname, '../service.yml'), canvasID);
        // Create resources in Kubernetes
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case 'Deployment':
                    yield appsV1Api.createNamespacedDeployment(namespace, manifest);
                    console.log(`Deployment ${canvasID} created.`);
                    break;
                case 'Service':
                    yield coreV1Api.createNamespacedService(namespace, manifest);
                    console.log(`Service ${canvasID} created.`);
                    break;
                case 'Ingress':
                    yield networkingV1Api.createNamespacedIngress(namespace, manifest);
                    console.log(`Ingress ${canvasID} created.`);
                    break;
                default:
                    console.error(`Unsupported kind: ${manifest.kind}`);
            }
        }
        res.status(200).send({ message: 'Resources created successfully' });
    }
    catch (error) {
        console.error('Failed to create resources:', error.message);
        res.status(500).send({ message: 'Failed to create resources', error });
    }
}));
const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
