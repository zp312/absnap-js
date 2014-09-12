var canvas;
var context;
var img;
var canvasWidth;
var canvasHeight;
var bkg = chrome.extension.getBackgroundPage();
	
	
function liveGame(){
	img = new Image();
	var canvas;

	img.onload = function(){
		if(canvas == null){
			canvas = document.getElementById("gameImg");
			context = canvas.getContext('2d');
		}	
		context.clearRect (0, 0, 840, 480);
		
		context.drawImage(img,0,0); //with offset 0,0
		var colour = context.getImageData(0, 0, img.width, img.height).data;
		console.log('popup.js: colour array set ' + colour[0]);
		var vision = new bkg.Vision(colour, img.width, img.height);
		console.log('popup.js: vision initated');
		var woodObjs = vision.findWood();
		console.log('popup.js: found ' + woodObjs.length + ' wooden objects');
		var stoneObjs = vision.findStones();
		var iceObjs = vision.findIce();
		var sling = vision.findSlingshotMBR();
		var pigs = vision.findPigs();
		console.log('popup.js: found sling shot: ' + sling);
		drawMBRs(woodObjs, 'yellow');
		drawMBRs(stoneObjs, 'white');
		drawMBRs(iceObjs, 'blue');
		drawMBR(sling, 'brown');
		drawMBR(pigs, 'green');
	};
	var i = 0;

	//while(i < 10){
	
	chrome.tabs.sendMessage(bkg.abTabId, {command:"screenshot"}, function(response) {
		console.log('popup.js: response from content script ' + response.data);
		var imageStr = response.data;
		img.src = imageStr;
	});	
	//	i++;
	//}
}

function drawMBRs(objs,colour){
	while(objs.first != null){
		var node = objs.first;
		var mbr = node.data;
		context.beginPath();
		context.lineWidth="2";
		context.strokeStyle= colour;
		context.rect(mbr.x,mbr.y,mbr.width,mbr.height);
		context.stroke();
		objs.remove(node);
	}

}

function drawMBR(mbr,colour){
	if(mbr != null){
		context.beginPath();
		context.lineWidth="2";
		context.strokeStyle= colour;
		context.rect(mbr.x,mbr.y,mbr.width,mbr.height);
		context.stroke();
	}
}

window.onload = liveGame();
//document.addEventListener('DOMContentLoaded', liveGame());