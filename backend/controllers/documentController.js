import { dbService } from '../config/db.js';
import { uploadToS3, streamFromS3, deleteFromS3, getS3Client } from '../config/s3.js';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

function extractS3Key(url, bucketName) {
  try {
    if (!url) return null;
    const bucketAndS3 = `${bucketName}.s3`;
    if (url.includes(bucketAndS3)) {
      const index = url.indexOf('.amazonaws.com/');
      if (index !== -1) {
        return decodeURIComponent(url.substring(index + '.amazonaws.com/'.length));
      }
    }
    if (url.includes('.amazonaws.com/')) {
      const parts = url.split('.amazonaws.com/');
      const remaining = parts[1];
      if (remaining.startsWith(bucketName + '/')) {
        return decodeURIComponent(remaining.substring(bucketName.length + 1));
      }
      return decodeURIComponent(remaining);
    }
    if (url.includes('.com/')) {
      const parts = url.split('.com/');
      return decodeURIComponent(parts.slice(1).join('.com/'));
    }
    return null;
  } catch (err) {
    return null;
  }
}

export const viewDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const records = await dbService.documents.find({ id });
    if (records.length === 0) {
       return res.status(404).send('Document record not found.');
    }
    
    const doc = records[0];

    if (req.user.role !== 'HR' && doc.employeeId !== req.user.id) {
       return res.status(403).send('Access denied to view this secure document.');
    }

    const fileUrl = doc.url;
    if (fileUrl && fileUrl.startsWith('https://') && fileUrl.includes('.amazonaws.com/')) {
      const bucketName = process.env.AWS_S3_BUCKET || 'hrms-shp1510';
      const key = extractS3Key(fileUrl, bucketName);

      if (!key) {
        throw new Error('S3 Object key extraction failed.');
      }

      console.log(`📡 S3 Proxy Retrieval: Fetching key '${key}' from bucket '${bucketName}'`);
      await streamFromS3(key, res, doc.name);
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Simulated File Preview - ${doc.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-slate-50 font-sans min-h-screen flex items-center justify-center p-6">
            <div class="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
              <div class="w-16 h-16 bg-[#FFC067]/20 text-[#e69f3d] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-slate-800 mb-2 truncate">${doc.name}</h2>
              <p class="text-xs text-slate-500 mb-6">Simulation Placeholder File (Local Sandbox Storage)</p>
              
              <div class="bg-slate-50 rounded-xl p-4 text-left space-y-2.5 text-xs font-mono text-slate-600 mb-6 border border-slate-100">
                <div class="flex justify-between"><span class="text-slate-400 font-sans">Document ID:</span> <span class="font-bold text-slate-700">${doc.id}</span></div>
                <div class="flex justify-between"><span class="text-slate-400 font-sans">Category:</span> <span class="text-[#7D99AA] font-bold">${doc.category}</span></div>
                <div class="flex justify-between"><span class="text-slate-400 font-sans">File Size:</span> <span class="text-slate-700 font-bold">${doc.size}</span></div>
                <div class="flex justify-between"><span class="text-slate-400 font-sans">Upload Date:</span> <span class="text-slate-700 font-bold">${doc.uploadDate}</span></div>
              </div>
              
              <button onclick="window.close();" class="w-full py-2.5 bg-[#FFC067] hover:bg-[#e09e3e] text-slate-900 font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-md">
                Close Preview
              </button>
            </div>
          </body>
        </html>
      `);
    }
  } catch (err) {
    console.error('❌ Proxy View Error:', err);
    res.status(500).send(`Secure Direct Document viewing failed: ${err.message}`);
  }
};

export const getDocuments = async (req, res) => {
  try {
    const client = getS3Client();
    const bucketName = process.env.AWS_S3_BUCKET;

    let s3Files = [];
    if (client && bucketName) {
      try {
        const listRes = await client.send(
          new ListObjectsV2Command({
            Bucket: bucketName
          })
        );
        s3Files = listRes.Contents || [];
      } catch (s3Err) {
        console.error("❌ Error listing S3 objects:", s3Err.message);
      }
    }

    const dbDocs = await dbService.documents.find({});

    const isHR = req.user.role === 'HR';
    const userId = req.user.id;

    const results = [];

    for (const obj of s3Files) {
      const key = obj.Key || '';
      if (!key) continue;

      const match = key.match(/^(employee|hr)\/([^\/]+)\/(.+)$/);
      if (!match) continue;

      const roleFolder = match[1];
      const fileEmployeeId = match[2];
      const fileName = match[3];

      if (!isHR && fileEmployeeId !== userId) {
        continue;
      }

      let matchedDbDoc = dbDocs.find(doc => {
        if (doc.employeeId !== fileEmployeeId) return false;
        const decUrl = doc.url ? decodeURIComponent(doc.url) : '';
        const decKey = decodeURIComponent(key);
        const decName = decodeURIComponent(fileName);
        const docNameDec = doc.name ? decodeURIComponent(doc.name) : '';
        return (docNameDec === decName || decUrl.includes(decKey) || decUrl.endsWith(decKey));
      });

      if (!matchedDbDoc) {
        const sizeBytes = obj.Size || 0;
        const sizeKB = Math.round(sizeBytes / 1024);
        const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;
        const uploadDate = obj.LastModified 
          ? new Date(obj.LastModified).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) 
          : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        let category = 'Identity Proof';
        if (fileName.toLowerCase().includes('degree') || fileName.toLowerCase().includes('cert')) category = 'Education';
        else if (fileName.toLowerCase().includes('payslip') || fileName.toLowerCase().includes('salary')) category = 'Payroll';
        else if (fileName.toLowerCase().includes('medical') || fileName.toLowerCase().includes('health')) category = 'Medical';
        else if (fileName.toLowerCase().includes('exp') || fileName.toLowerCase().includes('letter')) category = 'Experience';

        const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

        const newDoc = {
          id: "DOC-S3-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
          employeeId: fileEmployeeId,
          name: fileName,
          category,
          type: fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          size: sizeFormatted,
          uploadDate,
          url: s3Url
        };

        matchedDbDoc = await dbService.documents.create(newDoc);
      }

      results.push(matchedDbDoc);
    }

    // Combine any and all indexed documents currently stored directly in local db context
    for (const doc of dbDocs) {
      if (!isHR && doc.employeeId !== userId) {
        continue;
      }
      if (!results.some(r => r.id === doc.id)) {
        results.push(doc);
      }
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Document indexing query failed:", err);
    res.status(500).json({ message: 'Documents indexing query failed.', error: err.message });
  }
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
     return res.status(400).json({ message: 'Multipart file payload is missing.' });
  }

  const category = req.body.category || 'Identity Proof';
  const documentName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const buffer = req.file.buffer;
  const sizeKB = Math.round(req.file.size / 1024);
  const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;

  try {
    const roleFolder = req.user.role === 'HR' ? 'hr' : 'employee';
    const customKey = `${roleFolder}/${req.user.id}/${documentName}`;

    const s3Url = await uploadToS3({
      fileName: documentName,
      buffer,
      mimeType,
      customKey
    });

    const newRecord = {
      id: "DOC-" + Date.now(),
      employeeId: req.user.id,
      name: documentName,
      category,
      type: documentName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: sizeFormatted,
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      url: s3Url
    };

    const docRecord = await dbService.documents.create(newRecord);

    await dbService.notifications.create({
      id: "NOT-DOC-" + Date.now(),
      employeeId: req.user.id,
      title: "Document Uploaded",
      message: `${documentName} has been successfully uploaded to the cloud repository inside ${category}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(docRecord);
  } catch (err) {
    res.status(500).json({ message: 'Upload flow failed.', error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const records = await dbService.documents.find({ id });
    if (records.length === 0) {
       return res.status(404).json({ message: 'Record of document not found in directory.' });
    }

    const doc = records[0];
    if (req.user.role !== 'HR' && doc.employeeId !== req.user.id) {
       return res.status(403).json({ message: 'Forbidden. You cannot delete files of other personnel.' });
    }

    const fileUrl = doc.url;
    if (fileUrl && fileUrl.startsWith('https://') && fileUrl.includes('.amazonaws.com/')) {
      const bucketName = process.env.AWS_S3_BUCKET || 'hrms-shp1510';
      const key = extractS3Key(fileUrl, bucketName);
      if (key) {
        try {
          await deleteFromS3(key);
        } catch (s3Err) {
          console.warn("⚠️ Failed to delete physical S3 asset, deleting tracker anyway:", s3Err.message);
        }
      }
    }

    await dbService.documents.deleteOne({ id });
    res.json({ message: 'Document tracked entry successfully deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Asset delete query failed.', error: err.message });
  }
};
