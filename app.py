from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def attendance():
    return render_template("index.html")

if __name__ == "__main__":
    # For local testing only. Deploy behind HTTPS for camera/GPS access.
    app.run(host="127.0.0.1", port=5000, debug=True)
