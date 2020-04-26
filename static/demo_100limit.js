const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

socket.emit("join", {"username": user.name, "channel": "100 message limt"});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function msg_loop()
{
for(i = 0; i < 105; i++) {
await sleep(100);
 socket.emit("send message", {"channel": user.channel, "message": i, "user": user.name}, (data) => {
    console.log(data);
  });
};
}

msg_loop()