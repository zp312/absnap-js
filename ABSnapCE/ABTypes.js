/**Angrybirds specfic objects
 **Require Geom.js	
 **/

//Enum object types in Angrybirds
var ABType = Object.freeze({RedBird: "red bird", YellowBird: "yellow bird", WhiteBird: "white bird", BlackBird: "black bird", BuleBird: "blue bird", TNT: "TNT", Wood: "wood", Stone: "stone", Ice: "ice", Sling: "slingshot", Pig: "pig", Unknown: "unknown"});

//Constructs an Angrybirds object
function ABObject(rec, type, id){
	Rectangle.call(this, rec.x, rec.y);
	this.type = type;
	this.id = id;
}

