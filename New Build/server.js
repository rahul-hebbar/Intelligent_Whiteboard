const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname,'public')));
app.get('/', function(req, res) {
   res.sendFile(path.join(__dirname,'./public/canvas.html'));
});

var state = [];
var no_user = 0
io.on('connection', socket => {
   no_user++;
   socket.emit('newuser', state);
   io.emit('userct',no_user);

   socket.on('sendupdate',(data) => {
      // console.log(data);
      state.push(data);
      socket.broadcast.emit('getupdate',data);
   });

   socket.on('disconnect',(reason) =>{
      no_user--;
      if (no_user === 0){
         state = [];
      }
      else{
         io.emit('userct',no_user);
      }
   })
});

server.listen(3000,() => {
   console.log('listening to port 3000');
});
