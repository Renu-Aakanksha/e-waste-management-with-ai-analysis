#!/bin/bash

# Setup script for E-Waste Project Environment Variables

echo "🚀 Setting up environment variables for E-Waste Project..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Keeping existing .env file."
        exit 1
    fi
fi

# Copy template to .env
echo "📋 Copying environment template..."
cp env.template .env

echo "✅ Created .env file from template"
echo ""
echo "📝 Next steps:"
echo "1. Get your Gemini API key from: https://aistudio.google.com/"
echo "2. Edit the .env file and replace 'your_gemini_api_key_here' with your actual API key"
echo "3. Save the file"
echo "4. Restart your backend server"
echo ""
echo "🔧 To edit the .env file, run:"
echo "   nano .env"
echo "   # or"
echo "   code .env"
echo ""
echo "🎉 Setup complete! Don't forget to add your API key."

