import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channel_list = {}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("create channel")
def create_channel(data):
    channelname = data["channel_name"]
    if channelname in channel_list:
        emit("resp", {"reason": "channel already exists"})
    else:
        channel_list[channelname] = data
        emit("resp", {"reason": f"channel {channelname} added"})

