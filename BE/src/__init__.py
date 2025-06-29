"""
AD-AI Source Package

This package contains the core functionality for generating advertisement images
using OpenAI's image editing capabilities.

Features:
- Random color selection (1-3 colors) when not specified
- AI-powered smart color recommendations using computer vision
- Comprehensive logging throughout the process
- Modular function design for easy customization
"""

from .ad_generator import (
    configure_logging,
    load_environment,
    initialize_openai_client,
    create_template_prompt,
    validate_image_file,
    edit_image_with_openai,
    process_api_response,
    save_image,
    colors_recommendation,
    get_smart_colors,
    generate_ad_image,
    main
)

__version__ = "1.2.0"
__author__ = "AD-AI Team"

__all__ = [
    "configure_logging",
    "load_environment", 
    "initialize_openai_client",
    "create_template_prompt",
    "validate_image_file",
    "edit_image_with_openai",
    "process_api_response",
    "save_image",
    "colors_recommendation",
    "get_smart_colors",
    "generate_ad_image",
    "main"
] 