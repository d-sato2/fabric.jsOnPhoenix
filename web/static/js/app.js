import {Socket} from "phoenix"

var socket = new Socket("/socket");
socket.connect();
var channel = socket.channel("rooms:lobby", {});
channel.join();


window.onload = function(){

    var createCanvas = function(count) {
      var canvasWidth = window.innerWidth/2 -30,
          $canvas = $('<canvas id="demoCanvas' + count + '" class="main-canvas" width="' + canvasWidth + '" height="600"></canvas>').appendTo('main'),
          canvas = new fabric.Canvas($canvas[0]),
          defaultOptions = {
            left: 100,
            top: 100,
            fill: '#f7e6ce',
            width: 200,
            height: 200,
            shadow: {
              color: 'rgba(0, 0, 0, 0.3)',
              blur: 1,
              offsetX: 1,
              offsetY: 1
            }
          },
          id_counter = 0;

      //デフォルト選択スタイル設定
      $.extend( fabric.Object.prototype, {
        borderColor: 'rgba(0, 100, 255, 0.3)',
        cornerColor: 'rgba(0, 100, 255, 0.3)',
        cornerSize: 8,
        transparentCorners: false,
        padding: 5,
      });

      function animate(e, dir, callback) {
        if (e.target) {
          fabric.util.animate({
            startValue: e.target.get('scaleX'),
            endValue: e.target.get('scaleX') + (dir ? 0.02 : -0.02),
            duration: 50,
            onChange: function(value) {
              e.target.scale(value);
              canvas.renderAll();
            },
            onComplete: function() {
              e.target.setCoords();
              if(callback) callback(e);
            }
          });
        }
      }

      var mouseDowned = { state: false, target: null },
          selectionCleared = { state: false, target: null };

      canvas.on('object:selected', function(e) {
        console.log('object:selected');
        console.log(e);
      });

      canvas.on('selection:cleared', function(e) {
        console.log('selection:cleared');
        selectionCleared = { state: true, target: e.target };
        console.log(e);
      });

      canvas.on('mouse:down', function(e) {
        console.log('mouse:down');
        mouseDowned = { state: true, target: e.target };
        console.log(e)
      });

      canvas.on('mouse:move', function(e) {
        mouseDowned = { state: false, target: null };
        selectionCleared = { state: false, target: null };
      });

      canvas.on('mouse:up', function(e) {
        console.log('mouse:up');
        if( mouseDowned.state ) {
          if( !mouseDowned.target ) {
            //直前に選択状態が解除された場合は作らない
            if( selectionCleared.state ) {
              selectionCleared = { state: false, target: null };
              return;
            }

            var mouse_start_pos = canvas.getPointer(e.e);
               channel.push("sticky:create", {
                left: mouse_start_pos.x - defaultOptions.width / 2,
                top: mouse_start_pos.y - defaultOptions.height / 2
               });

          } else {
            canvas.trigger('mouse:click', e);
          }
        }
        selectionCleared = { state: false, target: null };
        console.log(e)
      });

      canvas.on('mouse:click', function(e) {
        console.log('mouse:click');
        console.log(e);
        animate(e, 1, function(e){ animate(e, 0); });
      });

      canvas.on('object:modified', function(e) {
        console.log('object:modified');
        console.log(e);
        var objects = [];

        if(typeof e.target.id === 'number') {
          objects.push(e.target);
        } else {
          objects = e.target._objects;
        }

        objects.forEach( function(target) {
          console.log('each');
          // debugger
          channel.push("sticky:modified", {
            id: target.id,
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            scaleX: target.scaleX,
            scaleY: target.scaleY
          })
        });
      });

      channel.on("sticky:create", function(config){
        //矩形オブジェクトを作る
        var sticky = new fabric.Rect($.extend(defaultOptions, {
          id: id_counter,
          left: config.left,
          top: config.top
        }));
        id_counter++;

        // sticky.on('modified', function(e) {
        //   console.log('modified');
          // $(document).trigger('sticky:modified', {
          //   id: this.id,
          //   left: this.left,
          //   top: this.top,
          //   width: this.width,
          //   height: this.height,
          //   scaleX: this.scaleX,
          //   scaleY: this.scaleY
          // })
        // });
        // canvas 上に矩形を追加する
        canvas.add(sticky);
      });

      channel.on("sticky:modified", function(config){
        console.log('sticky:modified');
        var sticky = canvas.getObjects().find(function(o){ return o.id === config.id });
        console.log(canvas);
        console.log(sticky);
        console.log(config);
        sticky.setLeft(config.left);
        sticky.setTop(config.top);
        sticky.setWidth(config.width);
        sticky.setHeight(config.height);
        sticky.setScaleX(config.scaleX);
        sticky.setScaleY(config.scaleY);
        sticky.setCoords();
        canvas.renderAll();
      });
    }

    for(var i=0; i < 2; i++) {
      createCanvas(i);
    }
}