from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Python Roguelike Server Running"})

@app.route('/api/game/status', methods=['GET'])
def game_status():
    return jsonify({
        "game": "Roguelike Dungeon",
        "version": "1.0.0",
        "language": "Python"
    })

if __name__ == '__main__':
    print("Starting Python Roguelike Server on http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
