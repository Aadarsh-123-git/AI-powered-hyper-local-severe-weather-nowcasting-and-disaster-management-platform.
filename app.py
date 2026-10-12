from flask import Flask, render_template, request, jsonify
import random
import string

app = Flask(__name__)

game = {
    "number": random.randint(1, 200),
    "attempts": 0
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/start", methods=["POST"])
def start():
    game["number"] = random.randint(1, 200)
    game["attempts"] = 0
    return jsonify({"message": "Game Started! Guess between 1 and 200"})

@app.route("/guess", methods=["POST"])
def guess():
    data = request.json
    user_guess = int(data["guess"])
    game["attempts"] += 1

    if user_guess == game["number"]:
        return jsonify({"message": f"🎉 Correct! You won in {game['attempts']} attempts!"})
    elif user_guess < game["number"]:
        return jsonify({"message": "Too Low 📉"})
    else:
        return jsonify({"message": "Too High 📈"})

if __name__ == "__main__":
    app.run(debug=True)
