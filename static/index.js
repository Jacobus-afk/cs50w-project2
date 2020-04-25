let user = JSON.parse(localStorage.getItem("user_data"));

document.addEventListener("DOMContentLoaded", () => {
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    /*socket.on('connect', () => {
        console.log("socket connected")
    });*/

    const chan_create_form = document.getElementById("create-channel");
    const msg_send_form = document.getElementById("messages-form");
    const select_chan = document.getElementById("select-channel");
    const connect_chan = document.getElementById("button-chan-connect");
    const disconnect_chan = document.getElementById("button-chan-disconnect");
    const forms = document.forms;
    
    for (i = 0; i < forms.length; i++)
    {

        const name = forms[i].querySelector('input[type="text"]');
        const button = forms[i].querySelector('input[type="submit"]');
        function set_button()
        {
            if (name.value.length > 0) {
                button.disabled = false;
            }
            else {
                button.disabled = true;
            }
        }
        name.onkeyup = set_button;
        name.onpaste = set_button;
    }

    if (!user) {
        user = {
            name: "",
            channel: ""
        };
        const new_user_div = document.getElementById("new-user");
        new_user_div.style.display = "block";
        
        const new_form = new_user_div.querySelector("form");
        const name = new_form.querySelector('input[name="handle"]');

        new_form.onsubmit = () => {
            //TODO: have to verify that handle is not taken

            update_localstorage("name", name.value);
            new_user_div.style.display = "none";
            user_confirmed();
            return false;
        }
    }
    else {
        user_confirmed();
        join_channel(user.channel);
    }

    function add_channel_selection(name)
    {
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name
        select_chan.append(opt);
        if (!user.channel) {
            connect_chan.disabled = false;
            disconnect_chan.disabled = true;
        }
        
    }
    
    function format_message(data)
    {
        const clone = document.createElement('div');
        clone.className = "message-line";
        if (data.user != "server") {
            const name = document.createElement('p');
            name.style.fontWeight = "bold";
            name.innerHTML = data.user + ": ";
            const msg = document.createElement('p');
            msg.innerHTML = data.message;
            const time = document.createElement('p');
            time.innerHTML = data.timestamp;
            time.style.fontStyle = "italic";
            time.style.marginLeft = "auto";
            
            clone.append(name, msg, time);
            return clone;
        }

        const msg = document.createElement('p');
        msg.style.fontStyle = "italic";
        msg.innerHTML = data.message;
        clone.append(msg);

        return clone
    }

    function restoreChatSession(messages)
    {
        const msg_box = document.getElementById("messages-box");
        
        for (i in messages) {
            //console.log(messages[i]);
            const msg = format_message(messages[i]);
            msg_box.append(msg);
        }
    }

    function update_localstorage(entry, value)
    {
        user[entry] = value;
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    function user_confirmed()
    {
        document.getElementById("old-user").style.display = "flex";
        document.getElementById("welcome-text").innerHTML += user.name + "!";
        document.getElementById("channel-messenger").style.display = "block";
    }

    function join_channel(channel)
    {
        if (!channel) {
            update_localstorage("channel", "");
            return;
        }

        const request = new XMLHttpRequest();

        const connect_msg = document.getElementById("connect-msg");
        socket.emit("join", {"username": user.name, "channel": channel}, (resp, reason) => {
            if (resp != "ack") {
                connect_msg.style.color = "red";
                disconnect_chan.disabled = true;
                connect_chan.disabled = false;
            }
            else {
                connect_msg.style.color = "green";
                disconnect_chan.disabled = false;
                connect_chan.disabled = true;
                update_localstorage("channel", channel);
                //console.log("got here");
                request.open("POST", "/get_chan_data");
                request.onload = () => {
                    const data = JSON.parse(request.responseText);
                    if (data.success) {
                        restoreChatSession(data.messages);
                    }
                    else {
                        console.log(data);
                    }
                }
                const fdata = new FormData();
                fdata.append("channel", user.channel);

                request.send(fdata);
            }
            connect_msg.innerHTML = reason.reason;
        })
    }

    function leave_channel()
    {
        const connect_msg = document.getElementById("connect-msg");
        const msg_box = document.getElementById("messages-box");
        while (msg_box.firstChild) {
            msg_box.removeChild(msg_box.lastChild);
        }

        socket.emit("leave", {"username": user.name, "channel": user.channel}, (resp, reason) => {
            if (resp != "ack") {
                connect_msg.style.color = "red";
            }
            else {
                connect_msg.style.color = "gray";
                disconnect_chan.disabled = true;
                connect_chan.disabled = false;
                update_localstorage("channel", "");

            }
            connect_msg.innerHTML = reason.reason;
        })
    }

    chan_create_form.onsubmit = () => {
        const create_msg = document.getElementById("create-msg");
        const chan_name = document.getElementById("channel-name").value;
        socket.emit("create channel", {"channel_name": chan_name}, (resp, reason) => {
            if (resp != "ack") {
                create_msg.style.color = "red";
            }
            else {
                create_msg.style.color = "green";
            }
            create_msg.innerHTML = reason.reason;
        });
        return false;
    }

    msg_send_form.onsubmit = () => {
        const msg = document.getElementById("user-msg").value;

        socket.emit("send message", {"channel": user.channel, "message": msg, "user": user.name})
        return false;
    }

    socket.on("add_channel", data => {
        add_channel_selection(data.channelname);
    })

    socket.on("server message", data => {
        const msg_box = document.getElementById("messages-box");
        const msg = format_message(data);
        /*const p = document.createElement('p');
        p.style.fontStyle = "italic";
        p.innerHTML = data;*/
        msg_box.append(msg);
    })


    socket.on("recv message", data => {
        const msg_box = document.getElementById("messages-box");
        const msg = format_message(data);
        msg_box.append(msg);
        //console.log(data)
    })

    connect_chan.onclick = () => {
        join_channel(select_chan.value);
    }
    
    disconnect_chan.onclick = () => {
        leave_channel();
    }
})

