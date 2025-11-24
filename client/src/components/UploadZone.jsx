import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Camera } from 'lucide-react';

const UploadZone = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            onFileSelect(file, e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileSelect(null, null);
    };

    return (
        <div
            className={`upload-zone ${isDragging ? 'dragging' : ''} ${preview ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {preview ? (
                <div className="preview-container">
                    <img src={preview} alt="Upload preview" className="preview-image" />
                    <button className="remove-btn" onClick={clearFile}>
                        <X size={20} />
                    </button>
                    <div className="preview-overlay">
                        <p>Click or drop to replace</p>
                    </div>
                </div>
            ) : (
                <div className="upload-content">
                    <div className="icon-circle">
                        <Upload size={32} />
                    </div>
                    <h3>Upload Image to Analyze</h3>
                    <p>Drag and drop your image here, or click to browse</p>
                    <div className="upload-methods">
                        <span className="method-tag"><ImageIcon size={14} /> JPG, PNG</span>
                        <span className="method-tag"><Camera size={14} /> Camera</span>
                    </div>
                </div>
            )}

            <style>{`
        .upload-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-2xl);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-normal);
          background-color: var(--color-background);
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--color-accent);
          background-color: rgba(59, 130, 246, 0.05);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          pointer-events: none;
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          background-color: var(--color-surface);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
          box-shadow: var(--shadow-md);
          margin-bottom: var(--spacing-sm);
        }

        .upload-zone h3 {
          font-size: 1.25rem;
          color: var(--color-text-main);
        }

        .upload-zone p {
          color: var(--color-text-muted);
        }

        .upload-methods {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }

        .method-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          background-color: var(--color-surface);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
        }

        .preview-container {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 400px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
        }

        .remove-btn {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color var(--transition-fast);
          z-index: 10;
        }

        .remove-btn:hover {
          background-color: var(--color-error);
        }

        .preview-overlay {
          position: absolute;
          bottom: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .upload-zone:hover .preview-overlay {
          opacity: 1;
        }
      `}</style>
        </div>
    );
};

export default UploadZone;
