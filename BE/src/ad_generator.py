import base64
import logging
import os
import time
import random
from openai import OpenAI
from dotenv import load_dotenv


def configure_logging():
    """Configure logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('ad_ai.log'),
            logging.StreamHandler()
        ]
    )
    
    logger = logging.getLogger(__name__)
    logger.info("Logging configured successfully")
    return logger


def load_environment():
    """Load environment variables from .env file."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Loading environment variables...")
        load_dotenv()
        logger.info("Environment variables loaded successfully")
        
        # Validate required environment variables
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY is required")
            
        return api_key
    except Exception as e:
        logger.error(f"Failed to load environment variables: {e}")
        raise


def initialize_openai_client(api_key):
    """Initialize and return OpenAI client."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Initializing OpenAI client...")
        client = OpenAI(api_key=api_key)
        logger.info("OpenAI client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {e}")
        raise


def create_template_prompt(product_name, brand_name, number_of_colors=None, colors=None):
    """Create the template prompt for image generation."""
    logger = logging.getLogger(__name__)
    
    logger.info("Creating template prompt...")
    
    # Randomly select number of colors if not provided (1-3)
    if number_of_colors is None:
        number_of_colors = random.randint(1, 3)
        logger.info(f"Randomly selected number of colors: {number_of_colors}")
    
    # Define a list of vibrant colors to choose from
    # color_options = [
    #     "electric blue", "neon green", "hot pink", "bright orange", "deep purple",
    #     "crimson red", "golden yellow", "turquoise", "magenta", "lime green",
    #     "coral", "royal blue", "emerald green", "sunset orange", "violet",
    #     "teal", "ruby red", "amber", "indigo", "chartreuse"
    # ]
    
    # Randomly select colors if not provided
    if colors is None:
        selected_colors = random.sample(color_options, number_of_colors)
        colors = ", ".join(selected_colors)
        logger.info(f"Randomly selected colors: {colors}")
    elif isinstance(colors, list):
        colors = ", ".join(colors)
    
    # Create color instruction based on number of colors
    if number_of_colors == 1:
        color_instruction = f"using exactly one bold, vibrant color: {colors}"
    elif number_of_colors == 2:
        color_instruction = f"using exactly two bold, vibrant colors: {colors}"
    else:
        color_instruction = f"using exactly {number_of_colors} bold, vibrant colors: {colors}"
    
    template_prompt = f"""{product_name} placed at the center in full photorealism, surrounded by surreal vector illustrations {color_instruction} that match the product's mood.
The scene is minimalistic yet energetic, with abstract vector shapes (symbols, lines, expressions, etc.) orbiting or interacting with the product.
Add the real logo clearly and integrate a short 3–4 word slogan at the bottom. {brand_name}
Style: surreal, high-resolution, minimal, cinematic lighting, 1:1 aspect ratio.
"""
    logger.info(f"Template prompt created with {number_of_colors} colors: {colors}")
    logger.info(f"Template prompt preview: {template_prompt[:100]}...")
    return template_prompt


def validate_image_file(image_path):
    """Validate that the input image file exists and is accessible."""
    logger = logging.getLogger(__name__)
    
    logger.info(f"Checking if image file exists: {image_path}")
    if not os.path.exists(image_path):
        logger.error(f"Image file not found: {image_path}")
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    file_size = os.path.getsize(image_path)
    logger.info(f"Image file found, size: {file_size} bytes")
    return file_size


def edit_image_with_openai(client, image_path, prompt):
    """Call OpenAI API to edit the image."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Calling OpenAI image edit API...")
        start_time = time.time()
        
        result = client.images.edit(
            model="gpt-image-1",
            image=[
                open(image_path, "rb"),
            ],
            prompt=prompt
        )
        
        end_time = time.time()
        logger.info(f"OpenAI API call completed successfully in {end_time - start_time:.2f} seconds")
        return result
        
    except Exception as e:
        logger.error(f"Failed during OpenAI API call: {e}")
        raise


def process_api_response(result):
    """Process the API response and decode the image data."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Processing API response...")
        image_base64 = result.data[0].b64_json
        logger.info(f"Received base64 image data, length: {len(image_base64)} characters")
        
        logger.info("Decoding base64 image data...")
        image_bytes = base64.b64decode(image_base64)
        logger.info(f"Decoded image size: {len(image_bytes)} bytes")
        
        return image_bytes
        
    except Exception as e:
        logger.error(f"Failed to process API response: {e}")
        raise


def save_image(image_bytes, output_filename):
    """Save the processed image to a file."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Saving image to file: {output_filename}")
        with open(output_filename, "wb") as f:
            f.write(image_bytes)
        
        # Verify file was created successfully
        if os.path.exists(output_filename):
            file_size = os.path.getsize(output_filename)
            logger.info(f"Image saved successfully: {output_filename} ({file_size} bytes)")
            return file_size
        else:
            logger.error(f"Failed to create output file: {output_filename}")
            raise FileNotFoundError(f"Failed to create output file: {output_filename}")
            
    except Exception as e:
        logger.error(f"Failed to save image: {e}")
        raise


def generate_ad_image(product_name="perfume", brand_name="FROM INDEXES", 
                     image_path="images/28a42a6d609f4c9aab116d92057b3367-goods.webp", 
                     output_filename="gift-basket.webp", number_of_colors=None, colors=None,
                     use_smart_colors=False):
    """
    Main function to generate an advertisement image.
    
    Args:
        product_name (str): Name of the product
        brand_name (str): Name of the brand
        image_path (str): Path to the input image
        output_filename (str): Name of the output file
        number_of_colors (int, optional): Number of colors to use (1-3). If None, randomly selected.
        colors (str or list, optional): Colors to use. If None, randomly selected.
        use_smart_colors (bool): If True, uses AI vision to recommend colors based on the product image
        
    Returns:
        str: Path to the generated image file
    """
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting AD image generation process...")
        logger.info(f"Product: {product_name}, Brand: {brand_name}")
        
        # Load environment and initialize client
        api_key = load_environment()
        client = initialize_openai_client(api_key)
        
        # Get smart color recommendations if requested
        if use_smart_colors and colors is None:
            logger.info("Using smart color recommendations based on product image...")
            smart_num_colors, smart_colors = get_smart_colors(product_name, image_path)
            if smart_colors:
                number_of_colors = smart_num_colors
                colors = smart_colors
                logger.info(f"Smart colors recommended: {colors}")
            else:
                logger.info("Smart color recommendation failed, using random selection")
        
        # Create prompt and validate input
        prompt = create_template_prompt(product_name, brand_name, number_of_colors, colors)
        validate_image_file(image_path)
        
        # Generate the image
        result = edit_image_with_openai(client, image_path, prompt)
        image_bytes = process_api_response(result)
        save_image(image_bytes, output_filename)
        
        logger.info("AD image generation completed successfully")
        
        # Return both the filename and the colors used
        return {
            "output_filename": output_filename,
            "colors_used": colors if colors else [],
            "number_of_colors": number_of_colors if number_of_colors else 0
        }
        
    except Exception as e:
        logger.error(f"AD image generation failed: {e}")
        raise


def colors_recommendation(product_name, image_path):
    """
    Recommend 3 colors for the product by analyzing the image.
    
    Args:
        product_name (str): Name of the product for context
        image_path (str): Path to the product image
        
    Returns:
        list: List of 3 recommended color names
    """
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Analyzing image to recommend colors for {product_name}...")
        
        # Validate image file exists
        validate_image_file(image_path)
        
        # Load environment and initialize client
        api_key = load_environment()
        client = initialize_openai_client(api_key)
        
        # Encode image to base64
        logger.info("Encoding image to base64 for vision analysis...")
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Create vision prompt
        vision_prompt = f"""
        Analyze this image of a {product_name} and recommend exactly 3 colors that would work best for creating an eye-catching advertisement.

        Consider:
        1. The product's existing colors and design
        2. Colors that complement the product
        3. Colors that would make the product stand out in an advertisement
        4. Modern, vibrant colors that attract attention

        Please respond with exactly 3 color names separated by commas, for example:
        electric blue, sunset orange, deep purple

        Focus on bold, vibrant colors that would work well for advertising purposes.
        """
        
        logger.info("Calling OpenAI Vision API for color recommendations...")
        start_time = time.time()
        
        response = client.chat.completions.create(
            model="gpt-4o",  # Using GPT-4 with vision capabilities
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": vision_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=100,
            temperature=0.7
        )
        
        end_time = time.time()
        logger.info(f"Vision API call completed in {end_time - start_time:.2f} seconds")
        
        # Extract and parse the color recommendations
        colors_text = response.choices[0].message.content.strip()
        logger.info(f"Raw color recommendations: {colors_text}")
        
        # Parse colors from the response
        colors = [color.strip() for color in colors_text.split(',')]
        
        # Ensure we have exactly 3 colors
        if len(colors) < 3:
            logger.warning(f"Only received {len(colors)} colors, padding with defaults")
            default_colors = ["electric blue", "sunset orange", "deep purple"]
            colors.extend(default_colors[len(colors):3])
        elif len(colors) > 3:
            logger.info(f"Received {len(colors)} colors, taking first 3")
            colors = colors[:3]
        
        logger.info(f"Final recommended colors for {product_name}: {colors}")
        return colors
        
    except Exception as e:
        logger.error(f"Failed to get color recommendations: {e}")
        logger.info("Falling back to default color recommendations")
        # Fallback to default colors if vision analysis fails
        fallback_colors = ["electric blue", "hot pink", "golden yellow"]
        return fallback_colors


def get_smart_colors(product_name, image_path):
    """
    Get intelligent color recommendations and return both colors and count.
    
    Args:
        product_name (str): Name of the product
        image_path (str): Path to the product image
        
    Returns:
        tuple: (number_of_colors, colors_list)
    """
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Getting smart color recommendations...")
        recommended_colors = colors_recommendation(product_name, image_path)
        
        # Always return 3 colors as recommended by the vision analysis
        return 3, recommended_colors
        
    except Exception as e:
        logger.error(f"Smart color recommendation failed: {e}")
        # Fallback to random selection
        logger.info("Falling back to random color selection")
        return None, None


def main():
    """Main entry point for the ad generator."""
    logger = configure_logging()
    logger.info("Starting AD-AI application")
    
    try:
        # Set up configuration
        product_name = "perfume"
        brand_name = "FROM INDEXES"
        image_path = "../images/28a42a6d609f4c9aab116d92057b3367-goods.webp"
        output_filename = "gift-basket.webp"
        
        # Demo: Generate with smart color recommendations
        logger.info("Demo 1: Using smart color recommendations...")
        result = generate_ad_image(
            product_name=product_name,
            brand_name=brand_name,
            image_path=image_path,
            output_filename=f"smart_{output_filename}",
            use_smart_colors=True
        )
        
        # Handle new return format
        if isinstance(result, dict):
            result_file = result["output_filename"]
            colors_used = result["colors_used"]
            logger.info(f"Smart colors demo completed. Output: {result_file}, Colors used: {colors_used}")
        else:
            result_file = result
            logger.info(f"Smart colors demo completed. Output: {result_file}")
        
        # Demo: Generate with random colors
        logger.info("Demo 2: Using random color selection...")
        result_random = generate_ad_image(
            product_name=product_name,
            brand_name=brand_name,
            image_path=image_path,
            output_filename=f"random_{output_filename}"
        )
        
        # Handle new return format
        if isinstance(result_random, dict):
            result_file_random = result_random["output_filename"]
            logger.info(f"Random colors demo completed. Output: {result_file_random}")
        else:
            result_file_random = result_random
            logger.info(f"Random colors demo completed. Output: {result_file_random}")
            
        logger.info(f"AD-AI application completed successfully")
        return result_file
        
    except Exception as e:
        logger.error(f"AD-AI application failed: {e}")
        raise


if __name__ == "__main__":
    main() 