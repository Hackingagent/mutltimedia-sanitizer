from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import os
import shutil
from analyzer import MetadataSecurityAnalyzer

app = FastAPI(title="Multimedia Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
analyzer = MetadataSecurityAnalyzer()

# Mount uploads so images can be viewed
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

class SanitizeRequest(BaseModel):
    filename: str

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    file_path = os.path.join("uploads", file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    report = analyzer.generate_report(file_path)
    report["filename"] = file.filename
    report["file_url"] = f"http://localhost:8000/uploads/{file.filename}"
    return report

@app.post("/sanitize")
async def sanitize_image(req: SanitizeRequest):
    input_path = os.path.join("uploads", req.filename)
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    output_filename = "sanitized_" + req.filename
    output_path = os.path.join("uploads", output_filename)
    
    result = analyzer.sanitize_metadata(input_path, output_path)
    
    return {
        "result": result, 
        "sanitized_filename": output_filename,
        "sanitized_url": f"http://localhost:8000/uploads/{output_filename}"
    }

@app.post("/export-metadata")
async def export_metadata(req: SanitizeRequest):
    input_path = os.path.join("uploads", req.filename)
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    meta = analyzer.get_raw_metadata_json(input_path)
    if not meta:
        raise HTTPException(status_code=400, detail="No metadata could be retrieved")
        
    return meta
