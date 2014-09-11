var currentLevel = 1;
var targetData;
//indicate if current level has been increased due to 'game won' state
//if true, do not increase currentlevel
//else currentlevel++
var gameWonProcessed = true;

function loadLevel(state){
	
}

function getBirdType(){
	cmdStatus = 'completed';
}

function shoot(state){
	if(state == ABState.Playing){
		cmdStatus = 'completed';
	}
	else if(state == ABState.MainMenu){
	}
	else if(state == ABState.EpisodeMenu){
	}
	else if(state == ABState.LevelSelection){
	}
	else if(state == ABState.Won){
	}
	else if(state == ABState.Lost){
	}
}

function restartLevel(state){
	cmdStatus = 'completed';
}

function ShootingSchema(shootingData){
	//while(gameState != ABState.Playing){			
	chrome.tabs.sendMessage(abTabId, {command:"screenshot"}, function(response) {
	
		var gameStateProcessed = false;
		var screenshot = new Image();
		screenshot.onload = function(){
			//check current gmae state and take corresponding action
			performAction(screenshot,shoot);
		}
		
		screenshot.src = response.data;

	});
	//}
}
