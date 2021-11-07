var paintMsg;
var toggleHighlight = false;

document.getElementById('toggle').addEventListener('click', function() {
  toggleHighlight = !toggleHighlight;
  if (toggleHighlight) {
    $('.text').addClass('selectable');
  } else {
    $('.text').removeClass('selectable');
  }
});

//Toggle between msg paint background and message threading
$(document).on('click touch', '.selectable', function() {
  var Threading = document.getElementById("Threading"); 
  var paintbg = document.getElementById("paintbg");
  var canvas = document.getElementById("canvas");

  paintMsg = $(this).attr('id');

  document.getElementById('toggle').style.display = 'none';
  if ( Threading.style.display !== 'none' ) {
    Threading.style.display = 'none';
	  paintbg.style.display = '';
	  createCanvas();
	  if (canvas) {
		  canvas.style.display = '';
	  }
  } else {
    Threading.style.display = '';
	  paintbg.style.display = 'none';
	  if (canvas) {
		  canvas.style.display = 'none';
	  }
  }
});

//Setting variables
var isMouseDown=false;
var canvas = document.createElement('canvas');
var body = document.getElementsByTagName("body")[0];
var ctx = canvas.getContext('2d');
currentSize = 5;
var currentColor = "#0000FF";
var secondColor = "#FF0000";
var currentBg = "white";
var currentPattern = 0; //0,1,2,3
var canvasWidth = 350
var canvasHeight = 60
var showDrawPrompt = true;

//Button Handlers
document.getElementById('colorpicker').addEventListener('change', function() {
	currentColor = this.value;
});
document.getElementById('secondcolorpicker').addEventListener('change', function() {
	secondColor = this.value;
});
document.getElementById('bgcolorpicker').addEventListener('change', function() {
	ctx.fillStyle = this.value;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	currentBg = ctx.fillStyle;
});
document.getElementById('saveToImage').addEventListener('click', function() {
  downloadCanvas(this, 'canvas', 'masterpiece.png');
  if ( Threading.style.display == 'none' ) {
    Threading.style.display = '';
    document.getElementById('toggle').style.display = '';
    $('.text').removeClass('selectable');
    toggleHighlight = false;
	  paintbg.style.display = 'none';
	  if (canvas) {
		  canvas.style.display = 'none';
	  }
  }
}, false);

document.getElementById('clear').addEventListener('click', createCanvas);

interact('.canvas')
  .draggable({
    max: Infinity,
    maxPerElement: Infinity,
    origin: 'self',
    listeners: {
      //begin drawing context
      start: function (event) {
		var ctx = event.target.getContext('2d');
		lastPoint = { x: event.clientX, y: event.clientY };
		ctx.moveTo(lastPoint.x, lastPoint.y)
		ctx.beginPath();
		ctx.lineWidth  = currentSize;
		ctx.lineCap = "round";
		ctx.strokeStyle = getPattern(lastPoint.x,lastPoint.y);
	  },
	  end: function (event) {
		  ctx.closePath();
	  },
      //remove Draw on Me text and draw based on pattern
      move: function (event) {
        var context = event.target.getContext('2d')
        if (showDrawPrompt) {
          showDrawPrompt = false;
          context.fillStyle = currentBg;
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        //calculate the angle of the drag direction
        var dragAngle = 180 * Math.atan2(event.dx, event.dy) / Math.PI;
		context.strokeStyle = getPattern(lastPoint.x,lastPoint.y);
		context.moveTo(lastPoint.x - 5, lastPoint.y - 5);
		context.lineTo(event.clientX-5, event.clientY-5);
		context.stroke();
		lastPoint = { x: event.clientX, y: event.clientY };
      }
    }
  })
  
  //Colorwheel to determine drawing pattern
  //https://bhch.github.io/posts/2019/03/adding-rotation-handles-in-interact-js/
  //code was used to find the angle of the rotation and rotate the wheel
  interact('.colorwheel')
  .draggable({
	  onstart: function (event) {
		const element = event.target;
		const rect = element.getBoundingClientRect();

		// store the center as the element has css `transform-origin: center center`
		element.dataset.centerX = rect.left + rect.width / 2;
		element.dataset.centerY = rect.top + rect.height / 2;
		// get the angle of the element when the drag starts
		element.dataset.angle = getDragAngle(event);
	  },
	  onmove: function (event) {
		var element = event.target;
		var center = {
		  x: parseFloat(element.dataset.centerX) || 0,
		  y: parseFloat(element.dataset.centerY) || 0,
		};
		var angle = getDragAngle(event);
		patternDetection(angle);
		// update transform style on dragmove
		element.style.transform = 'rotate(' + angle + 'rad' + ')';
		
	  },
	  onend: function (event) {
		const element = event.target;
		// save the angle on dragend
		var angle = getDragAngle(event);
		element.dataset.angle = angle;
	  },
  });

//Returns drawing pattern
//http://perfectionkills.com/exploring-canvas-drawing-techniques/
//This website was used to inspire different drawing patterns
//We copied the vertical line drawing pattern from this webpage
function getPattern(x,y) {
  var patternCanvas = document.createElement('canvas'),
  ctx = patternCanvas.getContext('2d');
  switch(currentPattern) {
  case 1: //linear gradient pattern applied to entire canvas
	patternCanvas.width = canvasWidth;
	patternCanvas.height = canvasHeight;
	var gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
	gradient.addColorStop(0, currentColor);
	gradient.addColorStop(1, secondColor);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    break;
  case 2: //gradient brush that changes stroke color as you move
	patternCanvas.width = canvasWidth;
	patternCanvas.height = canvasHeight;
	var gradient = ctx.createLinearGradient(x, y, currentSize, currentSize);
	gradient.addColorStop(0, currentColor);
	gradient.addColorStop(1, secondColor);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    break;
  case 3: //half the canvas one color, other half of the canvas the other color
	patternCanvas.width = canvasWidth;
	patternCanvas.height = canvasHeight;
	ctx.fillStyle = currentColor;
	ctx.fillRect(0, 0, canvasWidth/2, canvasHeight);
	ctx.fillStyle = secondColor;
	ctx.fillRect(canvasWidth/2, 0, canvasWidth, canvasHeight);
    break;
  default: //vertical lines dual color
	//this drawing pattern was copied from http://perfectionkills.com/exploring-canvas-drawing-techniques/
	//Double-color lines pattern
	patternCanvas.width = 10;
	patternCanvas.height = 20;
	ctx.fillStyle = currentColor;
	ctx.fillRect(0, 0, 5, 20);
	ctx.fillStyle = secondColor;
	ctx.fillRect(5, 0, 10, 20);
  }
  return ctx.createPattern(patternCanvas, 'repeat');
}

//angle input is in radians
function patternDetection(angle) {
	//convert to degrees
	angle = (angle*180)/(Math.PI);
	angle = angle % 360;
	console.log(angle);
	if (angle >= 0 && angle < 90) {
		//first quadrant
		currentPattern = 0;
	}
	else if (angle >= -270 && angle <= -180) {
		//second quadrant
		currentPattern = 1;
	}
	else if (angle >= -180 && angle <= -90) {
		//third quadrant
		currentPattern = 2;
	}
	else if (angle > -90 && angle < 0) {
		//fourth quadrant
		currentPattern = 3;
	}
	else {
		console.log("error");
		currentPattern = 0;
	}
}

//https://bhch.github.io/posts/2019/03/adding-rotation-handles-in-interact-js/
//This code was used to calculate the rotation angle of  object
function getDragAngle(event) {
  var element = event.target;
  var startAngle = parseFloat(element.dataset.angle) || 0;
  var center = {
    x: parseFloat(element.dataset.centerX) || 0,
    y: parseFloat(element.dataset.centerY) || 0,
  };
  var angle = Math.atan2(center.y - event.clientY,
                         center.x - event.clientX);
  return angle - startAngle;
}

//Creates the drawing canvas and adds it to the html
function createCanvas() {
	canvas.id = "canvas";
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	canvas.style.zIndex = 8;
	//canvas.style.position = "absolute";
	canvas.style.border = "1px solid";
	canvas.setAttribute('class','canvas');
	ctx.font = "25px Arial";
	ctx.fillStyle = "lightgray";
	ctx.fillText("Draw on me!", 100, 35);
	document.getElementById("paintbg").prepend(canvas);
	showDrawPrompt = true;
}

//Download jpeg of canvas
function downloadCanvas(link, canvas, filename) {
  dataUrl = document.getElementById(canvas).toDataURL('image/jpeg');
  document.getElementById(paintMsg).style.background = 'linear-gradient(rgba(255,255,255,.8), rgba(255,255,255,.8)), url('+dataUrl+')';
}

// Threading Section
var messages = [];
var anchor;
var hiddenTop = [];
var hiddenBot = [];
var dragTop = 0;
var dragBot = 0;

document.addEventListener("DOMContentLoaded", function() { 
  // this function runs when the DOM is ready, i.e. when the document has been parsed
  messages = document.getElementsByClassName('msg');
});

// target elements with the "msg" class
interact('.msg')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    // enable autoScroll
    autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,
    }
  })

  interact('.thread')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    // enable autoScroll
    autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move(event) {
        if (event.dy > 0 && event.dy % 1 == 0) {
          dragBot += event.dy;
          for (i = 0; i < hiddenBot.length; i++) {
            if (dragBot < 60 * i) {
              break;
            }
            var msg = document.getElementById(hiddenBot[i]);
            msg.childNodes[1].classList.remove("overlap");
            if (event.dy % 1 == 0)
            moveElements(msg, event.dy);
          }
        }
        if (event.dy < 0 && event.dy % 1 == 0) {
          dragTop -= event.dy;
          for (i = 0; i < hiddenTop.length; i++) {
            if (dragTop < 60 * i) {
              break;
            }
            var msg = document.getElementById(hiddenTop[i]);
            msg.childNodes[1].classList.remove("overlap");
            if (event.dy % 1 == 0)
            moveElements(msg, event.dy);
          }
        }
      }
    }
  });

//https://interactjs.io/
//We looked at the example Dragging function on the interactjs homepage
//which shows an example of how to drag an event.target
//the translation uses webkit Transform  
function moveElements(event, movement) {
  var target = 0;
  var x = 0;
  var y = 0;
  if (event.childNodes){
	  target = event;
  }
  else if (event.client){
	  target = event.target;
  }
  x = (parseFloat(target.getAttribute('data-x')) || 0) //+event.dx for horizontal drag
  y = (parseFloat(target.getAttribute('data-y')) || 0) + movement
	  
  // translate the element
  target.style.webkitTransform =
  target.style.transform = 'translate(0, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-y', y)
}

function noOverlap(event, overlapElements, movementx,movementy, movement){
	if (event.childNodes){
	  target = event;
	}
	else if (event.client){
	  target = event.target;
  }
	var dx = movementx;
	var dy = movementy;

  //just for flagging when the target would overlap another element
  var overlap = false;
  var targetDims = target.getBoundingClientRect();

  for(i = 0; i < overlapElements.length; i++){
    if (!anchor) {
      var overlapElementDims = overlapElements[i].getBoundingClientRect();
    } else {
      var overlapElementDims = anchor.getBoundingClientRect();
    }
    //make sure the element doesn't look at itself..
    if(overlapElements[i] != target){
      //checks if the target "doesn't" overlap
      if(((targetDims.top + 10 + dy) > (overlapElementDims.bottom)) 
      ||((targetDims.bottom + dy) < (overlapElementDims.top + 10))){

      //Basically, the target element doesn't overlap the current 
      //element in the HTMLCollection, do nothing and go to the 
      //next iterate
      }
      else{
        //This is if the target element would overlap the current element
        //set overlap to true and break out of the for loop to conserve time.
        overlap = true;
        break;
      }
    }
  };
  if(overlap == false){
    moveElements(target, movement);
  }
  else{
    //overlap code goes here
    if (!anchor) {
      // set anchor of thread
      anchor = target;
      target.childNodes[1].classList.add("thread");
    }
    if (target.id != anchor.id) {
      // add overlap class to msgs, push hidden msgs to front of array
      if (!hiddenTop.includes(target.id) && !hiddenBot.includes(target.id)) {
        y = (parseFloat(target.getAttribute('data-y')) || 0) - target.clientHeight;;
        target.style.transform = 'translate(0, ' + y + 'px)';
        target.childNodes[1].classList.add("overlap");
        if (anchor.id < target.id) {
          hiddenBot.unshift(target.id);
        } else {
          hiddenTop.unshift(target.id);
        }
      }
    }
  } 
}

function dragMoveListener (event) {
	noOverlap(event,messages,event.dx,event.dy,event.dy);
	//Move the other messages as well
	var msgsArr = Array.prototype.slice.call(messages);
	let removeid = event.target.id[3]-1;
	if (removeid < 0) {
		removeid = 0;
	}
	var removed = msgsArr.splice(0, removeid); //stores msgs up to selected message, not including it
 	if (event.dy < 0) {
		for (var i=0; i < removed.length;i++) {
			noOverlap(removed[i],messages,event.dx,event.dy,-event.dy);
		}
	}
	else {
		for (var i=1; i < msgsArr.length;i++) {
			noOverlap(msgsArr[i],messages,event.dx,event.dy,-event.dy);
		}
	}
}
