/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderLock, Search, Upload, Trash2, FileText, Download, AlertCircle, RefreshCw, Filter, CheckCircle2 
} from 'lucide-react';
import { Document, Employee } from '../types';
import { api } from '../lib/api';

interface DocumentsTabProps {
  employee: Employee;
  onRefreshNotifications: () => void;
}

export default function DocumentsTab({ employee, onRefreshNotifications }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' as 'success' | 'error' | '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Sandbox-Safe Deletion and Inline Preview States
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Document | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewFileType, setPreviewFileType] = useState<string>('');

  const loadDocuments = async () => {
    try {
      const list = await api.getDocuments();
      setDocuments(list);
      setFilteredDocs(list);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    return () => {
      // Memory cleanup
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, []);

  // Update object URL tracking whenever preview changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  const handleApplyFilters = () => {
    let result = [...documents];
    if (selectedCategory !== 'All Categories') {
      result = result.filter(doc => doc.category === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(doc => doc.name.toLowerCase().includes(term));
    }
    setFilteredDocs(result);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setFilteredDocs(documents);
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const fileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setFeedback({ message: '', type: '' });

    // Decide category by file extension or preset
    let category = 'Identity Proof';
    if (file.name.toLowerCase().includes('degree') || file.name.toLowerCase().includes('cert')) category = 'Education';
    else if (file.name.toLowerCase().includes('payslip') || file.name.toLowerCase().includes('salary')) category = 'Payroll';
    else if (file.name.toLowerCase().includes('medical') || file.name.toLowerCase().includes('health')) category = 'Medical';
    else if (file.name.toLowerCase().includes('exp') || file.name.toLowerCase().includes('letter')) category = 'Experience';

    try {
      const uploadedDoc = await api.uploadDocument(file, category);
      setFeedback({
        message: `Awesome! '${file.name}' successfully uploaded matching '${category}' category. Saved to ${
          uploadedDoc.url.includes('amazonaws') ? 'AWS S3 Cloud Bucket' : 'local file mock storage'
        }!`,
        type: 'success'
      });
      await loadDocuments();
      onRefreshNotifications();
    } catch (err: any) {
      setFeedback({
        message: `Upload failed: ${err.message || 'Server did not respond.'}`,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = (id: string, name: string) => {
    setDeleteConfirmTarget({ id, name });
  };

  const executeDelete = async (id: string, name: string) => {
    try {
      await api.deleteDocument(id);
      setFeedback({ message: `Successfully deleted document '${name}'`, type: 'success' });
      await loadDocuments();
      onRefreshNotifications();
    } catch (err: any) {
      setFeedback({ message: `Deletion error: ${err.message}`, type: 'error' });
    }
  };

  const handleOpenPreview = async (doc: Document) => {
    setPreviewTarget(doc);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewFileType(doc.type || '');
    
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    try {
      const token = localStorage.getItem('hrms_token');
      const response = await fetch(`/api/documents/view/${doc.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error(`Cloud server returned ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(objUrl);
    } catch (err: any) {
      console.error('Preview stream error:', err);
      setPreviewError(err.message || 'Unable to stream file content from remote repository.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewTarget(null);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  // Storage Stats (from screenshots)
  const calculateTotalSize = () => {
    let totalMB = 0;
    documents.forEach(doc => {
      if (!doc.size) return;
      const match = doc.size.match(/^([\d.]+)\s*(MB|KB)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        if (unit === 'MB') {
          totalMB += value;
        } else if (unit === 'KB') {
          totalMB += value / 1024;
        }
      }
    });
    return `${totalMB.toFixed(2)} MB`;
  };

  const totalSizeStr = calculateTotalSize();
  const limitStr = "100 MB";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">My Documents</h2>
        <p className="text-xs text-[#64748b]">Dashboard &gt; My Documents</p>
      </div>

      {/* S3 Storage Overview Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-[#64748b] font-bold block uppercase tracking-wider mb-1">Total Documents</span>
          <div className="text-xl font-extrabold text-[#0f172a]">
            {documents.length}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-[#64748b] font-bold block uppercase tracking-wider mb-1">S3 Used Volume</span>
          <div className="text-xl font-extrabold text-[#0f172a] flex items-baseline gap-1.5">
            <span>{totalSizeStr}</span>
            <span className="text-[10px] text-slate-400 font-semibold">of {limitStr} quota</span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-[#64748b] font-bold block uppercase tracking-wider mb-1">Recent uploads</span>
          <div className="text-xl font-extrabold text-[#4A90E2]">{documents.length}</div>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-[#64748b] font-bold block uppercase tracking-wider mb-1">Expiring Soon</span>
          <div className="text-xl font-extrabold text-[#4A90E2]">0</div>
        </div>
      </div>

      {/* Upload area with drag & drop */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5 bg-white ${
          dragActive 
            ? 'border-[#B1B2FF] bg-[#B1B2FF]/10' 
            : 'border-[#cbd5e1] hover:border-slate-400 hover:bg-[#AAC4FF]/10'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={fileSelected} 
        />
        <div className="w-12 h-12 rounded-xl bg-[#AAC4FF]/10 text-[#AAC4FF] flex items-center justify-center">
          <Upload className="w-5 h-5 text-[#AAC4FF]" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-700">Drag and drop file here, or click to upload</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Supports PDF, JPG, PNG up to 10MB (Automatically proxies files to AWS S3 Bucket)</p>
        </div>
        {uploading && (
          <div className="flex items-center gap-2 text-xs text-slate-800 font-bold bg-[#4A90E2]/10 px-3 py-1.5 rounded-lg border border-[#4A90E2]/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Uploading file to AWS S3 Bucket...
          </div>
        )}
      </div>

      {/* Upload Feedbacks */}
      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
          feedback.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filters Board */}
      <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl flex flex-wrap gap-4 items-end shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Document Category</span>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-1.5 text-xs rounded-xl outline-none text-[#334155]"
          >
            <option value="All Categories">All Categories</option>
            <option value="Identity Proof">Identity Proof</option>
            <option value="Education">Education</option>
            <option value="Experience">Experience</option>
            <option value="Payroll">Payroll</option>
            <option value="Medical">Medical</option>
            <option value="Employment">Employment</option>
          </select>
        </div>

        <div className="space-y-1 flex-1 max-w-xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">File Name Search</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search file name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-700 w-full"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleApplyFilters}
            className="px-3.5 py-1.5 bg-[#4A90E2] hover:bg-[#357abd] text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
          >
            Apply Filter
          </button>
          <button 
            onClick={handleResetFilters}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document directories files logs list */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1e293b]">My Secure Files Directory</h3>
          <span className="text-xs text-[#94a3b8] font-bold">Encrypted End-to-End</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-500">Indexing documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No documents found matching search metrics.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Document Name</th>
                  <th className="px-6 py-3">Category Group</th>
                  <th className="px-6 py-3">Format Type</th>
                  <th className="px-6 py-3">File Size</th>
                  <th className="px-6 py-3">Upload Stamp</th>
                  <th className="px-6 py-3 text-right">Action Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-3.5 font-semibold text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#4A90E2]" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="px-6 py-3.5 text-[#334155]">{doc.category}</td>
                    <td className="px-6 py-3.5 text-[#64748b] font-mono">{doc.type}</td>
                    <td className="px-6 py-3.5 text-[#64748b] font-mono">{doc.size}</td>
                    <td className="px-6 py-3.5 text-[#94a3b8] font-mono">{doc.uploadDate}</td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      {doc.url && (
                        <button 
                          onClick={() => handleOpenPreview(doc)}
                          className="inline-block p-1.5 bg-[#4A90E2]/10 text-slate-800 hover:bg-[#4A90E2]/25 border border-[#4A90E2]/25 rounded text-[10px] font-extrabold cursor-pointer transition-all"
                          title="View secure document inline"
                        >
                          View Cloud File
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteDoc(doc.id, doc.name)}
                        className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-100 cursor-pointer"
                        title="Delete document file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-center text-sm font-extrabold text-[#0f172a] mb-2">Delete Document?</h3>
            <p className="text-center text-xs text-[#64748b] leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong className="text-[#0f172a]">{deleteConfirmTarget.name}</strong> from secure storage? This action cannot be reversed.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const target = deleteConfirmTarget;
                  setDeleteConfirmTarget(null);
                  await executeDelete(target.id, target.name);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs shadow-red-200"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Document Preview Lightbox Modal */}
      {previewTarget && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col h-[90vh] animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#4A90E2]/10 text-[#4A90E2] rounded-lg">
                  <FileText className="w-5 h-5 text-[#4A90E2]" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-[#0f172a] truncate max-w-xs md:max-w-xl">
                    {previewTarget.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mt-0.5">
                    Category: {previewTarget.category} &bull; Type: {previewFileType || 'Unknown'} &bull; Size: {previewTarget.size}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleClosePreview}
                className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl cursor-pointer transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body (Secure Canvas) */}
            <div className="flex-1 bg-slate-100 p-6 flex items-center justify-center overflow-auto relative">
              {previewLoading && (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-[#4A90E2] animate-spin" />
                  <span className="text-xs font-semibold text-slate-500">Retrieving encrypted cloud stream from S3...</span>
                </div>
              )}

              {previewError && (
                <div className="text-center p-8 max-w-md bg-white border border-red-100 rounded-2xl shadow-md">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Preview Generation Failed</h4>
                  <p className="text-xs text-red-600 mb-4">{previewError}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleOpenPreview(previewTarget)}
                      className="px-4 py-1.5 bg-[#4A90E2] hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                    >
                      Retry Download
                    </button>
                    <a
                      href={`/api/documents/view/${previewTarget.id}?token=${localStorage.getItem('hrms_token')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl inline-block"
                    >
                      Bypass to External Tab
                    </a>
                  </div>
                </div>
              )}

              {!previewLoading && !previewError && previewBlobUrl && (
                <div className="w-full h-full flex items-center justify-center">
                  {(previewFileType.toUpperCase() === 'PDF') ? (
                    <embed
                      src={previewBlobUrl}
                      type="application/pdf"
                      className="w-full h-full rounded-lg shadow-sm bg-white"
                    />
                  ) : ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(previewFileType.toUpperCase()) ? (
                    <img 
                      src={previewBlobUrl} 
                      alt={previewTarget.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-md bg-white"
                    />
                  ) : (
                    <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-md max-w-sm">
                      <div className="w-16 h-16 bg-[#4A90E2]/10 text-[#4A90E2] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-[#4A90E2]" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Standard File Format</h4>
                      <p className="text-xs text-slate-500 mb-5">This file type ({previewFileType}) does not support inline rendering. You can securely download a local copy below.</p>
                      <a 
                        href={previewBlobUrl}
                        download={previewTarget.name}
                        className="px-5 py-2.5 bg-[#4A90E2] hover:bg-[#357abd] text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-100 animate-pulse"
                      >
                        <Download className="w-4 h-4" />
                        Download document securely
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-[#f1f5f9] flex items-center justify-between bg-slate-50">
              <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">
                OriginEdge Secure Compliance Portal
              </span>
              <div className="flex gap-2">
                {!previewLoading && !previewError && previewBlobUrl && (
                  <a 
                    href={previewBlobUrl}
                    download={previewTarget.name}
                    className="px-4 py-1.5 bg-[#4A90E2] hover:bg-[#357abd] text-white font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-blue-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save Local Copy
                  </a>
                )}
                <button
                  onClick={handleClosePreview}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
