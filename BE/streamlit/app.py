import streamlit as st
import requests
import os
from PIL import Image
import time

# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

def main():
    st.set_page_config(
        page_title="AD-AI Generator",
        page_icon="🎨",
        layout="wide"
    )
    
    st.title("🎨 AD-AI Generator")
    st.markdown("Generate beautiful advertisements with AI-powered color recommendations!")
    
    # Initialize session state
    if 'file_id' not in st.session_state:
        st.session_state.file_id = None
    if 'uploaded_file' not in st.session_state:
        st.session_state.uploaded_file = None
    if 'recommended_colors' not in st.session_state:
        st.session_state.recommended_colors = None
    
    # Step 1: Image Upload
    st.header("📸 Step 1: Upload Product Image")
    uploaded_file = st.file_uploader(
        "Choose an image file",
        type=['png', 'jpg', 'jpeg', 'webp'],
        help="Upload an image of your product"
    )
    
    if uploaded_file is not None:
        # Display uploaded image
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)
        
        with col2:
            # Step 2: Product Information
            st.subheader("📝 Product Information")
            product_name = st.text_input("Product Name", placeholder="e.g., smartphone, perfume, car")
            brand_name = st.text_input("Brand Name", placeholder="e.g., Apple, Nike, BMW")
            
            if product_name and brand_name:
                # Upload image to API if not already uploaded
                if st.session_state.uploaded_file != uploaded_file.name or st.session_state.file_id is None:
                    with st.spinner("Uploading image..."):
                        file_id = upload_image_to_api(uploaded_file)
                        if file_id:
                            st.session_state.file_id = file_id
                            st.session_state.uploaded_file = uploaded_file.name
                            st.success("✅ Image uploaded successfully!")
                        else:
                            st.error("❌ Failed to upload image")
                            return
                
                # Step 3: Color Selection Method
                st.subheader("🎨 Color Selection")
                color_method = st.radio(
                    "How would you like to choose colors?",
                    options=["🤖 Let AI recommend colors", "🎯 I'll choose my own colors"],
                    help="AI will analyze your product image to recommend optimal colors"
                )
                
                if color_method == "🤖 Let AI recommend colors":
                    # AI Color Recommendation
                    if st.button("🔍 Get AI Color Recommendations"):
                        with st.spinner("🤖 AI is analyzing your product image..."):
                            colors = get_color_recommendations(product_name, st.session_state.file_id)
                            if colors:
                                st.session_state.recommended_colors = colors
                                st.success(f"🎨 AI recommends: **{', '.join(colors)}**")
                            else:
                                st.error("❌ Failed to get color recommendations")
                    
                    # Show recommended colors if available
                    if st.session_state.recommended_colors:
                        st.info(f"🎨 Recommended colors: **{', '.join(st.session_state.recommended_colors)}**")
                        
                        if st.button("🚀 Generate Advertisement with AI Colors"):
                            generate_advertisement(
                                product_name, brand_name, st.session_state.file_id,
                                use_smart_colors=True
                            )
                
                elif color_method == "🎯 I'll choose my own colors":
                    # Manual Color Selection
                    st.subheader("🎯 Manual Color Selection")
                    
                    num_colors = st.selectbox(
                        "Number of colors (max 3)",
                        options=[1, 2, 3],
                        index=1
                    )
                    
                    colors = []
                    for i in range(num_colors):
                        color = st.text_input(
                            f"Color {i+1}",
                            placeholder="e.g., electric blue, hot pink, golden yellow",
                            key=f"color_{i}"
                        )
                        if color:
                            colors.append(color)
                    
                    if len(colors) == num_colors and all(colors):
                        st.info(f"🎨 Your colors: **{', '.join(colors)}**")
                        
                        if st.button("🚀 Generate Advertisement with Your Colors"):
                            generate_advertisement(
                                product_name, brand_name, st.session_state.file_id,
                                use_smart_colors=False,
                                number_of_colors=num_colors,
                                colors=','.join(colors)
                            )


def upload_image_to_api(uploaded_file):
    """Upload image to FastAPI backend"""
    try:
        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
        response = requests.post(f"{API_BASE_URL}/upload-image", files=files)
        
        if response.status_code == 200:
            result = response.json()
            return result["file_id"]
        else:
            st.error(f"Upload failed: {response.text}")
            return None
            
    except Exception as e:
        st.error(f"Upload error: {str(e)}")
        return None


def get_color_recommendations(product_name, file_id):
    """Get AI color recommendations from FastAPI backend"""
    try:
        data = {
            "product_name": product_name,
            "file_id": file_id
        }
        response = requests.post(f"{API_BASE_URL}/recommend-colors", data=data)
        
        if response.status_code == 200:
            result = response.json()
            return result["recommended_colors"]
        else:
            st.error(f"Color recommendation failed: {response.text}")
            return None
            
    except Exception as e:
        st.error(f"Color recommendation error: {str(e)}")
        return None


def generate_advertisement(product_name, brand_name, file_id, use_smart_colors=False, 
                         number_of_colors=None, colors=None):
    """Generate advertisement using FastAPI backend"""
    try:
        with st.spinner("🎨 Generating your advertisement... This may take a moment."):
            data = {
                "product_name": product_name,
                "brand_name": brand_name,
                "file_id": file_id,
                "use_smart_colors": use_smart_colors
            }
            
            if not use_smart_colors:
                data["number_of_colors"] = number_of_colors
                data["colors"] = colors
            
            response = requests.post(f"{API_BASE_URL}/generate-ad", data=data)
            
            if response.status_code == 200:
                result = response.json()
                
                # Display success message
                st.success("🎉 Advertisement generated successfully!")
                
                # Display the generated image
                st.subheader("🖼️ Your Generated Advertisement")
                
                # Get the image data from the API response
                image_base64 = result.get('image_base64')
                if image_base64:
                    # Display image directly from base64 data
                    try:
                        import base64
                        from io import BytesIO
                        
                        # Decode base64 to bytes
                        image_bytes = base64.b64decode(image_base64)
                        
                        # Display the image
                        st.image(image_bytes, caption=f"{product_name} - {brand_name} Advertisement")
                        
                        # Provide download button
                        st.download_button(
                            label="📥 Download Advertisement",
                            data=image_bytes,
                            file_name=f"{product_name}_{brand_name}_ad.jpg",
                            mime="image/jpeg"
                        )
                        
                    except Exception as img_error:
                        st.error(f"Failed to display image: {img_error}")
                        
                        # Fallback: try MinIO URL if available
                        minio_url = result.get('minio_url')
                        if minio_url:
                            try:
                                st.image(minio_url, caption=f"{product_name} - {brand_name} Advertisement")
                                
                                # Download from MinIO for button
                                img_response = requests.get(minio_url)
                                if img_response.status_code == 200:
                                    st.download_button(
                                        label="📥 Download Advertisement",
                                        data=img_response.content,
                                        file_name=f"{product_name}_{brand_name}_ad.jpg",
                                        mime="image/jpeg"
                                    )
                            except Exception as minio_error:
                                st.error(f"Failed to display from MinIO: {minio_error}")
                        else:
                            st.error("No image data available")
                else:
                    st.error("No image data received from API")
                
                # Show additional info
                with st.expander("📋 Generation Details"):
                    details = {
                        "Product": product_name,
                        "Brand": brand_name,
                        "Smart Colors": use_smart_colors,
                        "Display Source": "Direct from API (Base64)",
                        "Saved to Bucket": "✅ Yes" if result.get('minio_url') else "❌ Failed",
                        "Object Name": result.get('minio_object_name', 'N/A')
                    }
                    if result.get('minio_url'):
                        details["MinIO URL"] = result.get('minio_url')
                    
                    st.json(details)
                
                # Cleanup backend files
                cleanup_files(file_id)
                
            else:
                st.error(f"Generation failed: {response.text}")
                
    except Exception as e:
        st.error(f"Generation error: {str(e)}")


def cleanup_files(file_id):
    """Clean up temporary files on the backend"""
    try:
        requests.delete(f"{API_BASE_URL}/cleanup/{file_id}")
    except:
        pass  # Silent cleanup


def check_api_connection():
    """Check if FastAPI backend is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        return response.status_code == 200
    except:
        return False


if __name__ == "__main__":
    # Check API connection
    if not check_api_connection():
        st.error("🚨 Cannot connect to AD-AI API backend!")
        st.info("Please make sure the FastAPI server is running on http://localhost:8000")
        st.code("python main.py", language="bash")
    else:
        main()
