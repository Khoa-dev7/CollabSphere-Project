from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Cho phép Frontend gọi API

@app.route('/')
def home():
    return jsonify({"message": "Hello from CollabSphere Backend!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)