import os
import collections
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channel_list = {}
user_list = []
user_list.append("server")

#https://stackoverflow.com/questions/53892422/python-ordered-list-of-dictionaries-with-a-size-limit

class Message():
    def __init__(self, payload, user):
        self.timestamp = datetime.now().strftime("%d %b %y %H:%M:%S")
        self.message = payload
        self.user = user


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_chan_data", methods=["POST"])
def chan_data():
    chan = request.form.get("channel")
    try:
        messages = channel_list[chan]["messages"]
        return jsonify({"success": True, "messages": list(messages)})
    except:
        return {"success": False}

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
        "messages": collections.deque(maxlen=100)
        }

    if channelname in channel_list:
        return "nack", {"reason": f"channel {channelname} already exists"}
    else:
        channel_list[channelname] = ch_dict #data
        emit("add_channel", {"channelname": channelname}, broadcast=True)
        return "ack", {"reason": f"channel {channelname} added"}

@socketio.on("join")
def handle_join_req(data):
    username = data["username"]
    channel = data["channel"]
    message = username + " joined the channel"

    msg = vars(Message(message, "server"))
    
    if channel in channel_list:
        join_room(channel)
        channel_list[channel]["messages"].append(msg)
        emit("server message", msg, room = channel, include_self=False)
        return "ack", {"reason": f"sucessfully joined {channel}"}
    return "nack", {"reason": f"{channel} doesn't exist"}

@socketio.on("leave")
def handle_leave_req(data):
    username = data["username"]
    channel = data["channel"]
    message = username + " left the channel"

    msg = vars(Message(message, "server"))
    
    if channel in channel_list:
        channel_list[channel]["messages"].append(msg)
        leave_room(channel)
        emit("server message", msg, room = channel)
        return "ack", {"reason": f"sucessfully left {channel}"}
    return "nack", {"reason": f"{channel} doesn't exist"}


@socketio.on("send message")
def send_message(data):
    channel = data["channel"]
    if channel in channel_list:
        message = data["message"]
        user = data["user"]
        msg = vars(Message(message, user))
        channel_list[channel]["messages"].append(msg)
        emit("recv message", msg, room = channel)
