import os
import logging
from minio import Minio
from minio.error import S3Error
from typing import Optional
import uuid
from pathlib import Path

class MinioClient:
    def __init__(
        self,
        endpoint: str = "localhost:9000",
        access_key: str = "minio",
        secret_key: str = "minio123",
        secure: bool = False
    ):
        """Initialize Minio client"""
        self.client = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.logger = logging.getLogger(__name__)
    
    def create_bucket(self, bucket_name: str) -> bool:
        """Create a bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)
                self.logger.info(f"Bucket '{bucket_name}' created successfully")
                return True
            else:
                self.logger.info(f"Bucket '{bucket_name}' already exists")
                return True
        except S3Error as e:
            self.logger.error(f"Error creating bucket '{bucket_name}': {e}")
            return False
    
    def upload_image(
        self, 
        bucket_name: str, 
        file_path: str, 
        object_name: Optional[str] = None
    ) -> Optional[str]:
        """Upload an image to bucket"""
        try:
            # Ensure bucket exists
            if not self.create_bucket(bucket_name):
                return None
            
            # Generate unique object name if not provided
            if object_name is None:
                file_ext = Path(file_path).suffix
                object_name = f"images/{uuid.uuid4()}{file_ext}"
            
            # Upload file
            self.client.fput_object(bucket_name, object_name, file_path)
            self.logger.info(f"Image uploaded successfully: {object_name}")
            
            # Return the object URL
            return f"http://localhost:9000/{bucket_name}/{object_name}"
            
        except S3Error as e:
            self.logger.error(f"Error uploading image: {e}")
            return None
        except FileNotFoundError:
            self.logger.error(f"File not found: {file_path}")
            return None
    
    def upload_image_from_bytes(
        self, 
        bucket_name: str, 
        image_data: bytes, 
        object_name: str,
        content_type: str = "image/jpeg"
    ) -> Optional[str]:
        """Upload image from bytes data"""
        try:
            from io import BytesIO
            
            # Ensure bucket exists
            if not self.create_bucket(bucket_name):
                return None
            
            # Upload from bytes
            self.client.put_object(
                bucket_name, 
                object_name, 
                BytesIO(image_data), 
                len(image_data),
                content_type=content_type
            )
            self.logger.info(f"Image uploaded from bytes: {object_name}")
            
            return f"http://localhost:9000/{bucket_name}/{object_name}"
            
        except S3Error as e:
            self.logger.error(f"Error uploading image from bytes: {e}")
            return None
    
    def get_image_url(self, bucket_name: str, object_name: str) -> Optional[str]:
        """Get presigned URL for an image"""
        try:
            url = self.client.presigned_get_object(bucket_name, object_name)
            return url
        except S3Error as e:
            self.logger.error(f"Error getting image URL: {e}")
            return None
    
    def list_images(self, bucket_name: str, prefix: str = "images/") -> list:
        """List all images in bucket"""
        try:
            objects = self.client.list_objects(bucket_name, prefix=prefix)
            return [obj.object_name for obj in objects]
        except S3Error as e:
            self.logger.error(f"Error listing images: {e}")
            return []
    
    def delete_image(self, bucket_name: str, object_name: str) -> bool:
        """Delete an image from bucket"""
        try:
            self.client.remove_object(bucket_name, object_name)
            self.logger.info(f"Image deleted: {object_name}")
            return True
        except S3Error as e:
            self.logger.error(f"Error deleting image: {e}")
            return False

# Usage example
def example_usage():
    # Initialize client
    minio_client = MinioClient()
    
    # Create bucket and upload image
    bucket_name = "ad-images"
    image_path = "../images/ai-output/car_jetour_ad.jpg"

    # Upload image
    image_url = minio_client.upload_image(bucket_name, image_path)
    if image_url:
        print(f"Image uploaded successfully: {image_url}")
    
    # List images
    images = minio_client.list_images(bucket_name)
    print(f"Images in bucket: {images}")

if __name__ == "__main__":
    example_usage()
