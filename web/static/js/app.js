import {Socket, LongPoller} from "phoenix"

class App {

  static init(){
    let socket = new Socket("/socket", {
      logger: ((kind, msg, data) => { /* console.log(`${kind}: ${msg}`, data)  */})
    })

    socket.connect({user_id: "123"})
    var $status    = $("#status")
    var $messages  = $("#messages")
    var $input     = $("#message-input")
    var $username  = $("#username")
    var $canvasDiv = $("#canvasWrapper")
    var $canvas = document.createElement('canvas')
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var username = this.sanitize($username.val() || "anonymous")
    var paint;

    $canvas.setAttribute('width', '500px')
    $canvas.setAttribute('height', '500px')
    $canvas.setAttribute('id', 'canvas')
    $canvas.setAttribute('style', 'border: 1px dotted black')
    $('#canvas').css('cursor','auto')
    $canvasDiv.append($canvas)
    if(typeof G_vmlCanvasManager != 'undefined') {
      $canvas = G_vmlCanvasManager.initElement(canvas)
    }
    var $context = $canvas.getContext("2d")
    var paint = false
    function pauseEvent(e){
        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }
    $('#canvas').mousedown(e => {
      paint = true;
      var pointToDraw = {
          username: username,
          x: e.pageX - $('#canvas')[0].offsetLeft,
          y: e.pageY - $('#canvas')[0].offsetTop - 50,
          w: 10, c: 'black'
      }
      console.log(pointToDraw)
      whiteboard.push("draw", pointToDraw)
      pauseEvent(e)
    })
    $('#canvas').mousemove(e => {
      if (paint){
          var pointToDraw = {
              username: username,
              x: e.pageX - $('#canvas')[0].offsetLeft,
              y:  e.pageY - $('#canvas')[0].offsetTop - 50,
              w: 10, c: 'black'
          }
          whiteboard.push("draw", pointToDraw)
      }
      pauseEvent(e)
    })
    $('#canvas').mouseup(e => paint = false)
    $('#canvas').mouseleave(e => paint = false)
    $("body").mousemove(e => {
      if (paint) return;
      whiteboard.push("pointer", {username: username, x: e.pageX, y: event.pageY })
    })

    socket.onOpen( ev => console.log("OPEN", ev) )
    socket.onError( ev => console.log("ERROR", ev) )
    socket.onClose( e => console.log("CLOSE", e))

    function newChannel(name) {
      var chan = socket.channel(name, {})
      chan.join().receive("ignore", () => console.log("auth error"))
                 .receive("ok", () => console.log("join ok"))
                 .after(10000, () => console.log("Connection interruption"))
      chan.onError(e => console.log("something went wrong", e))
      chan.onClose(e => console.log("channel closed", e))
      return chan
    }

    var chan = newChannel("rooms:lobby")
    var whiteboard = newChannel("whiteboards:public")

    $input.off("keypress").on("keypress", e => {
      if (e.keyCode == 13) {
        chan.push("new:msg", {user: $username.val(), body: $input.val()})
        $input.val("")
      }
    })

    whiteboard.on("pointer", msg => {
      username = this.sanitize(msg.user || "anonymous")
      var cssClass = `userpointer-${username}`
      var div = $(`body .${cssClass}`)
      if (div.length > 0) {
         div[0].style.top = `${msg.y}px`
         div[0].style.left = `${msg.x}px`
      } else {
         div = $(`<div class='${cssClass}' style='position:absolute;left:${msg.x}px;top:${msg.y}px;width:${msg.w || 10}px;height:${msg.w || 10}px;background-color:black' />`)
         $("body").append(div)
      }
    })

    $context.clearRect(0, 0, $context.canvas.width, $context.canvas.height); // Clears the canvas

    whiteboard.on("draw", msg => {
      username = this.sanitize(msg.user || "anonymous")
      $context.lineWidth = 5;
      $context.fillStyle =  msg.c || "#df4b26"
      $context.rect(msg.x, msg.y, msg.w, msg.w)
      $context.fill()
    })


    chan.on("new:msg", msg => {
      if (msg.body === "ping") return
      $messages.append(this.messageTemplate(msg))
      scrollTo(0, document.body.scrollHeight)
    })

    chan.on("user:entered", msg => {
      username = this.sanitize(msg.user || "anonymous")
      $messages.append(`<br/><i>[${username} entered]</i>`)
    })
  }

  static sanitize(html){ return $("<div/>").text(html).html() }

  static messageTemplate(msg){
    let username = this.sanitize(msg.user || "anonymous")
    let body     = this.sanitize(msg.body)

    return(`<p><a href='#'>[${username}]</a>&nbsp; ${body}</p>`)
  }

}

$( () => App.init() )

export default App
