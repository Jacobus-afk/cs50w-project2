import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send, join_room, leave_room

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
    ch_dict = {
        "name": channelname,
        "users": {},
        "messages": {}
        }

    if channelname in channel_list:
        return "nack", {"reason": f"channel {channelname} already exists"}
    else:
        channel_list[channelname] = data
        emit("add_channel", {"channelname": channelname}, broadcast=True)
        return "ack", {"reason": f"channel {channelname} added"}

@socketio.on("join")
def handle_join_req(data):
    username = data["username"]
    channel = data["channel"]
    if channel in channel_list:
        join_room(channel)
        emit("server message", username + " joined channel", room = channel, include_self=False)
        return "ack", {"reason": f"sucessfully joined {channel}"}
    return "nack", {"reason": f"{channel} doesn't exist"}

@socketio.on("leave")
def handle_leave_req(data):
    username = data["username"]
    channel = data["channel"]
    if channel in channel_list:
        leave_room(channel)
        emit("server message", username + " left channel", room = channel)
        return "ack", {"reason": f"sucessfully left {channel}"}
    return "nack", {"reason": f"{channel} doesn't exist"}


@socketio.on("send message")
def send_message(data):
    channel = data["channel"]
    message = data["message"]

    emit("recv message", message, room = channel)
