//preload template images 
//for recognising game status
preloadTemplates();

var abTabId; //tab id of angry birds page
var cmdStatus = 'pending';
var gameState = ABState.Unknown;

//send message to content-script for angry birds
function sendMessageToContent(request){
	chrome.tabs.query({active: true}, function(tabs) {
	//	console.log('background.js: forwarded ' + request + ' to content page');
		console.log('background.js: double check tab id: ' + abTabId);
		var command = request.command;
		if(command == 'shoot'){
			ShootingSchema(request);
		}
		
		else if(command == 'setTarget'){

		}
		
		else if(command == 'setTapTime'){

		}
		
		else if(command == 'adjustTarget'){

		}
		
		else if(command == 'setTrajectory'){
			ShootingSchema(request);
		}
		
		
		else if(command == 'screenshot'){	
			chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
				console.log('background.js: response from content script ' + response.data);
				var vision = new Vision(response.canvasWidth,response.canvasHeight, response.data,new function(data){});

				//console.log('background.js: response from content script :canvas width : ' + response.canvasWidth);
				cmdStatus = 'completed';
			});
		}
	});

}	
	
//listen to inner messages
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.command == "angrybirds actived"){
			console.log("background.js: angrybirds tab id sent from angrybirds page, tab.id=", sender.tab.id);
			abTabId = sender.tab.id;
		}
	}
)	


//listen to message(command) from SNAP!  	
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
	
	console.log('background.js: receiving command ' + request.command);
	
	if(request.command != 'checkState'){
	
		cmdStatus = 'pending';//set command processing status to 'pending'

		sendMessageToContent(request);//forward message to content script
		sendResponse({feedback: "received command " + request.command});
	}
	
	else{
		sendResponse({feedback: cmdStatus});
	}
});
 


