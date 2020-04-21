let handle = localStorage.getItem('user_handle');

document.addEventListener("DOMContentLoaded", () => {
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        console.log("socket connected")
    });

    const new_user_div = document.getElementById("new-user");
    const old_user_div = document.getElementById("old-user");

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

    function user_confirmed()
    {
        const chan_create_form = document.getElementById("create-channel");
        
        old_user_div.style.display = "block";
        
        document.getElementById("welcome-text").innerHTML += handle + "!";

        chan_create_form.onsubmit = () => {
            const chan_name = document.getElementById("channel-name").value;
            //console.log(chan_name)
            socket.emit("create channel", {"channel_name": chan_name});
        
            socket.on('resp', data => {
                console.log(data.reason);
            });

            return false;
        }

        
    }
})

