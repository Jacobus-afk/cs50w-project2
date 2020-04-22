import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channel_list = {}
#https://stackoverflow.com/questions/53892422/python-ordered-list-of-dictionaries-with-a-size-limit

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("connect")
def handle_new_connection():
    for key in channel_list:
        #print(f"adding {key}")
        emit("add_channel", {"channelname": key})

@socketio.on("create channel")
def create_channel(data):
    channelname = data["channel_name"]
    if channelname in channel_list:
        return "nack", {"reason": f"channel {channelname} already exists"}
    else:
        channel_list[channelname] = data
        emit("add_channel", {"channelname": channelname}, broadcast=True)
        return "ack", {"reason": f"channel {channelname} added"}

