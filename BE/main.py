#!/usr/bin/env python3
"""
AD-AI Main Entry Point

This is the main entry point for the AD-AI application.
All core functionality has been moved to the src package for better organization.

Features:
- Automatic random color selection (1-3 colors) 
- AI-powered smart color recommendations using computer vision
- Optional manual color specification
- Comprehensive logging
"""

from src.ad_generator import configure_logging, generate_ad_image, colors_recommendation


def main():
    """Main entry point for the AD-AI application."""
    # Configure logging
    logger = configure_logging()
    logger.info("Starting AD-AI application from main.py")
    
    try:
        # Configuration parameters
        product_name = "ps5"
        brand_name = "sony"
        image_path = "images/ps5.jpg"
        output_filename = "ps5-ad.jpg"
        
        logger.info(f"Generating ad for product: {product_name}, brand: {brand_name}")
        
        # Option 1: Use smart AI color recommendations
        logger.info("🤖 Using AI vision to analyze product and recommend colors...")
        print(f"🤖 Analyzing {product_name} image to recommend optimal colors...")
        
        try:
            # Get color recommendations first (optional - for preview)
            recommended_colors = colors_recommendation(product_name, image_path)
            print(f"🎨 AI recommends these colors: {', '.join(recommended_colors)}")
            
            # Generate ad with smart colors
            result_file = generate_ad_image(
                product_name=product_name,
                brand_name=brand_name,
                image_path=image_path,
                output_filename=output_filename,
                use_smart_colors=True  # This will use AI vision to recommend colors
            )
            
            print(f"✅ Smart-colored advertisement generated: {result_file}")
            
        except Exception as vision_error:
            logger.warning(f"Smart color recommendation failed: {vision_error}")
            print(f"⚠️  AI vision failed, falling back to manual colors...")
            
            # Option 2: Fallback to manual colors
            result_file = generate_ad_image(
                product_name=product_name,
                brand_name=brand_name,
                image_path=image_path,
                output_filename=output_filename,
                number_of_colors=2,
                colors=["electric blue", "hot pink"]  # Manual override
            )
            
            print(f"✅ Advertisement generated with manual colors: {result_file}")
        
        logger.info(f"AD-AI application completed successfully. Generated: {result_file}")
        return result_file
        
    except Exception as e:
        logger.error(f"AD-AI application failed: {e}")
        print(f"❌ Failed to generate advertisement image: {e}")
        raise


def demo_color_options():
    """Demonstrate different color selection methods."""
    from src.ad_generator import configure_logging, generate_ad_image
    
    configure_logging()
    
    # Example configurations
    product_name = "smartphone"
    brand_name = "TechBrand"
    image_path = "images/phone.jpg"
    
    print("🎨 AD-AI Color Selection Demo\n")
    
    print("1. 🤖 Smart AI Colors (analyzes product image):")
    print("   generate_ad_image(product, brand, image, use_smart_colors=True)")
    
    print("\n2. 🎲 Random Colors (1-3 colors automatically selected):")
    print("   generate_ad_image(product, brand, image)")
    
    print("\n3. 🎯 Manual Colors (specify exact colors):")
    print("   generate_ad_image(product, brand, image, colors=['red', 'blue'])")
    
    print("\n4. 🔢 Custom Count + Random Colors:")
    print("   generate_ad_image(product, brand, image, number_of_colors=2)")


if __name__ == "__main__":
    main()
    
    # Uncomment to see demo
    # demo_color_options()