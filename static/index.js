let handle = localStorage.getItem('user_handle');


document.addEventListener("DOMContentLoaded", () => {
    const new_user_div = document.getElementById("new-user");
    const old_user_div = document.getElementById("old-user");

    if (!handle) {
        new_user_div.style.display = "block";
  
        const new_form = document.querySelector("#new-user-form");
        const name = new_form.querySelector('input[name="handle"]');
        const button = new_form.querySelector('input[type="submit"]');
        
        name.onkeyup = () => {
            if (name.value.length > 0) {
                button.disabled = false;
            }
            else {
                button.disabled = true;
            }
        }
        new_form.onsubmit = () => {
            //TODO: have to verify that handle is not taken
            handle = name.value;
            localStorage.setItem('user_handle', handle);
            new_user_div.style.display = "none";
            user_confirmed(old_user_div);
            return false;
        }
    }
    else {
        user_confirmed(old_user_div);
    }
    
})

function user_confirmed(old_user_div)
{
    old_user_div.style.display = "block";
    old_user_div.querySelector("h2").innerHTML += handle + "!";
}