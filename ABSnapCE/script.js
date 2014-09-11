/*****************************************************************************
** ANGRYBIRDS AI AGENT FRAMEWORK
** Copyright (c) 2013, Sahan Abeyasinghe, XiaoYu (Gary) Ge, Stephen Gould,
** Jim Keys, Kar-Wai Lim, Jochen Renz
** All rights reserved.
**
** This software is distributed under terms of the BSD license. See the 
** LICENSE file in the root directory for details.
*****************************************************************************/

console.log('triggered by chrome angry birds');

chrome.runtime.sendMessage({command: "angrybirds actived"}, function(response) {
  console.log('connected with background');
});
//auto switch to sd mode
if(!isSDActive()){
	location.href="javascript:switchVersion(true); void 0";
	console.log("switched to sd mode");
}
else{
	console.log("stay in sd mode");
}

//test if sd mode is active
function isSDActive() {
	if(document.getElementById("sdActive") != null){
		console.log('sd mode is active');
		return true;
	}
	else{
		console.log('hd mode is active');
		return false;
	}
}
//listen to the command from background.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	var response;
  
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
	if(request.command == 'screenshot'){
		response = screenshot();
	}
	
	else if(request.command == 'click'){
		click(request.data);
		response = {data : 'clicked at ' + request.data.x + ',' + request.data.y};
	}
    sendResponse(response);
});


// define supported message handlers
var handlers = {
	'click': click,
	'drag': drag,
	'mousewheel': mousewheel,
	'screenshot': screenshot
};

// generate a mouse click event
function click(data) {
	var x = data['x'];
	var y = data['y'];
	
	var canvas = $('canvas');
	var offset = canvas.offset();
	x = offset.left + x;
	y = offset.top + y;
	
	var evt = document.createEvent('MouseEvent');
	evt.initMouseEvent('mousedown', true, true, window, 1, 0, 0, x, y, false, false, false, false, 0, null);
	canvas[0].dispatchEvent(evt);
	
	evt = document.createEvent('MouseEvent');
	evt.initMouseEvent('mouseup', true, true, window, 1, 0, 0, x, y, false, false, false, false, 0, null);
	canvas[0].dispatchEvent(evt);
}

// generate a mouse drag event
function drag(data) {
	var x = data['x'];
	var y = data['y'];
	var dx = data['dx'];
	var dy = data['dy'];
	
	var canvas = $('canvas');
	var offset = canvas.offset();
	x = offset.left + x;
	y = offset.top + y;
	dx = x + dx;
	dy = y + dy;
	
	var evt = document.createEvent('MouseEvent');
	evt.initMouseEvent('mousedown', true, true, window, 1, 0, 0, x, y, false, false, false, false, 0, null);
	canvas[0].dispatchEvent(evt);
	
	evt = document.createEvent('MouseEvent');
	evt.initMouseEvent('mousemove', true, true, window, 0, 0, 0, dx, dy, false, false, false, false, 0, null);
	canvas[0].dispatchEvent(evt);
	
	evt = document.createEvent('MouseEvent');
	evt.initMouseEvent('mouseup', true, true, window, 1, 0, 0, dx, dy, false, false, false, false, 0, null);
	canvas[0].dispatchEvent(evt);
}

// generate a mouse wheel event
function mousewheel(data) {
	var delta = data['delta'];
	
	var canvas = $('canvas');
	var evt = document.createEvent('WheelEvent');
	evt.initWebKitWheelEvent(0, delta, window, 0, 0, 0, 0, false, false, false, false);
	canvas[0].dispatchEvent(evt);
}

// capture a screenshot and send it to the client
function screenshot() {
	// get the original canvas
	var srcCanvas = $('#playn-root canvas');
	
	// create a new canvas
	var canvas = $('<canvas />').attr('height', srcCanvas.height() + 'px').attr('width', srcCanvas.width() + 'px')[0];
	var context = canvas.getContext('2d');
	
	// copy the original canvas into the new canvas
	srcCanvas = srcCanvas[0];
	context.drawImage(srcCanvas, 0, 0);
	
	// obtain a png of the canvas
	var imageString = canvas.toDataURL();
	var canvasWidth = srcCanvas.width;
	var canvasHeight = srcCanvas.height;
	return {'data': imageString, 'time': new Date().getTime(), 'canvasWidth': canvasWidth, 'canvasHeight': canvasHeight };
}



