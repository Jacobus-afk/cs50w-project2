let handle = localStorage.getItem('user_handle');

document.addEventListener("DOMContentLoaded", () => {
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    /*socket.on('connect', () => {
        console.log("socket connected")
    });*/

    const new_user_div = document.getElementById("new-user");
    const old_user_div = document.getElementById("old-user");
    const chan_create_form = document.getElementById("create-channel");
    const create_msg = document.getElementById("create-msg");
    const select_chan = document.getElementById("select-channel");
    const forms = document.forms;
    
    for (i = 0; i < forms.length; i++)
    {
        const name = forms[i].querySelector('input[type="text"]');
        const button = forms[i].querySelector('input[type="submit"]');
        name.onkeyup = () => {
            if (name.value.length > 0) {
                button.disabled = false;
            }
            else {
                button.disabled = true;
            }
        }
    }

    if (!handle) {
        new_user_div.style.display = "block";
  
        const new_form = new_user_div.querySelector("form");
        const name = new_form.querySelector('input[name="handle"]');

        new_form.onsubmit = () => {
            //TODO: have to verify that handle is not taken
            handle = name.value;
            localStorage.setItem('user_handle', handle);
            new_user_div.style.display = "none";
            user_confirmed();
            return false;
        }
    }
    else {
        user_confirmed();
    }

    function add_channel_selection(name)
    {
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerHTML = name
        select_chan.append(opt);
    }
    
    function user_confirmed()
    {
        old_user_div.style.display = "block";
        document.getElementById("welcome-text").innerHTML += handle + "!";
    }

    chan_create_form.onsubmit = () => {
        const chan_name = document.getElementById("channel-name").value;
        //console.log(chan_name)
        socket.emit("create channel", {"channel_name": chan_name}, (resp, reason) => {
            if (resp != "ack") {
                create_msg.style.color = "red";
            }
            else {
                create_msg.style.color = "green";
            }
            create_msg.innerHTML = reason.reason;
            //console.log(resp);
            //console.log(reason);
        });
    
        //socket.on('resp', data => {
        //    console.log(data.reason);
        //});

        return false;
    }

    socket.on("add_channel", data => {
        //console.log("add_channel socket call");
        add_channel_selection(data.channelname);
    })

})

