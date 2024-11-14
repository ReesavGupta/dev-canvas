import { S3 } from 'aws-sdk'

const s3 = new S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
})


export const saveToS3 = async (
  key: string,
  path: string,
  content: string
): Promise<void> => {
  const params = {
    Key: `${key}${path}`,
    Body: content,
    Bucket: process.env.R2_BUCKET ?? '',
  }
  await s3.putObject(params).promise()
}
