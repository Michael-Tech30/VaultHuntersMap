socket = new connecWebSocket();
 
canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");

FIELD_SIZE = canvas.width;
CELL_NUM = 19;
MAX_ROOM = 94;
MIN_ROOM = 50;
CELL_SIZE = FIELD_SIZE / CELL_NUM;

currentPos = [(CELL_NUM-1)/2,(CELL_NUM-1)/2]; 
turnIns = [[],[]]; 
currentSavePos = [0,0];
isRunning = 1;
currntbiome = "d";

 function sendMsg() {
     socket.send(JSON.stringify({"data":"give me more data","name": window.location.hash.substring(1)}));  
 }
function connecWebSocket(){
	if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use local IP if accessing the site locally
    socket = new WebSocket('ws://localIP');
	} else {
		// Use public IP if accessing the site externally
		socket = new WebSocket('ws://publicIP');
	}
	return socket;
}
function startWebSocket() {
    socket = connecWebSocket(); 
    socket.onopen = function() {
        //sets up client_id and websocket for the server side.
        data = {"client_id": window.location.hash.substring(1)};
        socket.send(JSON.stringify(data));
        console.log('WebSocket connection opened');
    };
    socket.onclose = function() {
        console.log('WebSocket connection closed');
        //hack incase we lose connection to the server
        setTimeout(function() {
          startWebSocket();
        }, 5000);
    };
    socket.addEventListener('message', function (event) {
        myObj = JSON.parse(event.data);
        drawUpdate(JSON.stringify(myObj.data));
    });
  }
function addTurnIns(){
    a=currentPos[0];
    b=currentPos[1];
    turnIns.push([a,b]);
} 
function resetCanvas(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.width);
    currentSavePos = [0,0];
    turnIns = [[],[]];
    currentPos = [(CELL_NUM-1)/2,(CELL_NUM-1)/2]; 
}
function drawToCanvas(x,y,color="blue"){
    ctx.fillStyle = color;
    ctx.fillRect((x*CELL_SIZE)+1, (y*CELL_SIZE)+1, (CELL_SIZE-2), (CELL_SIZE-2));
}
function endSocket(){
    socket.close();
}
function drawUpdate(event){
    //sets up starting coordinates to center the room 
    if(currentSavePos[0] == 0 && currentSavePos[1] ==0 && event.substring(0,1) == "["){
        currentSavePos = JSON.parse(event);
        console.log("got the starting save pos");
    //make sure the data we have is something we want. then updates the biome  
    }else if(event.substring(0,1) == "[") {
        currentNewPos = JSON.parse(event);
        if(currntbiome != currentNewPos[3]){
            currntbiome = currentNewPos[3];
            if(currentNewPos[3] == 'minecraft:the_void'){
                resetCanvas();
                console.log("i thought i reset");
            }            
        }else if(currentNewPos[0] != 1 && currentNewPos[1] != 2 && window.location.hash.substring(1) == currentNewPos[2]){
            if(currentNewPos[0] - currentSavePos[0] > MIN_ROOM && currentNewPos[0] - currentSavePos[0] < MAX_ROOM*2){
                drawToCanvas(currentPos[0],currentPos[1],"blue");
                currentPos[0] = currentPos[0] + 1;
                currentSavePos[0] = currentSavePos[0]+ MAX_ROOM;
                drawToCanvas(currentPos[0],currentPos[1],"green");
                console.log("i moved the map");
            }else if(currentSavePos[0] -currentNewPos[0]  > MIN_ROOM &&  currentSavePos[0]- currentNewPos[0] < MAX_ROOM*2){
                drawToCanvas(currentPos[0],currentPos[1],"blue");
                currentPos[0] = currentPos[0] - 1;
                currentSavePos[0] = currentSavePos[0]- MAX_ROOM;
                drawToCanvas(currentPos[0],currentPos[1],"green");
                console.log("i moved the map");
            }else if(currentNewPos[1] - currentSavePos[1] > MIN_ROOM && currentNewPos[1] - currentSavePos[1] < MAX_ROOM*2){
                drawToCanvas(currentPos[0],currentPos[1],"blue");
                currentPos[1] = currentPos[1] + 1;
                currentSavePos[1] = currentSavePos[1]+MAX_ROOM;
                drawToCanvas(currentPos[0],currentPos[1],"green");
                console.log("i moved the map");
            }else if(currentSavePos[1] -currentNewPos[1]  > MIN_ROOM &&  currentSavePos[1]- currentNewPos[1] < MAX_ROOM*2){
                drawToCanvas(currentPos[0],currentPos[1],"blue");
                currentPos[1] = currentPos[1] - 1;
                currentSavePos[1] = currentSavePos[1]- MAX_ROOM;
                drawToCanvas(currentPos[0],currentPos[1],"green");
                console.log("i moved the map");
            }
            for( i = 0; i < turnIns.length; i++){
                drawToCanvas(turnIns[i][0],turnIns[i][1],"purple");
            }
            document.getElementById("title").innerHTML = Math.trunc(currentNewPos[0])+ ", "+ Math.trunc(currentNewPos[1])+", "+ currentNewPos[3] ;
        }
       
    }
    
    drawToCanvas((CELL_NUM-1)/2,(CELL_NUM-1)/2,"yellow");
}
function canvasClickHandler(event) {
    canvas = document.getElementById('myCanvas');
    rect = canvas.getBoundingClientRect();
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
    //sets the player currnt xy as a turn in location but could also change it to where the player clicked to be the turn in location
    addTurnIns();
}
canvas.addEventListener('click', canvasClickHandler);
resetCanvas();
GameLoop = window.setInterval(function(){
    if(isRunning == 1 ){
        startWebSocket();
        isRunning ++;
    }else if(socket.readyState == 1){
        sendMsg();
    }else if (socket.readyState == 3){
        socket.close();
        console.log("websocket closed but have started back up again");
    }
    
}, 500);


