//Enum states in Angrybirds
var ABState = Object.freeze({MainMenu: "main menu", EpisodeMenu: "episode menu", 
							LevelSelection: "level selection", Loading: "loading", 
							Playing: "playing", Won: "won", Lost: "lost", Unknown: "unknown"});

var templateImages;

//preload template images
function preloadTemplates(){
	templateImages = {
		mainmenu: new Image(),
		episodemenu: new Image(),
		levelselection: new Image(),
		loading: new Image(),
		loading2: new Image(),
		gamewon1: new Image(),
		gamewon2: new Image(),
		gamelost: new Image()
		/*
		endGame0: new Image(),
		endGame1: new Image(),
		endGame2: new Image(),
		endGame3: new Image(),
		endGame4: new Image(),
		endGame5: new Image(),
		endGame6: new Image(),
		endGame7: new Image(),
		endGame8: new Image(),
		endGame9: new Image()*/
	}
	
		templateImages.mainmenu.src = "images/templates/mainmenu.png";
		templateImages.episodemenu.src = "images/templates/episodemenu.png";
		templateImages.levelselection.src = "images/templates/levelselection.png";
		templateImages.loading.src = "images/templates/loading.png";
		templateImages.loading2.src = "images/templates/loading2.png";
		templateImages.gamewon1.src = "images/templates/gamewon1.png";
		templateImages.gamewon2.src = "images/templates/gamewon2.png";
		templateImages.gamelost.src = "images/templates/gamelost.png";
		/*templateImages.endGame0.src = "images/templates/0endScreen.png";
		templateImages.endGame1.src = "images/templates/1endScreen.png";
		templateImages.endGame2.src = "images/templates/2endScreen.png";
		templateImages.endGame3.src = "images/templates/3endScreen.png";
		templateImages.endGame4.src = "images/templates/4endScreen.png";
		templateImages.endGame5.src = "images/templates/5endScreen.png";
		templateImages.endGame6.src = "images/templates/6endScreen.png";
		templateImages.endGame7.src = "images/templates/7endScreen.png";
		templateImages.endGame8.src = "images/templates/8endScreen.png";
		templateImages.endGame9.src = "images/templates/9endScreen.png";*/
	
}

// compute the absolute difference between two images

function imageDifference(imgA, imgB) {

	var height = Math.min(imgA.height, imgB.height);
	var width = Math.min(imgA.width, imgB.width);
	
    var canvasA = $('<canvas />').attr('height', imgA.height + 'px').attr('width', imgA.width + 'px')[0];
    var contextA = canvasA.getContext('2d');
	
	var canvasB = $('<canvas />').attr('height', imgB.height + 'px').attr('width', imgB.width + 'px')[0];
    var contextB = canvasB.getContext('2d');
	
	contextA.clearRect (0, 0, imgA.width, imgA.height);
	contextA.drawImage(imgA,0,0); //with offset 0,0
	var imgDataA = contextA.getImageData(0, 0, imgA.width, imgA.height).data;
	
	contextB.clearRect (0, 0, imgB.width, imgB.height);
	contextB.drawImage(imgB,0,0); //with offset 0,0
	var imgDataB = contextB.getImageData(0, 0, imgB.width, imgB.height).data;
	
	//init diff with area difference of two images
	var n = imgA.width * imgA.height + imgB.width * imgB.height - 2 * width * height;
	var diff = 3 * 255 * n;
	//calculate colour difference
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var offset = (x + width * y) * 4;
		
			var colourA_R = imgDataA[offset];
			var colourA_G = imgDataA[offset+1];
			var colourA_B = imgDataA[offset+2];
			
			var colourB_R = imgDataB[offset];
			var colourB_G = imgDataB[offset+1];
			var colourB_B = imgDataB[offset+2];
			
			diff += Math.abs(colourA_R - colourB_R);
			diff += Math.abs(colourA_G - colourB_G);
			diff += Math.abs(colourA_B - colourB_B);
		}
	}
	return diff;
}

//get game state by template matching, then make corresponding action
function performAction(screenshot,action){
	var avgColourThreshold = 5;

	var canvas = $('<canvas />').attr('height', 26 + 'px').attr('width', 192 + 'px')[0];
	var context = canvas.getContext('2d');
	//cut out sub-image from screenshot to compare with the template
	context.drawImage(screenshot,636, 24, 192, 26,0,0,192,26);
	
	var numBytes = 3 * 192 * 26;
	var threshold = numBytes * avgColourThreshold;
	
	//parameters for level selection
	var pageSwitch = 0;
	var i = currentLevel;
	if (i > 21) {
		if (i == 22 || i == 43){
			pageSwitch = Math.floor(i/22);
		}
		i = ((i % 21) == 0) ? 21 : i % 21;
	}
	
	var subScreenshot = new Image();
	subScreenshot.onload = function(){
		if(imageDifference(subScreenshot, templateImages.mainmenu) < threshold){
			console.log('state is : main menu');
			chrome.tabs.sendMessage(abTabId, {command:"click", data:{x:305,y:277}}, function(response) {
				console.log('background.js: response from content script: ' + response.data);
				console.log('go from main menu to episode menu');
				setTimeout(function(){chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
			
					var gameStateProcessed = false;
					var screenshot = new Image();
					screenshot.onload = function(){
						//check current gmae state and take corresponding action
						performAction(screenshot,action);
					}
					screenshot.src = response.data;
				});}, 2000);

			});
		}
		else if(imageDifference(subScreenshot, templateImages.episodemenu) < threshold){
			console.log('state is : episodemenu');
			chrome.tabs.sendMessage(abTabId, {command:"click", data:{x:150,y:300}}, function(response) {
				console.log('background.js: response from content script: ' + response.data);
				console.log('go from episode menu to level selection');
				setTimeout(function(){chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
			
					var gameStateProcessed = false;
					var screenshot = new Image();
					screenshot.onload = function(){
						//check current gmae state and take corresponding action
						performAction(screenshot,action);
					}
					screenshot.src = response.data;
				});}, 2000);
			});
		}
		
		else if(imageDifference(subScreenshot, templateImages.levelselection) < threshold){
			console.log('state is : level selection');
			chrome.tabs.sendMessage(abTabId, {command:"click", data:{x:54 + ((i - 1) % 7) * 86,y:110 + Math.floor(((i - 1) / 7)) * 100}}, function(response) {
				console.log('background.js: response from content script: ' + response.data);
				console.log('go from level selection menu to level ' + currentLevel);
				setTimeout(function(){chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
			
					var gameStateProcessed = false;
					var screenshot = new Image();
					screenshot.onload = function(){
						//check current gmae state and take corresponding action
						performAction(screenshot,action);
					}
					screenshot.src = response.data;
				});}, 2000);
			});
		}
		
		else if(imageDifference(subScreenshot, templateImages.loading) < threshold || 
		imageDifference(subScreenshot, templateImages.loading2) < threshold){
			console.log('state is : loading');
			setTimeout(function(){chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
			
					var gameStateProcessed = false;
					var screenshot = new Image();
					screenshot.onload = function(){
						//check current gmae state and take corresponding action
						performAction(screenshot,action);
					}
					screenshot.src = response.data;
			});}, 2000);
		}
		
		else{
		
			var inGameCanvas1 = $('<canvas />').attr('height', 60 + 'px').attr('width', 61 + 'px')[0];
			var inGameContext1 = inGameCanvas1.getContext('2d');
			//cut out sub-image from screenshot to compare with the template
			inGameContext1.drawImage(screenshot,467, 350, 61, 60, 0, 0,61, 60);
			numBytes = 3 * 61 * 60;
			threshold = numBytes * avgColourThreshold;
		
			var inGameSubScreenshot1 = new Image();
			inGameSubScreenshot1.onload = function(){
				if(imageDifference(inGameSubScreenshot1, templateImages.gamewon1) < threshold || 
				imageDifference(inGameSubScreenshot1, templateImages.gamewon2) < threshold){
					console.log('state is : won');
					currentLevel++;
					chrome.tabs.sendMessage(abTabId, {command:"click", data:{x:342,y:382}}, function(response) {
						console.log('background.js: response from content script: ' + response.data);
						console.log('go from won page to level selection');
						setTimeout(function(){chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
					
							var gameStateProcessed = false;
							var screenshot = new Image();
							screenshot.onload = function(){
								//check current gmae state and take corresponding action
								performAction(screenshot,action);
							}
							screenshot.src = response.data;
						});}, 2000);
					});
				}
				
				else{
					var inGameCanvas2 = $('<canvas />').attr('height', 26 + 'px').attr('width', 192 + 'px')[0];
					var inGameContext2 = inGameCanvas2.getContext('2d');
					//cut out sub-image from screenshot to compare with the template
					inGameContext2.drawImage(screenshot,320, 112, 192, 26, 0, 0,192, 26);
					numBytes = 3 * 192 * 26;
					threshold = numBytes * avgColourThreshold;
				
					var inGameSubScreenshot2 = new Image();
					inGameSubScreenshot2.onload = function(){
						if(imageDifference(inGameSubScreenshot2, templateImages.gamelost) < threshold){
							console.log('state is : lost');		
							
							chrome.tabs.sendMessage(abTabId, {command:"click", data:{x:342,y:382}}, function(response) {
								console.log('background.js: response from content script: ' + response.data);
								console.log('go from lost page to level selection');
								setTimeout(function(){chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
							
									var gameStateProcessed = false;
									var screenshot = new Image();
									screenshot.onload = function(){
										//check current gmae state and take corresponding action
										performAction(screenshot,action);
									}
									screenshot.src = response.data;
								});}, 2000);
							});
							
						}
						else{
							console.log('state is : playing');	
							action(screenshot);
						}
					
					}
					inGameSubScreenshot2.src = inGameCanvas2.toDataURL();
				}
			}
			inGameSubScreenshot1.src = inGameCanvas1.toDataURL();
		}
	}
	subScreenshot.src = canvas.toDataURL();
}

//to be implement
function getEndGameScore(){}
function getInGameScore(){}