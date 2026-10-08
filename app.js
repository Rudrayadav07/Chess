const express = require("express");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const { createServer } = require("http");
const path = require("path");

const app = express();

const server = createServer(app);
const io = socket(server);

const chess = new Chess();

let player = {};
let currentPlayer = "w";

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index",{ title: "custom chess game"});
});

// const port = process.env.PORT || 5000;

// server.on("error", (error) => {
//     if (error.code === "EADDRINUSE") {
//         console.error(`Port ${port} is already in use. Stop the process using it or set PORT to a different port.`);
//         process.exit(1);
//     }

//     throw error;
// });
io.on("connection",(socket1)=>{
   console.log("connected");
   if(!player.white){
    player.white = socket1.id
    socket1.emit("playerRole","w")
   }
   else if (!player.black){
    player.black = socket1.id
    socket1.emit("playerRole","b")
   }
   else{
    socket1.emit("spactatorRole")
   }
   socket1.on("disconnect",()=>{
    if(socket1.id ===player.white){
        delete player.white
    }
    else if(socket1.id ===player.black){
        delete player.black
    }
 socket1.on("move",(move)=>{
    try{
        if(chess.turn()==='w'&&socket1.id !== player.white)return
        else if (chess.turn()==='b'&& socket1.id !== player.black)return
        const result = chess.move(move)
        if(result){
            currentPlayer = chess.turn()
            io.emit("move",move)
            io.emit("boardState",chess.fen())
        }
        else{
            console.log("invalid move",move);
            socket1.emit("invalid move",move)
            
        }
    }
    catch(err){
        console.log(err);
        socket1.emit("error invalid move")
        
    }
 })
   })
    
})
server.listen(5000, () => {
    console.log(`Listening on port 5000`);
});