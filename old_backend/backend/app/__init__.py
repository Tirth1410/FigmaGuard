from flask import Flask
from flask_cors import CORS
from .api.routes import api_blueprint

def create_app():
    app = Flask(__name__)
    # Enable CORS for frontend communication
    CORS(app)
    app.register_blueprint(api_blueprint, url_prefix="/api")
    return app