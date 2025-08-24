#!/bin/bash

# Install Playwright browsers if not already installed
echo "Installing Playwright browsers..."
playwright install

# Start the Flask application
echo "Starting FigmaGuard backend server..."
exec python server.py
