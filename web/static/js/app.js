import {Socket} from "phoenix"

var socket = new Socket("/socket");
socket.connect();
var channel = socket.channel("rooms:lobby", {});
channel.join();

window.onload = function(){

  var canvas = this.__canvas = new fabric.Canvas('test_canvas');
  fabric.Object.prototype.transparentCorners = false;

  // var canvas = new fabric.Canvas('test_canvas');
  // fabric.Object.prototype.transparentCorners = false;
  var mouse_start_pos_socket = { x:0 , y:0 };
  var mouse_start_pos = { x:0 , y:0 };
  var mouse_end_pos = { x:0 , y:0 };
  var width = 120;
  var height = 80;
  var on_flag = 0;


    canvas.on('mouse:over', function(e) {
      on_flag = 1;
      e.target.setFill('red');
      // e.target.hasControls = true;
      // canvas.set('selectable', true);
      canvas.renderAll();
    });


    canvas.on('mouse:out', function(e) {
      on_flag = 0;
      e.target.setFill('green');
      // e.target.hasControls = false;
      // canvas.set('selectable', false);
      canvas.renderAll();
    });


  canvas.on('mouse:down', function(e) {
    if(on_flag == 0){
     mouse_start_pos_socket = canvas.getPointer(e.e);
     console.log(mouse_start_pos_socket)
     channel.push("move", {
     	x: mouse_start_pos_socket.x,
     	y: mouse_start_pos_socket.y
     });
   }
  });

  channel.on("move", function(dt) {
     console.log(dt)
  	mouse_start_pos.x = dt.x;
  	mouse_start_pos.y = dt.y;
	canvas.add(new fabric.Rect({
	 left: mouse_start_pos.x - width / 2,
	 top: mouse_start_pos.y - height /2,
	 width: width,
	 height: height,
	 fill: 'aqua',
	 stroke: 'blue',
	 strokeWidth: 0
	}));
	on_flag = 1;
  });
}