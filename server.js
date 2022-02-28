// Setup basic express server
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("Server has started and is listening on the port %d", port);
});
console.log("start init " + Date.now());
// Routing
app.use(express.static("public"));

io.on("connection", function (socket) {
  var urcode
  var udname
  //send ack signal to user that connected
  socket.emit("ack");
  console.log("ua - ACK");
  
  socket.on("userlogin", function (data) {
    console.log("ua - LOG");
    console.log(data.dname);
    console.log(data.rcode);
    socket.rcode = data.rcode;
    socket.dname = data.dname;
    console.log(urcode)
    socket.broadcast.emit("newlogin", {
      dname: data.dname,
      rcode: data.rcode
    })
  });
  
  socket.on("message", function (data) {
    console.log("ua - MSG")
    socket.broadcast.emit("message", {
      dname: data.dname,
      message: data.message,
      rcode: data.rcode
    })
    socket.emit("message", {
      dname: data.dname,
      message: data.message,
      rcode: data.rcode
    })
  })
  
  socket.on("ping", function (data){
    console.log("ua - PNG")
    socket.broadcast.emit("ping", {
      tname: data.tname,
      rname: data.rname,
      fmsg: data.fmsg,
      rcode: data.rcode
    })
  })
  
  socket.on("disconnect", function (data) {
    socket.broadcast.emit("userleave", {
      dname: socket.dname,
      rcode: socket.rcode
    })
  })
});
