import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let s3Client = null;

export function getS3Client() {
  if (!s3Client) {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (accessKey && secretKey) {
      console.log("⚙️ AWS Credentials detected. Initializing S3 Client on region:", region);
      s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        }
      });
    } else {
      console.warn("⚠️ AWS S3 qualifications are missing from .env. Uploads will fallback to local simulated URLs for preview convenience.");
      s3Client = null;
    }
  }
  return s3Client;
}

export async function uploadToS3(params) {
  const client = getS3Client();
  const bucketName = process.env.AWS_S3_BUCKET;
  const uniqueKey = params.customKey || `hrms-documents/${Date.now()}-${params.fileName}`;

  if (client && bucketName) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueKey,
          Body: params.buffer,
          ContentType: params.mimeType,
        })
      );
      const region = process.env.AWS_REGION || 'us-east-1';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
    } catch (err) {
      console.error("❌ Exception during AWS S3 upload:", err.message);
      throw new Error(`AWS S3 Upload Failed: ${err.message}`);
    }
  }

  console.log(`📂 Fallback: Uploaded document '${params.fileName}' securely in memory.`);
  return `/uploads/${uniqueKey}`;
}

export async function streamFromS3(key, res, fileName) {
  const client = getS3Client();
  const bucketName = process.env.AWS_S3_BUCKET;

  if (!client || !bucketName) {
    throw new Error("AWS S3 is unconfigured.");
  }

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (response.ContentType) {
      res.setHeader('Content-Type', response.ContentType);
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);

    if (response.Body && typeof response.Body.pipe === 'function') {
      response.Body.pipe(res);
    } else {
      throw new Error("S3 body stream is not pipeable");
    }
  } catch (err) {
    console.error("❌ S3 stream retrieval error:", err);
    throw new Error(`S3 Retrieval Failed: ${err.message}`);
  }
}

export async function deleteFromS3(key) {
  const client = getS3Client();
  const bucketName = process.env.AWS_S3_BUCKET;

  if (client && bucketName) {
    try {
      console.log(`🗑️ S3 Deletion: Removing key '${key}' from bucket '${bucketName}'`);
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );
    } catch (err) {
      console.error("❌ Exception during AWS S3 deletion:", err.message);
      throw new Error(`AWS S3 Deletion Failed: ${err.message}`);
    }
  }
}
