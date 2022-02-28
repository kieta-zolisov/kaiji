//GEBI
function g(el) {
  return document.getElementById(el);
}

//LOGIN GEBI
var loginmodal = g("loginmodal");
var login_dispname = g("login_dispname");
var login_roomcode = g("login_roomcode");
var login_submit = g("login_submit");
var login_ntf = g("login_ntf");
var login_ntf_info = g("login_ntf_info")
var login_state = g("login_jss");

//CHAT GEBI
var chatui = g("chatui");
var chatarea = g("chatarea"); 
var chat_input = g("chat_input");
var info = g("info");

var sdname;
var srcode;
var ntfallow = false;

login_state.innerHTML = performance.now() + " attachment";
var socket = io(); //ignore syntax error

//Begin
socket.on("ack", function (data) {
  login_state.innerHTML = performance.now() + " attached";
  setTimeout(function () {
    login_state.innerHTML = "ready";
  }, 1000);

  //Login
  login_submit.onclick = function () {
    sdname = login_dispname.value;
    srcode = login_roomcode.value;
    socket.emit("userlogin", {
      dname: sdname,
      rcode: srcode,
    });
    chatui.style.visibility = "visible";
    loginmodal.style.visibility = "hidden";
    document.title = "KAIJI";
    info.innerHTML = "display name: " + sdname + "<br />room code: " + srcode;
    newStMessage("Welcome to Kaiji");
    login_state.innerHTML = performance.now() + " connecting";
  };
  
  //Notification infobox open and request
  login_ntf.onclick = function() {
    login_ntf_info.style.display = "block"
    Notification.requestPermission().then(function (result) {
      if (result == "granted") {
        ntfallow = true;
        login_ntf_info.innerHTML = "Notifications are now allowed. <a href='/ntf.html'>I'd like to change my choice</a>"
      } else {
        login_ntf_info.innerHTML = "Notifications are blocked. <a href='/ntf.html'>I'd like to change my choice</a>"
      }
    });
  }
    
  function newMessage(name, message) {
    var d = new Date().toLocaleTimeString("en-US", { hour12: false });
    var msgel = document.createElement("message");
    msgel.innerHTML = "<mhe>" + name + " * " + d + " > " + "</mhe>" + message;
    chatarea.prepend(msgel);
  }

  function newStMessage(message) {
    var d = new Date().toLocaleTimeString("en-US", { hour12: false });
    var msgel = document.createElement("message");
    msgel.innerHTML = "<smhe>System * " + d + " > " + "</smhe>" + message;
    chatarea.prepend(msgel);
  }

  //Newlogin rx
  socket.on("newlogin", function (data) {
    if (data.rcode == srcode) {
      newStMessage(data.dname + " has entered this chatroom");
    }
  });

  //UserLeave rx
  socket.on("userleave", function (data) {
    if (data.rcode == srcode) {
      newStMessage(data.dname + " has left this chatroom");
    }
  });

  //Message rx
  socket.on("message", function (data) {
    if (data.rcode == srcode) {
      newMessage(data.dname, data.message);
    }
  });

  //Ping tx
  function pingts(fmsg) {
    var chi = chat_input.value
    if (chat_input.value.indexOf("@") > -1) {
      var loc = chat_input.value.indexOf("@") + 1;
      var mloc = loc;
      var out = [];
      var disregard = false;
      while (chi[mloc] != ":") {
        out.push(chi[mloc]);
        mloc++;
        if (chi[mloc] == undefined) {
          disregard = true;
          break; //kab
        }
      }
      if (!disregard) {
      socket.emit("ping", {
        tname: sdname,
        fmsg: fmsg,
        rname: out.join(""),
        rcode: srcode,
      });
    }
    }
  }
  
  //Ping rx
  socket.on("ping", function (data){
    if (data.rname == sdname&&data.rcode == srcode) {
      newStMessage(data.tname + " has pinged you!");
      new Notification(data.tname + " has pinged you!", { body: data.fmsg, icon: "https://cdn.glitch.global/56d562d8-1227-46d5-a485-bbb51fafc2bf/ipodnano.jpg?v=1645809263609" });
    }
  })

  //Message tx
  document.addEventListener("keypress", function () {
    if (event.which == 13) {
      chat_input.focus();
      if (srcode && sdname && chat_input.value) {
        pingts(chat_input.value);
        socket.emit("message", {
          dname: sdname,
          message: chat_input.value,
          rcode: srcode,
        });
        chat_input.value = "";
      }
    }
  });
});
