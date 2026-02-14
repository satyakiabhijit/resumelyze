"""
Script to list available Gemini models for your API key.
Run this to discover which model names work.
"""
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ No GOOGLE_API_KEY found in .env")
    exit(1)

print(f"✅ API Key found: {api_key[:10]}...")

try:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    print("✅ Gemini client configured\n")
    
    print("📋 Listing available models...\n")
    
    # Try different listing methods
    models = []
    try:
        models = list(genai.list_models())
    except Exception as e:
        print(f"⚠️  list_models() failed: {e}")
        try:
            # Try alternative
            import google.ai.generativelanguage as glm
            from google.api_core import client_options as client_options_lib
            client = glm.ModelServiceClient(
                client_options=client_options_lib.ClientOptions(api_key=api_key)
            )
            models_response = client.list_models()
            models = list(models_response)
        except Exception as e2:
            print(f"⚠️  Alternative listing failed: {e2}")
    
    if models:
        print(f"Found {len(models)} models:\n")
        generate_content_models = []
        
        for model in models:
            model_name = model.name if hasattr(model, 'name') else str(model)
            supported = []
            
            if hasattr(model, 'supported_generation_methods'):
                supported = model.supported_generation_methods
            
            supports_generate = 'generateContent' in supported if supported else '?'
            
            print(f"  • {model_name}")
            if supported:
                print(f"    Methods: {', '.join(supported)}")
            
            if 'generateContent' in str(supported):
                generate_content_models.append(model_name)
        
        if generate_content_models:
            print(f"\n✅ Models that support generateContent:")
            for m in generate_content_models:
                print(f"  • {m}")
            
            print("\n📝 Recommended GEMINI_MODEL_CANDIDATES for config.py:")
            print("GEMINI_MODEL_CANDIDATES = [")
            for m in generate_content_models[:5]:  # Top 5
                print(f'    "{m}",')
            print("]")
    else:
        print("❌ No models found or listing not supported")
        print("\n💡 Trying common model names directly...")
        
        # Try common names
        common_names = [
            "gemini-1.5-flash",
            "gemini-1.5-pro", 
            "gemini-pro",
            "models/gemini-1.5-flash",
            "models/gemini-1.5-pro",
            "models/gemini-pro",
        ]
        
        working = []
        for name in common_names:
            try:
                model = genai.GenerativeModel(name)
                response = model.generate_content("Hello")
                if response:
                    working.append(name)
                    print(f"  ✅ {name} - WORKS")
            except Exception as e:
                print(f"  ❌ {name} - {str(e)[:80]}")
        
        if working:
            print(f"\n✅ Working models found:")
            print("GEMINI_MODEL_CANDIDATES = [")
            for m in working:
                print(f'    "{m}",')
            print("]")
        
except ImportError:
    print("❌ google-generativeai package not installed")
    print("Run: pip install google-generativeai")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
