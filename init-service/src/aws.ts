import { S3 } from 'aws-sdk'

const s3 = new S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
})

export const copyS3Folder = async (
  sourcePrefix: string,
  destinationPrefix: string,
  continuationToken?: string
): Promise<void> => {
  try {
    console.log(
      '/n',
      process.env.R2_ENDPOINT,
      process.env.R2_ACCESS_KEY_ID,
      process.env.R2_SECRET_ACCESS_KEY,
      process.env.R2_BUCKET
    )
    const bucketName = process.env.R2_BUCKET
    if (!bucketName) {
      throw new Error('Environment variablae is undefined: R2_Bucket')
    }
    const listParams = {
      Bucket: bucketName,
      Prefix: sourcePrefix,
      continuationToken,
    }
    console.log(listParams)
    const listedObjects = await s3.listObjectsV2(listParams).promise()

    console.log(listedObjects)

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      throw new Error('Nothing to copy from s3')
    }

    await Promise.all(
      listedObjects.Contents.map(async (file: any) => {
        if (!file.Key) return

        const destinationKey = file.Key.replace(sourcePrefix, destinationPrefix)

        const destinationS3Directory = process.env.R2_BUCKET

        if (!destinationS3Directory) {
          throw new Error('Environment variable undefined')
        }

        const copyParams = {
          Bucket: destinationS3Directory,
          CopySource: `${destinationS3Directory}/${file.Key}`,
          Key: destinationKey,
        }

        await s3.copyObject(copyParams).promise()
        console.log(`Copied ${file.Key} to ${destinationKey}`)
      })
    )
    if (listedObjects.IsTruncated) {
      listParams.continuationToken = listedObjects.NextContinuationToken
      await copyS3Folder(sourcePrefix, destinationPrefix, continuationToken)
    }
  } catch (error) {
    console.log(`Something went wrong while copying file to s3:` + error)
    return
  }
}
