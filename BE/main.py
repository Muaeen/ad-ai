#!/usr/bin/env python3
"""
AD-AI FastAPI Backend

FastAPI backend for the AD-AI Streamlit application.
Provides endpoints for image upload, color recommendation, and ad generation.
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import tempfile
from typing import Optional, List
import uuid
from pathlib import Path

from src.ad_generator import configure_logging, generate_ad_image, generate_ad_image_bytes, colors_recommendation
from src.miniodb import MinioClient

# Initialize FastAPI app
app = FastAPI(title="AD-AI API", description="AI-powered advertisement generator")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logger = configure_logging()

# Initialize MinIO client with environment-based configuration
minio_endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
minio_access_key = os.getenv("MINIO_ACCESS_KEY", "minio")
minio_secret_key = os.getenv("MINIO_SECRET_KEY", "minio123")
minio_secure = os.getenv("MINIO_SECURE", "false").lower() == "true"

minio_client = MinioClient(
    endpoint=minio_endpoint,
    access_key=minio_access_key,
    secret_key=minio_secret_key,
    secure=minio_secure
)
BUCKET_NAME = "ad-images"

# Create uploads directory if it doesn't exist (for temporary storage)
UPLOAD_DIR = "temp_uploads"
OUTPUT_DIR = "generated_ads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AD-AI API is running"}


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file to MinIO bucket and return the file info"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        temp_filename = f"{file_id}{file_extension}"
        
        # Save to temporary local storage first
        temp_filepath = os.path.join(UPLOAD_DIR, temp_filename)
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Upload to MinIO bucket
        minio_object_name = f"inputs/{temp_filename}"
        minio_url = minio_client.upload_image(BUCKET_NAME, temp_filepath, minio_object_name)
        
        if not minio_url:
            raise HTTPException(status_code=500, detail="Failed to upload image to storage")
        
        logger.info(f"Image uploaded to MinIO: {minio_url}")
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": temp_filename,
            "local_path": temp_filepath,
            "minio_url": minio_url,
            "minio_object_name": minio_object_name,
            "message": "Image uploaded successfully to cloud storage"
        }
        
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@app.post("/recommend-colors")
async def recommend_colors(
    product_name: str = Form(...),
    file_id: str = Form(...)
):
    """Get AI color recommendations for a product"""
    try:
        # Find uploaded file in temp directory
        uploaded_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
        if not uploaded_files:
            raise HTTPException(status_code=404, detail="Uploaded image not found")
        
        image_path = os.path.join(UPLOAD_DIR, uploaded_files[0])
        
        # Get color recommendations
        logger.info(f"Getting color recommendations for {product_name}")
        recommended_colors = colors_recommendation(product_name, image_path)
        
        return {
            "success": True,
            "product_name": product_name,
            "recommended_colors": recommended_colors,
            "message": f"AI recommends these colors for {product_name}"
        }
        
    except Exception as e:
        logger.error(f"Color recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get color recommendations: {str(e)}")


@app.post("/generate-ad")
async def generate_ad(
    product_name: str = Form(...),
    brand_name: str = Form(...),
    file_id: str = Form(...),
    use_smart_colors: bool = Form(False),
    number_of_colors: Optional[int] = Form(None),
    colors: Optional[str] = Form(None)
):
    """Generate advertisement image and save to MinIO bucket"""
    try:
        # Find uploaded file
        uploaded_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
        if not uploaded_files:
            raise HTTPException(status_code=404, detail="Uploaded image not found")
        
        image_path = os.path.join(UPLOAD_DIR, uploaded_files[0])
        
        # Generate unique output filename
        output_id = str(uuid.uuid4())
        output_filename = os.path.join(OUTPUT_DIR, f"{product_name}_{brand_name}_{output_id}.jpg")
        
        # Parse colors if provided
        colors_list = None
        if colors and not use_smart_colors:
            colors_list = [color.strip() for color in colors.split(',') if color.strip()]
        
        logger.info(f"Generating ad for {product_name} by {brand_name}")
        logger.info(f"Use smart colors: {use_smart_colors}, Manual colors: {colors_list}")
        
        # Generate the advertisement as bytes for direct MinIO upload
        image_bytes = generate_ad_image_bytes(
            product_name=product_name,
            brand_name=brand_name,
            image_path=image_path,
            number_of_colors=number_of_colors,
            colors=colors_list,
            use_smart_colors=use_smart_colors
        )
        
        # Also save locally as backup
        with open(output_filename, "wb") as f:
            f.write(image_bytes)
        
        # Upload generated image to MinIO bucket (in background/parallel)
        output_filename_only = os.path.basename(output_filename)
        minio_object_name = f"outputs/{output_filename_only}"
        
        # Try to upload to MinIO but don't block the response
        minio_url = None
        try:
            minio_url = minio_client.upload_image_from_bytes(
                BUCKET_NAME, 
                image_bytes, 
                minio_object_name,
                content_type="image/jpeg"
            )
            if minio_url:
                logger.info(f"Generated ad uploaded to MinIO: {minio_url}")
            else:
                logger.warning("Failed to upload generated image to MinIO")
        except Exception as e:
            logger.warning(f"MinIO upload failed, but proceeding: {e}")
        
        # Encode image bytes to base64 for direct display
        import base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        return {
            "success": True,
            "product_name": product_name,
            "brand_name": brand_name,
            "local_file": output_filename,
            "minio_url": minio_url,
            "minio_object_name": minio_object_name,
            "image_base64": image_base64,
            "download_url": f"/download/{output_filename_only}",
            "message": "Advertisement generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Ad generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate advertisement: {str(e)}")


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download generated advertisement file from MinIO or local storage"""
    try:
        # First try to get from MinIO
        minio_object_name = f"outputs/{filename}"
        minio_url = minio_client.get_image_url(BUCKET_NAME, minio_object_name)
        
        if minio_url:
            # Return redirect to MinIO URL
            return JSONResponse({
                "success": True,
                "download_url": minio_url,
                "source": "minio"
            })
        
        # Fallback to local file
        local_file_path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(local_file_path):
            # For local files, we'd need to serve them directly
            # But since we want to use MinIO, let's upload to MinIO first
            minio_url = minio_client.upload_image(BUCKET_NAME, local_file_path, minio_object_name)
            if minio_url:
                return JSONResponse({
                    "success": True,
                    "download_url": minio_client.get_image_url(BUCKET_NAME, minio_object_name),
                    "source": "uploaded_to_minio"
                })
        
        raise HTTPException(status_code=404, detail="File not found")
        
    except Exception as e:
        logger.error(f"File download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get download URL: {str(e)}")


@app.delete("/cleanup/{file_id}")
async def cleanup_files(file_id: str):
    """Clean up temporary files (local only, MinIO files are kept)"""
    try:
        # Clean up uploaded file from local temp storage
        uploaded_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
        for file in uploaded_files:
            file_path = os.path.join(UPLOAD_DIR, file)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up local temp file: {file_path}")
        
        return {
            "success": True,
            "message": f"Cleaned up temporary files for {file_id}"
        }
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cleanup files: {str(e)}")


@app.get("/list-images/{image_type}")
async def list_images(image_type: str):
    """List images from MinIO bucket (inputs or outputs)"""
    try:
        if image_type not in ["inputs", "outputs"]:
            raise HTTPException(status_code=400, detail="image_type must be 'inputs' or 'outputs'")
        
        prefix = f"{image_type}/"
        images = minio_client.list_images(BUCKET_NAME, prefix=prefix)
        
        return {
            "success": True,
            "image_type": image_type,
            "images": images,
            "count": len(images)
        }
        
    except Exception as e:
        logger.error(f"Failed to list images: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list images: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)