import express from 'express';
import multer from 'multer';
import { viewDocument, getDocuments, uploadDocument, deleteDocument } from '../controllers/documentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.get('/view/:id', authenticateToken, viewDocument);
router.get('/', authenticateToken, getDocuments);
router.post('/upload', authenticateToken, upload.single('file'), uploadDocument);
router.delete('/:id', authenticateToken, deleteDocument);

export default router;
