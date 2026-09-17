import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import s3Client from '../config/aws.js';

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

// Pre-signed URL expiry: 15 minutes (in seconds)
const PRESIGNED_URL_EXPIRY = 15 * 60;

/**
 * Upload a file buffer to S3.
 *
 * @param {Buffer}  buffer       - File data from multer memoryStorage
 * @param {string}  prefix       - S3 path prefix (e.g., "employees/VHR-202506-0001/documents")
 * @param {string}  originalName - Original filename from client
 * @param {string}  mimeType     - MIME type of the file
 * @returns {Promise<{s3Key: string, originalFileName: string}>}
 */
export const uploadFileToS3 = async (buffer, prefix, originalName, mimeType) => {
  const ext = originalName.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${ext}`;
  const s3Key = `${prefix}/${uniqueFileName}`;

  // If we are running locally with dummy AWS credentials, mock the upload
  if (process.env.AWS_ACCESS_KEY_ID === 'AKIAIOSFODNN7EXAMPLE') {
    console.warn(`[DEV MODE] Mock S3 Upload for ${s3Key}`);
    return { s3Key: `mock/${s3Key}`, originalFileName: originalName };
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: mimeType,
    // Server-side encryption
    ServerSideEncryption: 'AES256',
    Metadata: {
      originalFileName: originalName,
    },
  });

  await s3Client.send(command);

  return { s3Key, originalFileName: originalName };
};

/**
 * Generate a short-lived pre-signed URL for secure client-side file viewing.
 * The URL expires in 15 minutes — documents are never publicly accessible.
 *
 * @param {string} s3Key - The S3 object key stored in MongoDB
 * @returns {Promise<string>} - Temporary HTTPS URL
 */
export const generatePresignedUrl = async (s3Key) => {
  // If we are running locally with dummy AWS credentials, mock the URL
  if (process.env.AWS_ACCESS_KEY_ID === 'AKIAIOSFODNN7EXAMPLE') {
    return `http://localhost:5000/mock-s3-download/${s3Key}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_URL_EXPIRY });
};

/**
 * Permanently delete an object from S3.
 * Used when replacing documents or offboarding employees.
 *
 * @param {string} s3Key - The S3 object key to delete
 */
export const deleteFileFromS3 = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
  });

  await s3Client.send(command);
};
