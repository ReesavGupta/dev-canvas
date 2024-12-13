import express from 'express'
import fs from 'fs'
import yaml from 'yaml'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
} from '@kubernetes/client-node'

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: '*',
  })
)

const kubeconfig = new KubeConfig()
kubeconfig.loadFromDefault()
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api)
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api)
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api)

// Utility function to read and parse multi-document YAML
const readAndParseKubeYaml = (
  filePath: string,
  canvasID: string
): Array<any> => {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const docs = yaml.parseAllDocuments(fileContent)

  return docs.map((doc) => {
    let docString = doc.toString()
    const regex = new RegExp('service_name', 'g')
    docString = docString.replace(regex, canvasID)
    return yaml.parse(docString)
  })
}

app.post('/start', async (req, res) => {
  const { userId, canvasID } = req.body // Assuming these values are passed in the request
  const namespace = 'default' // Define the namespace you want to use

  try {
    // Parse and replace placeholders in the YAML manifest
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, '../service.yml'),
      canvasID
    )

    // Create resources in Kubernetes
    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case 'Deployment':
          await appsV1Api.createNamespacedDeployment(namespace, manifest)
          console.log(`Deployment ${canvasID} created.`)
          break
        case 'Service':
          await coreV1Api.createNamespacedService(namespace, manifest)
          console.log(`Service ${canvasID} created.`)
          break
        case 'Ingress':
          await networkingV1Api.createNamespacedIngress(namespace, manifest)
          console.log(`Ingress ${canvasID} created.`)
          break
        default:
          console.error(`Unsupported kind: ${manifest.kind}`)
      }
    }

    res.status(200).send({ message: 'Resources created successfully' })
  } catch (error: any) {
    console.error('Failed to create resources:', error.message)
    res.status(500).send({ message: 'Failed to create resources', error })
  }
})

const port = process.env.PORT || 3003
app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})
