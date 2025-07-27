#!/usr/bin/env python3
"""
AD-AI FastAPI Backend

FastAPI backend for the AD-AI Streamlit application.
Provides endpoints for image upload, color recommendation, and ad generation.
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import tempfile
from typing import Optional, List
import uuid
import asyncio
from typing import Dict

from src.ad_generator import configure_logging, generate_ad_image

# Initialize FastAPI app
app = FastAPI(title="AD-AI API", description="AI-powered advertisement generator")

# Store active generation tasks
active_generations: Dict[str, asyncio.Task] = {}

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

# Create uploads directory if it doesn't exist
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
    """Upload an image file and return the file path"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        temp_filename = f"{file_id}{file_extension}"
        temp_filepath = os.path.join(UPLOAD_DIR, temp_filename)
        
        # Save uploaded file
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Image uploaded: {temp_filepath}")
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": temp_filename,
            "filepath": temp_filepath,
            "message": "Image uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Image upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@app.post("/generate-ad")
async def generate_ad(
    product_name: str = Form(...),
    brand_name: str = Form(...),
    file_id: str = Form(...),
    use_smart_colors: bool = Form(False),
    number_of_colors: Optional[int] = Form(None),
    colors: Optional[str] = Form(None)
):
    """Generate advertisement image"""
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
        
        # Create async wrapper for the generation function
        async def async_generate_ad():
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                None,
                lambda: generate_ad_image(
                    product_name=product_name,
                    brand_name=brand_name,
                    image_path=image_path,
                    output_filename=output_filename,
                    number_of_colors=number_of_colors,
                    colors=colors_list,
                    use_smart_colors=use_smart_colors
                )
            )
        
        # Create and store the task
        task = asyncio.create_task(async_generate_ad())
        active_generations[file_id] = task
        
        try:
            # Wait for the generation to complete
            result = await task
        except asyncio.CancelledError:
            logger.info(f"Generation cancelled for {file_id}")
            raise HTTPException(status_code=499, detail="Generation cancelled by user")
        finally:
            # Clean up the task from active generations
            active_generations.pop(file_id, None)
        
        # Extract result data
        if isinstance(result, dict):
            result_file = result["output_filename"]
            colors_used = result["colors_used"]
            num_colors = result["number_of_colors"]
        else:
            # Backward compatibility
            result_file = result
            colors_used = colors_list if colors_list else []
            num_colors = number_of_colors if number_of_colors else 0
        
        return {
            "success": True,
            "product_name": product_name,
            "brand_name": brand_name,
            "output_file": result_file,
            "download_url": f"/download/{os.path.basename(result_file)}",
            "colors_used": colors_used,
            "number_of_colors": num_colors,
            "use_smart_colors": use_smart_colors,
            "message": "Advertisement generated successfully"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Ad generation failed: {e}")
        # Clean up the task from active generations on error
        active_generations.pop(file_id, None)
        raise HTTPException(status_code=500, detail=f"Failed to generate advertisement: {str(e)}")


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download generated advertisement file"""
    try:
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='image/jpeg'
        )
        
    except Exception as e:
        logger.error(f"File download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")


@app.delete("/cleanup/{file_id}")
async def cleanup_files(file_id: str):
    """Clean up temporary files"""
    try:
        # Clean up uploaded file
        uploaded_files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
        for file in uploaded_files:
            file_path = os.path.join(UPLOAD_DIR, file)
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up: {file_path}")
        
        return {
            "success": True,
            "message": f"Cleaned up files for {file_id}"
        }
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cleanup files: {str(e)}")


@app.post("/cancel-generation/{file_id}")
async def cancel_generation(file_id: str):
    """Cancel an ongoing ad generation"""
    try:
        if file_id in active_generations:
            task = active_generations[file_id]
            task.cancel()
            del active_generations[file_id]
            logger.info(f"Generation cancelled for {file_id}")
            return {
                "success": True,
                "message": f"Generation cancelled for {file_id}"
            }
        else:
            return {
                "success": False,
                "message": "No active generation found for this file_id"
            }
    except Exception as e:
        logger.error(f"Cancel generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel generation: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)