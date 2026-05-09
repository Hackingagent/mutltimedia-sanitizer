import { useState, useRef } from 'react'
import './App.css'

function MainApp() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState(null)
  
  const [isSanitizing, setIsSanitizing] = useState(false)
  const [sanitizedData, setSanitizedData] = useState(null)
  
  const [isExporting, setIsExporting] = useState(false)

  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    handleFileSelection(selectedFile)
  }

  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile)
      // Create local preview
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
      // Reset state
      setReport(null)
      setSanitizedData(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsHovering(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const performAnalysis = async () => {
    if (!file) return
    
    setIsAnalyzing(true)
    setReport(null)
    setSanitizedData(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error("Error analyzing image:", error)
      alert("Failed to connect to the analysis engine. Ensure backend is running.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const triggerSanitization = async () => {
    if (!report || !report.filename) return
    
    setIsSanitizing(true)
    
    try {
      const response = await fetch('http://localhost:8000/sanitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: report.filename }),
      })
      
      const data = await response.json()
      setSanitizedData(data)
      
      // Update preview to sanitized image
      if (data.sanitized_url) {
        setPreview(data.sanitized_url)
      }
    } catch (error) {
      console.error("Error sanitizing image:", error)
      alert("Sanitization process failed.")
    } finally {
      setIsSanitizing(false)
    }
  }

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank');
    }
  }

  const downloadMetadata = async () => {
    if (!report || !report.filename) return
    setIsExporting(true)
    try {
      const response = await fetch('http://localhost:8000/export-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: report.filename }),
      })
      
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = report.filename + "_metadata_backup.json"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to retrieve metadata backup.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Multimedia Security Analyzer</h1>
        <p>Extract, Detect, and Sanitize Hidden Image Forensics</p>
      </header>

      <main className="grid-layout">
        {/* Left Side: Upload Panel */}
        <section className="glass-panel">
          <div 
            className={`uploader-area ${isHovering ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true) }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {preview ? (
              <div className="image-preview-container">
                <img src={preview} alt="Target" className="image-preview" />
              </div>
            ) : (
              <>
                <div className="upload-icon">📸</div>
                <div className="upload-text">Drag & Drop Image Here</div>
                <div className="upload-hint">or click to browse local files</div>
              </>
            )}
          </div>
          
          <button 
            className="analyze-btn" 
            onClick={performAnalysis}
            disabled={!file || isAnalyzing}
          >
            {isAnalyzing ? (
              <><span className="loader"></span> Processing...</>
            ) : (
              <>🔍 Analyze Metadata</>
            )}
          </button>
        </section>

        {/* Right Side: Results Panel */}
        <section className="glass-panel">
          {report ? (
            <div className="analysis-results">
              <div className="results-header">
                <h2>Security Report</h2>
                <div className="processing-time">
                  ⏱️ {report.processing_time_ms} ms computed
                </div>
              </div>

              <div className="score-panel">
                <div className={`score-circle ${report.risk_level}`}>
                  <span className="score-value">{report.risk_score}</span>
                  <span className="score-max">/100</span>
                </div>
                <div className="score-details">
                  <h3 style={{color: `var(--${report.risk_level.toLowerCase()})`}}>
                    {report.risk_level} RISK
                  </h3>
                  <p>
                    {report.hasMetadata 
                      ? `${report.findings?.length || 0} Vulnerabilities Detected` 
                      : "File is completely clean. No metadata found."}
                  </p>
                </div>
              </div>

              {report.hasMetadata && report.findings?.length > 0 && (
                <div className="findings-list">
                  {report.findings.map((finding, idx) => (
                    <div className="finding-card" key={idx}>
                      <div className="finding-header">
                        <span className={`severity-badge ${finding.severity}`}>
                          {finding.severity}
                        </span>
                        <strong>{finding.category}</strong>
                      </div>
                      <div className="finding-content">
                        <p className="finding-desc">{finding.description}</p>
                        <div className="finding-data">
                          <pre>{JSON.stringify(finding.data, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conditional Sanitization Control */}
              {report.hasMetadata && (
                <>
                  <div className="sanitize-panel">
                    <div>
                      <h4>Image Requires Cleaning</h4>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                        Purge all forensic data to create a secure, shareable copy.
                      </p>
                    </div>
                    
                    {sanitizedData ? (
                      <div style={{display: 'flex', gap: '0.75rem'}}>
                        <button className="sanitize-btn success" disabled>
                          ✅ Sanitized Successfully
                        </button>
                        <button 
                          className="sanitize-btn"
                          style={{background: 'var(--accent-blue)', color: '#fff'}}
                          onClick={() => downloadImage(sanitizedData.sanitized_url, sanitizedData.sanitized_filename)}
                        >
                           ⬇️ Download Copy
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="sanitize-btn"
                        onClick={triggerSanitization}
                        disabled={isSanitizing}
                      >
                        {isSanitizing ? (
                          <><span className="loader"></span> Purging...</>
                        ) : (
                          <>🛡️ Sanitize Image</>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="archive-panel">
                    <div>
                      <h4>Forensics Archive</h4>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                        Retrieve the exact raw EXIF profile before it is destroyed.
                      </p>
                    </div>
                    <button 
                      className="archive-btn"
                      onClick={downloadMetadata}
                      disabled={isExporting}
                    >
                      {isExporting ? "Exporting..." : "💾 Download JSON Backup"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Awaiting Input</h3>
              <p>Upload a file to detect GPS, device IDs, and invisible metadata.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function AdminRecovery() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isRecovering, setIsRecovering] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setResult(null)
      setErrorMsg(null)
    }
  }

  const triggerRecovery = async () => {
    if (!file) return
    setIsRecovering(true)
    setErrorMsg(null)
    setResult(null)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/unsanitize', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      
      if (!response.ok) {
        setErrorMsg(data.detail || "Recovery failed")
      } else {
        setResult(data)
        setPreview(data.recovered_url)
      }
    } catch (err) {
      setErrorMsg("Failed to connect to recovery server.")
    } finally {
      setIsRecovering(false)
    }
  }

  const downloadFinal = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  }

  return (
    <div className="app-container admin-theme">
      <header className="header">
        <h1 style={{background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text'}}>
          Secret EXIF Vault
        </h1>
        <p>Upload a sanitized image to instantly reconstruct its original GPS and hardware metadata.</p>
      </header>

      <main style={{maxWidth: '600px', margin: '0 auto'}}>
        <section className="glass-panel" style={{borderColor: 'rgba(16, 185, 129, 0.4)'}}>
          <div 
            className="uploader-area active"
            style={{borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)'}}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
            {preview ? (
              <div className="image-preview-container">
                <img src={preview} alt="Target" className="image-preview" />
              </div>
            ) : (
              <>
                <div className="upload-icon">🔐</div>
                <div className="upload-text">Upload Sanitized File</div>
                <div className="upload-hint">Must precisely match our Vault signature logs.</div>
              </>
            )}
          </div>
          
          {errorMsg && (
            <div style={{color: 'white', background: '#dc2626', padding: '1rem', borderRadius: '10px', marginTop: '1.5rem', textAlign: 'center'}}>
              {errorMsg}
            </div>
          )}

          {result ? (
             <div style={{marginTop: '1.5rem'}}>
                <button 
                  className="analyze-btn" 
                  style={{background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none'}}
                  onClick={() => downloadFinal(result.recovered_url, result.recovered_filename)}
                >
                  ✅ Download Fully Restored Image
                </button>
             </div>
          ) : (
            <button 
              className="analyze-btn" 
              style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}
              onClick={triggerRecovery}
              disabled={!file || isRecovering}
            >
              {isRecovering ? <><span className="loader"></span> Accessing Vault...</> : <>🪄 Unsanitize & Recover Data</>}
            </button>
          )}

          <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
            <a href="/" style={{color: 'var(--text-secondary)'}}>← Back to Main Tool</a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  const path = window.location.pathname;
  if (path === '/secret-recovery') {
    return <AdminRecovery />;
  }
  return <MainApp />;
}
