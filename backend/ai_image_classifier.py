#!/usr/bin/env python3
"""
AI Image Classifier using Google Gemini API for Electronic Waste Detection
"""
import os
import base64
import io
from typing import Dict, List, Tuple, Optional
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

class EwasteImageClassifier:
    def __init__(self, api_key: str):
        """Initialize the Gemini API client"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Configure safety settings to be less restrictive for e-waste detection
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        # Test the API connection
        self._test_api_connection()
    
    def _test_api_connection(self):
        """Test the API connection with a simple request"""
        try:
            # Test with a simple text generation to verify API key works
            test_response = self.model.generate_content("Hello, test connection")
            print("✅ Gemini API connection successful")
            return True
        except Exception as e:
            print(f"⚠️  Gemini API connection test failed: {e}")
            print("   This might be due to an invalid API key or network issues")
            return False
    
    def preprocess_image(self, image_data: bytes) -> Image.Image:
        """Preprocess the uploaded image"""
        try:
            # Open image from bytes
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large (Gemini has size limits)
            max_size = 2048
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            return image
        except Exception as e:
            raise ValueError(f"Invalid image format: {str(e)}")
    
    def analyze_image(self, image: Image.Image) -> Dict:
        """
        Analyze image using Gemini API to detect electronic waste
        Returns classification result with device count, type, and validation
        """
        try:
            print("🤖 Calling Gemini API for image analysis...")
            
            # Create the prompt for electronic waste detection with device type classification
            prompt = """
            You are an expert at identifying electronic devices in images for e-waste recycling purposes.
            
            CRITICAL: Only identify images that contain ACTUAL ELECTRONIC DEVICES. Do NOT classify people, animals, food, furniture, or other non-electronic objects as electronic devices.
            
            Carefully examine this image and identify ONLY electronic devices that can be recycled as e-waste.
            
            IMPORTANT VALIDATION RULES:
            1. The image MUST contain an actual electronic device (phone, laptop, tablet, battery, etc.)
            2. If you see only people, faces, animals, food, furniture, or other non-electronic objects, set is_electronic_waste to FALSE
            3. Electronic devices have screens, buttons, circuits, or electronic components
            4. A person holding a device is valid, but a person without a device is NOT valid
            5. Be very strict - only classify as electronic waste if you can clearly see an electronic device
            
            Please provide your analysis in the following JSON format:
            {
                "is_electronic_waste": true/false,
                "device_count": number,
                "detected_devices": ["specific", "device", "names"],
                "device_type": "smartphone|laptop|battery|tablet|other",
                "device_model": "specific model name like iPhone 13, MacBook Pro, etc.",
                "confidence": 0.0-1.0,
                "message": "detailed explanation of what you see"
            }
            
            Detection Rules:
            1. ONLY look for actual electronic devices - phones, laptops, tablets, batteries, chargers, cameras, headphones, etc.
            2. Electronic devices MUST have: screens, buttons, circuits, electronic components, or be recognizable tech devices
            3. If you see ONLY people, faces, animals, food, furniture, or other non-electronic objects, set is_electronic_waste to FALSE
            4. A person holding a device is valid, but a person without a device is NOT valid
            5. For device_type, classify the most prominent electronic device:
               - "smartphone" for mobile phones, iPhones, Android phones, smartphones (small handheld devices with touchscreens)
               - "laptop" for laptops, computers, notebooks, MacBooks (larger devices with keyboards and screens, typically foldable)
               - "battery" for batteries, power banks, battery packs
               - "tablet" for tablets, iPads, e-readers, touchscreen devices (medium-sized touchscreen devices without keyboards)
               - "other" for other electronic devices (headphones, cameras, gaming devices, etc.)
            
            IMPORTANT LAPTOP DETECTION:
            - Laptops are typically larger than phones, have a keyboard and screen
            - They may be open (showing screen and keyboard) or closed (showing just the lid)
            - Look for rectangular shapes with screens, keyboards, trackpads
            - MacBooks have distinctive aluminum cases and Apple logos
            - Laptops are usually 13-17 inches in size, much larger than phones
            - If you see a device that's clearly a laptop (even if closed), classify it as "laptop" not "smartphone"
            
            5. For device_model, try to identify the specific model with high accuracy:
               - For iPhones: Look for distinctive features like camera layout, notch design, size
                 * "iPhone 15 Pro" (Dynamic Island, titanium frame, triple camera)
                 * "iPhone 14" (notch, dual camera, aluminum frame)
                 * "iPhone 13" (notch, dual camera, smaller notch than 12)
                 * "iPhone 12" (flat edges, notch, dual camera)
                 * "iPhone 11" (notch, dual camera, rounded edges)
                 * "iPhone X" (notch, single rear camera)
                 * "iPhone SE" (home button, single camera, smaller size)
               
               - For Android phones: Look for brand logos, camera arrangements, bezels
                 * "Samsung Galaxy S24" (Samsung logo, multiple cameras)
                 * "Samsung Galaxy S23" (Samsung logo, camera island)
                 * "Google Pixel 8" (Google logo, distinctive camera bar)
                 * "OnePlus 12" (OnePlus logo, alert slider)
                 * "Xiaomi 14" (Xiaomi logo, Leica camera branding)
               
               - For laptops: Look for brand logos, design characteristics, size
                 * "MacBook Pro 16-inch" (Apple logo, large screen, Touch Bar)
                 * "MacBook Air 13-inch" (Apple logo, thin design, no Touch Bar)
                 * "Dell XPS 13" (Dell logo, infinity edge display)
                 * "Dell XPS 15" (Dell logo, larger screen)
                 * "HP Pavilion" (HP logo, traditional laptop design)
                 * "Lenovo ThinkPad" (Lenovo logo, red TrackPoint)
                 * "ASUS ZenBook" (ASUS logo, distinctive design)
               
               - For tablets: Look for brand and size indicators
                 * "iPad Pro 12.9-inch" (Apple logo, large screen, pencil support)
                 * "iPad Air" (Apple logo, medium size)
                 * "iPad" (Apple logo, basic model)
                 * "Samsung Galaxy Tab" (Samsung logo, Android tablet)
               
               - If you can't identify the specific model, use descriptive generic names:
                 * "iPhone" (for any iPhone you can't specifically identify)
                 * "Android Phone" (for any Android phone)
                 * "MacBook" (for any MacBook)
                 * "Windows Laptop" (for any Windows laptop)
                 * "iPad" (for any iPad)
            
            6. Set confidence based on how clearly you can see the electronic device
            7. If you see multiple devices, count them all but focus on the most prominent one for device_type and device_model
            
            Examples of what TO detect:
            - iPhones, Android phones, smartphones (even if held by hand)
            - Laptops, MacBooks, notebooks (even if closed or partially visible)
            - Tablets, iPads, e-readers
            - Batteries, power banks, chargers
            - Headphones, earbuds, speakers
            - Cameras, gaming devices, smartwatches
            - Any device with screens, buttons, or electronic components
            
            Examples of what NOT to detect (set is_electronic_waste to FALSE):
            - People's faces or portraits without devices
            - Animals, pets, or wildlife
            - Food, drinks, or meals
            - Furniture, chairs, tables, or household items
            - Buildings, landscapes, or scenery
            - Clothing, shoes, or accessories (unless they contain electronic components)
            - Books, papers, or documents
            - Plants, flowers, or natural objects
            
            Be very strict - only classify as electronic waste if you can clearly see an actual electronic device!
            """
            
            # Generate content using Gemini with retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    print(f"🔄 Gemini API attempt {attempt + 1}/{max_retries}")
                    response = self.model.generate_content(
                        [prompt, image],
                        safety_settings=self.safety_settings
                    )
                    
                    if response and response.text:
                        print(f"✅ Gemini API response received: {len(response.text)} characters")
                        print(f"📝 Response preview: {response.text[:200]}...")
                        
                        # Parse the response
                        result = self._parse_gemini_response(response.text)
                        
                        # Validate the result
                        validated_result = self._validate_result(result)
                        
                        print(f"🎯 Gemini API result: {validated_result.get('device_type', 'unknown')} with {validated_result.get('confidence', 0):.2f} confidence")
                        return validated_result
                    else:
                        print(f"⚠️  Empty response from Gemini API (attempt {attempt + 1})")
                        if attempt == max_retries - 1:
                            raise Exception("Empty response from Gemini API")
                        
                except Exception as e:
                    print(f"⚠️  Gemini API attempt {attempt + 1} failed: {str(e)}")
                    if attempt == max_retries - 1:
                        raise e
                    else:
                        import time
                        time.sleep(1)  # Wait before retry
            
            # This should not be reached, but just in case
            raise Exception("All Gemini API attempts failed")
            
        except Exception as e:
            print(f"❌ Gemini API error: {str(e)}")
            print(f"🔍 Error type: {type(e).__name__}")
            # Return a result that will trigger fallback detection
            return {
                "is_electronic_waste": False,
                "device_count": 0,
                "detected_devices": [],
                "device_type": "other",
                "confidence": 0.0,
                "message": f"API error: {str(e)}",
                "error": True
            }
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse Gemini API response and extract JSON"""
        try:
            import json
            import re
            
            print(f"🔍 Parsing Gemini response: {response_text[:300]}...")
            
            # Try multiple JSON extraction methods
            json_patterns = [
                r'\{[^{}]*"is_electronic_waste"[^{}]*\}',  # Look for JSON with is_electronic_waste
                r'\{.*?"device_type".*?\}',  # Look for JSON with device_type
                r'\{.*?\}',  # General JSON pattern
            ]
            
            for pattern in json_patterns:
                json_match = re.search(pattern, response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group()
                    print(f"📋 Found JSON: {json_str}")
                    try:
                        result = json.loads(json_str)
                        print(f"✅ Successfully parsed JSON: {result}")
                        return result
                    except json.JSONDecodeError as e:
                        print(f"⚠️  JSON decode error: {e}")
                        continue
            
            # If no JSON found, try fallback parsing
            print("⚠️  No valid JSON found, using fallback parsing")
            return self._fallback_parse(response_text)
                
        except Exception as e:
            print(f"❌ Error parsing Gemini response: {e}")
            return self._fallback_parse(response_text)
    
    def _fallback_parse(self, response_text: str) -> Dict:
        """Fallback parsing if JSON extraction fails"""
        response_lower = response_text.lower()
        
        # Check for electronic waste indicators and determine device type and model
        device_type = "other"
        device_model = "Unknown Device"
        
        # Check for laptop indicators first (higher priority)
        laptop_keywords = ['laptop', 'computer', 'notebook', 'macbook', 'pc', 'keyboard', 'trackpad', 'screen', 'display', 'aluminum', 'metal case']
        is_laptop = any(keyword in response_lower for keyword in laptop_keywords)
        
        # Check for smartphone indicators
        phone_keywords = ['phone', 'smartphone', 'mobile', 'iphone', 'android', 'cell', 'handset']
        is_phone = any(keyword in response_lower for keyword in phone_keywords)
        
        # Check for iPhone-specific indicators
        iphone_keywords = ['iphone', 'apple', 'ios', 'home button', 'notch', 'face id', 'touch id']
        is_iphone = any(keyword in response_lower for keyword in iphone_keywords)
        
        # Prioritize laptop detection over phone detection
        if is_laptop:
            device_type = "laptop"
            if 'macbook' in response_lower:
                device_model = "MacBook"
            elif 'dell' in response_lower:
                device_model = "Dell Laptop"
            elif 'hp' in response_lower:
                device_model = "HP Laptop"
            elif 'lenovo' in response_lower:
                device_model = "Lenovo Laptop"
            else:
                device_model = "Laptop"
        elif is_phone or is_iphone:
            device_type = "smartphone"
            
            # Try to detect specific iPhone models based on common characteristics
            if is_iphone or 'iphone' in response_lower:
                # Look for model-specific indicators
                if any(indicator in response_lower for indicator in ['13', 'thirteen', 'pro max', 'pro']):
                    device_model = "iPhone 13"
                elif any(indicator in response_lower for indicator in ['12', 'twelve']):
                    device_model = "iPhone 12"
                elif any(indicator in response_lower for indicator in ['14', 'fourteen']):
                    device_model = "iPhone 14"
                elif any(indicator in response_lower for indicator in ['15', 'fifteen']):
                    device_model = "iPhone 15"
                elif any(indicator in response_lower for indicator in ['11', 'eleven']):
                    device_model = "iPhone 11"
                elif any(indicator in response_lower for indicator in ['x', 'ten']):
                    device_model = "iPhone X"
                else:
                    device_model = "iPhone"
            elif 'android' in response_lower or 'samsung' in response_lower or 'galaxy' in response_lower:
                device_model = "Android Phone"
            else:
                device_model = "Smartphone"
        elif any(keyword in response_lower for keyword in ['battery', 'power bank', 'powerbank']):
            device_type = "battery"
            device_model = "Battery"
        elif any(keyword in response_lower for keyword in ['tablet', 'ipad', 'e-reader', 'touchscreen']):
            device_type = "tablet"
            if 'ipad' in response_lower:
                device_model = "iPad"
            else:
                device_model = "Tablet"
        
        # More comprehensive electronic keywords
        electronic_keywords = [
            'phone', 'smartphone', 'mobile', 'iphone', 'android', 'cell',
            'laptop', 'computer', 'notebook', 'macbook', 'pc',
            'tablet', 'ipad', 'e-reader', 'touchscreen',
            'battery', 'charger', 'power bank', 'powerbank',
            'electronic', 'device', 'gadget', 'tech',
            'headphone', 'earbud', 'speaker', 'camera',
            'watch', 'smartwatch', 'gaming', 'console'
        ]
        has_electronic = any(keyword in response_lower for keyword in electronic_keywords)
        
        # Try to extract numbers for device count
        import re
        numbers = re.findall(r'\d+', response_text)
        device_count = int(numbers[0]) if numbers else (1 if has_electronic else 0)
        
        return {
            "is_electronic_waste": has_electronic,
            "device_count": device_count,
            "detected_devices": ["electronic device"] if has_electronic else [],
            "device_type": device_type,
            "device_model": device_model,
            "confidence": 0.7 if has_electronic else 0.3,
            "message": response_text[:200] + "..." if len(response_text) > 200 else response_text
        }
    
    def _validate_result(self, result: Dict) -> Dict:
        """Validate and clean up the result"""
        # Ensure required fields exist
        validated = {
            "is_electronic_waste": bool(result.get("is_electronic_waste", False)),
            "device_count": int(result.get("device_count", 0)),
            "detected_devices": result.get("detected_devices", []),
            "device_type": result.get("device_type", "other"),
            "device_model": result.get("device_model", "Unknown Device"),
            "confidence": float(result.get("confidence", 0.0)),
            "message": str(result.get("message", "")),
            "error": False
        }
        
        # Generate user-friendly messages
        if validated["device_count"] == 0:
            validated["user_message"] = "Please upload an image of an electronic device for e-waste pickup."
        elif validated["device_count"] == 1:
            device_type_name = validated["device_type"].replace("_", " ").title()
            device_model = validated["device_model"]
            validated["user_message"] = f"Great! I can see 1 {device_model} ({device_type_name}). This is valid for e-waste pickup."
        else:
            validated["user_message"] = f"I can see {validated['device_count']} electronic devices. Please upload one device at a time for better processing."
        
        return validated
    
    def classify_image(self, image_data: bytes) -> Dict:
        """
        Main method to classify an uploaded image
        Returns validation result for the e-waste booking system
        """
        try:
            # Preprocess the image
            image = self.preprocess_image(image_data)
            
            # Analyze with Gemini
            result = self.analyze_image(image)
            
            return result
            
        except Exception as e:
            return {
                "is_electronic_waste": False,
                "device_count": 0,
                "detected_devices": [],
                "device_type": "other",
                "confidence": 0.0,
                "message": f"Error processing image: {str(e)}",
                "user_message": "Please upload a valid image of an electronic device.",
                "error": True
            }

# Example usage and testing
if __name__ == "__main__":
    # Test the classifier
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Please set GEMINI_API_KEY environment variable")
        exit(1)
    
    classifier = EwasteImageClassifier(api_key)
    print("E-waste Image Classifier initialized successfully!")

