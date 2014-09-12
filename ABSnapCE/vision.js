var regionThreshold = 10; // minimal pixels in a region   
var woodObjs;

//vision
function Vision(colour, width, height){
 
	this.segment = null;
	this.nSegments = 0;
	this.scene = new Array();
	this.width = width;
	this.height = height;
	//compress rgb with first 3 bits					
	for (var y = 0; y < height; y++) {
		this.scene[y]= new Array();
		for (var x = 0; x < width; x++) {
			
			//offset for getting correct pixel
			var offset = (x + width * y) * 4;
			
			this.scene[y][x] =  ((colour[offset] & 0xe0) << 1) |
			 ((colour[offset + 1] & 0xe0) >> 2) |
			 ((colour[offset + 2] & 0xe0) >> 5);
			
		}
	}
	console.log('segments built completed');
	

	// find connected components
	this.segments = this.findConnectedComponents();

	this.nSegments = this.countComponents();
	this.boxes = null;
	// System.out.println("...found " + this.nSegments + " components");

	this.colours = new Array();
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			this.colours[this.segments[y][x]] = this.scene[y][x];
		}
	}

	// find bounding boxes and segment colours
	this.boxes = this.findBoundingBoxes();
	console.log('box 376 ' + this.boxes[376]);
	console.log('scene built completed');

}

// returns bounding boxes for all connected components
Vision.prototype.findBoundingBoxes = function(){
	var boxes = new Array();
	for (var y = 0; y < this.segments.length; y++) {
		for (var x = 0; x < this.segments.length; x++) {
			var n = this.segments[y][x];
			if (n < 0)
				continue;
			if (boxes[n] == null) {
				boxes[n] = new Rectangle(x, y, 1, 1);
			} else {
				boxes[n].add(x, y);
			}
		}
	}
	return boxes;
}

// find pigs in the current scene
Vision.prototype.findPigs = function() {
	var objects = new LinkedList();
	var ignorePixel = new Array();

	for (var i = 0; i < this.height; i++) {
		ignorePixel[i] = new Array();
		for (var j = 0; j < this.width; j++) {
			ignorePixel[i][j] = false;
		}
	}

	for (var n = 0; n < this.nSegments; n++) {
		if ((this.colours[n] != 376) || ignorePixel[n])
			continue;

		// dilate bounding box of colour 376
		var bounds = dialateRectangle(this.boxes[n],
				this.boxes[n].width / 2 + 1, this.boxes[n].height / 2 + 1);
		var obj = this.boxes[n];

		// look for overlapping bounding boxes of colour 376
		for (var m = n + 1; m < this.nSegments; m++) {
			if (this.colours[m] != 376)
				continue;
			var bounds2 = dialateRectangle(
					this.boxes[m], this.boxes[m].width / 2 + 1,
					this.boxes[m].height / 2 + 1);
			if (bounds.intersects(bounds2)) {
				bounds.add(bounds2);
				obj.add(this.boxes[m]);
				ignorePixel[m] = true;
			}
		}

		// look for overlapping bounding boxes of colour 250
		var bValidObject = false;
		for (var m = 0; m < this.nSegments; m++) {
			if (this.colours[m] != 250)
				continue;
			if (bounds.intersects(this.boxes[m])) {
				bValidObject = true;
				break;
			}
		}

		// add object if valid
		if (bValidObject) {
			obj = dialateRectangle(obj, obj.width / 2 + 1,
					obj.height / 2 + 1);
			obj = cropBoundingBox(obj, this.width, this.height);
			objects.add(obj);
		}
	}

	return objects;
}


//find wood objects(MBRs)
Vision.prototype.findWood = function(){
	console.log('searching for wooden objects...');
	var objects = new LinkedList();

	var ignorePixel = new Array();

	for (var i = 0; i < this.height; i++) {
		ignorePixel[i] = new Array();
		for (var j = 0; j < this.width; j++) {
			ignorePixel[i][j] = false;
		}

	}

	for (var i = 0; i < this.height; i++) {
		for (var j = 0; j < this.width; j++) {
			if ((this.scene[i][j] != 481) || ignorePixel[i][j])
				continue;
			var obj = new Rectangle(j, i, 0, 0);
			var l = new LinkedList();
			var pointBag = new LinkedList();
			var pt = new Point(j, i);
			l.append(new LinkedList.Node(pt));
			pointBag.append(new LinkedList.Node(pt));
			ignorePixel[i][j] = true;
			while (true) {
				if (l.first == null)
					break;
				var p = l.first;
				// check if the colours of the adjacent points of p is
				// belong to wood
				if (p.data.y < this.height - 1)
					if ((this.scene[p.data.y + 1][p.data.x] == 481
							|| this.scene[p.data.y + 1][p.data.x] == 408 || this.scene[p.data.y + 1][p.data.x] == 417)
							&& !ignorePixel[p.data.y + 1][p.data.x]) {
						l.append(new LinkedList.Node(new Point(p.data.x, p.data.y + 1)));
						obj.add(p.data.x, p.data.y + 1);
						pointBag.append(new LinkedList.Node(new Point(p.data.x, p.data.y + 1)));
					}
				if (p.data.x < this.width - 1)
					if ((this.scene[p.data.y][p.data.x + 1] == 481
							|| this.scene[p.data.y][p.data.x + 1] == 408 || this.scene[p.data.y][p.data.x + 1] == 417)
							&& !ignorePixel[p.data.y][p.data.x + 1]) {
						l.append(new LinkedList.Node(new Point(p.data.x + 1, p.data.y)));
						obj.add(p.data.x + 1, p.data.y);
						pointBag.append(new LinkedList.Node(new Point(p.data.x + 1, p.data.y)));
					}
				if (p.data.y > 0)
					if ((this.scene[p.data.y - 1][p.data.x] == 481
							|| this.scene[p.data.y - 1][p.data.x] == 408 || this.scene[p.data.y - 1][p.data.x] == 417)
							&& !ignorePixel[p.data.y - 1][p.data.x]) {
						l.append(new LinkedList.Node(new Point(p.data.x, p.data.y - 1)));
						obj.add(p.data.x, p.data.y - 1);
						pointBag.append(new LinkedList.Node(new Point(p.data.x, p.data.y - 1)));
					}
				if (p.data.x > 0)
					if ((this.scene[p.data.y][p.data.x - 1] == 481
							|| this.scene[p.data.y][p.data.x - 1] == 408 || this.scene[p.data.y][p.data.x - 1] == 417)
							&& !ignorePixel[p.data.y][p.data.x - 1]) {
						l.append(new LinkedList.Node(new Point(p.data.x - 1, p.data.y)));
						obj.add(p.data.x - 1, p.data.y);
						pointBag.append(new LinkedList.Node(new Point(p.data.x - 1, p.data.y)));
					}

				if (p.data.y < this.height - 1)
					ignorePixel[p.data.y + 1][p.data.x] = true;
				if (p.data.x < this.width - 1)
					ignorePixel[p.data.y][p.data.x + 1] = true;
				if (p.data.y > 0)
					ignorePixel[p.data.y - 1][p.data.x] = true;
				if (p.data.x > 0)
					ignorePixel[p.data.y][p.data.x - 1] = true;
				l.remove(p);
			}
			
			if (obj.width * obj.height > regionThreshold
					&& !(new Rectangle(0, 0, 190, 55).containsRect(obj))){
//				console.log("selected object " + obj);
				objects.append(new LinkedList.Node(obj));
			}
		}
	}
	console.log(objects.length + ' wooden objects found!');
	return objects;
}	

Vision.prototype.findStones = function() {
	console.log('searching for stone objects...');
	var objects = new LinkedList();

	
	var ignorePixel = new Array();

	for (var i = 0; i < this.height; i++) {
		ignorePixel[i] = new Array();
		for (var j = 0; j < this.width; j++) {
			ignorePixel[i][j] = false;
		}
	}

	for (var i = 0; i < this.height; i++) {
		for (var j = 0; j < this.width; j++) {
			if ((this.scene[i][j] != 365) || ignorePixel[i][j])
				continue;
			var obj = new Rectangle(j, i, 0, 0);
			var l = new LinkedList();
			l.append(new LinkedList.Node(new Point(j, i)));
			ignorePixel[i][j] = true;
			while (true) {
				if (l.first == null)
					break;
				var node = l.first;	
				var p = node.data;
				// check if the colours of the adjacent points of p is
				// belong to stone
				if (p.y < this.height - 1)
					if ((this.scene[p.y + 1][p.x] == 365)
							&& !ignorePixel[p.y + 1][p.x]) {
						l.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
						obj.add(p.x, p.y + 1);
					}
				if (p.x < this.width - 1)
					if ((this.scene[p.y][p.x + 1] == 365)
							&& !ignorePixel[p.y][p.x + 1]) {
						l.append(new LinkedList.Node(new Point(p.x + 1, p.y)));
						obj.add(p.x + 1, p.y);
					}

				if (p.y > 0)
					if ((this.scene[p.y - 1][p.x] == 365)
							&& !ignorePixel[p.y - 1][p.x]) {
						l.append(new LinkedList.Node(new Point(p.x, p.y - 1)));
						obj.add(p.x, p.y - 1);
					}

				if (p.x > 0)
					if ((this.scene[p.y][p.x - 1] == 365)
							&& !ignorePixel[p.y][p.x - 1]) {
						l.append(new LinkedList.Node(new Point(p.x - 1, p.y)));
						obj.add(p.x - 1, p.y);
					}

				if (p.y < this.height - 1)
					ignorePixel[p.y + 1][p.x] = true;
				if (p.x < this.width - 1)
					ignorePixel[p.y][p.x + 1] = true;
				if (p.y > 0)
					ignorePixel[p.y - 1][p.x] = true;
				if (p.x > 0)
					ignorePixel[p.y][p.x - 1] = true;
				l.remove(node);
			}
			if (obj.width * obj.height > regionThreshold
					&& !(new Rectangle(0, 0, 190, 55).containsRect(obj)))
				objects.append(new LinkedList.Node(obj));
		}
	}
	console.log(objects.length + ' stone objects found!');
	return objects;
}

Vision.prototype.findIce = function() {
	console.log('searching for ice objects...');
	var objects = new LinkedList();
	var ignorePixel = new Array();

	for (var i = 0; i < this.height; i++) {
		ignorePixel[i] = new Array();
		for (var j = 0; j < this.width; j++) {
			ignorePixel[i][j] = false;
		}
	}

	for (var i = 0; i < this.height; i++) {
		for (var j = 0; j < this.width; j++) {
			if ((this.scene[i][j] != 311) || ignorePixel[i][j])
				continue;
			var obj = new Rectangle(j, i, 0, 0);
			var l = new LinkedList();
			l.append(new LinkedList.Node(new Point(j, i)));
			ignorePixel[i][j] = true;
			while (true) {
				if (l.first == null)
					break;
				var node = l.first;
				var p = node.data;
				// check if the colours of the adjacent points of p is
				// belong to ice
				if (p.y < this.height - 1)
					if ((this.scene[p.y + 1][p.x] == 311
							|| this.scene[p.y + 1][p.x] == 247 || this.scene[p.y + 1][p.x] == 183)
							&& !ignorePixel[p.y + 1][p.x]) {
						l.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
						obj.add(p.x, p.y + 1);
					}
				if (p.x < this.width - 1)
					if ((this.scene[p.y][p.x + 1] == 311
							|| this.scene[p.y][p.x + 1] == 247 || this.scene[p.y][p.x + 1] == 183)
							&& !ignorePixel[p.y][p.x + 1]) {
						l.append(new LinkedList.Node(new Point(p.x + 1, p.y)));
						obj.add(p.x + 1, p.y);
					}
				if (p.y > 0)
					if ((this.scene[p.y - 1][p.x] == 311
							|| this.scene[p.y - 1][p.x] == 247 || this.scene[p.y - 1][p.x] == 183)
							&& !ignorePixel[p.y - 1][p.x]) {
						l.append(new LinkedList.Node(new Point(p.x, p.y - 1)));
						obj.add(p.x, p.y - 1);
					}
				if (p.x > 0)
					if ((this.scene[p.y][p.x - 1] == 311
							|| this.scene[p.y][p.x - 1] == 247 || this.scene[p.y][p.x - 1] == 183)
							&& !ignorePixel[p.y][p.x - 1]) {
						l.append(new LinkedList.Node(new Point(p.x - 1, p.y)));
						obj.add(p.x - 1, p.y);
					}

				if (p.y < this.height - 1)
					ignorePixel[p.y + 1][p.x] = true;
				if (p.x < this.width - 1)
					ignorePixel[p.y][p.x + 1] = true;
				if (p.y > 0)
					ignorePixel[p.y - 1][p.x] = true;
				if (p.x > 0)
					ignorePixel[p.y][p.x - 1] = true;
				l.remove(node);
			}
			if (obj.width * obj.height > regionThreshold
					&& !(new Rectangle(0, 0, 190, 55).containsRect(obj)))
				objects.append(new LinkedList.Node(obj));
		}
	}
	console.log(objects.length + ' ice objects found!');
	return objects;
}


//find slingshot
//only return one rectangle
Vision.prototype.findSlingshotMBR = function() {
	var obj;
	
	var ignorePixel = new Array();
	for (var i = 0; i < this.height; i++) {
		ignorePixel[i] = new Array();
		for (var j = 0; j < this.width; j++) {
			ignorePixel[i][j] = false;
		}
	}


	for (var i = 0; i < this.height; i++) {
		for (var j = 0; j < this.width; j++) {
			if ((this.scene[i][j] != 345) || ignorePixel[i][j])
				continue;
			obj = new Rectangle(j, i, 0, 0);
			var l = new LinkedList();

			var pointsinRec = new LinkedList();
			l.append(new LinkedList.Node(new Point(j, i)));
			ignorePixel[i][j] = true;
			while (true) {
				if (l.first == null)
					break;
				var node = l.first;
				var p = node.data;
				// check if the colours of the adjacent points of p is
				// belong to slingshot
				
				//check underneath pixel
				if (p.y < this.height - 1)
					if ((this.scene[p.y + 1][p.x] == 345
							|| this.scene[p.y + 1][p.x] == 418
							|| this.scene[p.y + 1][p.x] == 273
							|| this.scene[p.y + 1][p.x] == 281
							|| this.scene[p.y + 1][p.x] == 209
							|| this.scene[p.y + 1][p.x] == 346
							|| this.scene[p.y + 1][p.x] == 354
							|| this.scene[p.y + 1][p.x] == 282 || this.scene[p.y + 1][p.x] == 351)
							&& !ignorePixel[p.y + 1][p.x]) {
						l.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
						obj.add(p.x, p.y + 1);
						pointsinRec.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
					}
				
				//check right pixel
				if (p.x < this.width - 1)
					if ((this.scene[p.y][p.x + 1] == 345
							|| this.scene[p.y][p.x + 1] == 418
							|| this.scene[p.y][p.x + 1] == 346
							|| this.scene[p.y][p.x + 1] == 354
							|| this.scene[p.y][p.x + 1] == 273
							|| this.scene[p.y][p.x + 1] == 281
							|| this.scene[p.y][p.x + 1] == 209
							|| this.scene[p.y][p.x + 1] == 282 || this.scene[p.y][p.x + 1] == 351)
							&& !ignorePixel[p.y][p.x + 1]) {
						l.append(new LinkedList.Node(new Point(p.x + 1, p.y)));
						obj.add(p.x + 1, p.y);
						pointsinRec.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
					}

				//check upper pixel
				if (p.y > 0)
					if ((this.scene[p.y - 1][p.x] == 345
							|| this.scene[p.y - 1][p.x] == 418
							|| this.scene[p.y - 1][p.x] == 346
							|| this.scene[p.y - 1][p.x] == 354
							|| this.scene[p.y - 1][p.x] == 273
							|| this.scene[p.y - 1][p.x] == 281
							|| this.scene[p.y - 1][p.x] == 209
							|| this.scene[p.y - 1][p.x] == 282 || this.scene[p.y - 1][p.x] == 351)
							&& !ignorePixel[p.y - 1][p.x]) {
						l.append(new LinkedList.Node(new Point(p.x, p.y - 1)));
						obj.add(p.x, p.y - 1);
						pointsinRec.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
					}

				//check left pixel
				if (p.x > 0)
					if ((this.scene[p.y][p.x - 1] == 345
							|| this.scene[p.y][p.x - 1] == 418
							|| this.scene[p.y][p.x - 1] == 346
							|| this.scene[p.y][p.x - 1] == 354
							|| this.scene[p.y][p.x - 1] == 273
							|| this.scene[p.y][p.x - 1] == 281
							|| this.scene[p.y][p.x - 1] == 209
							|| this.scene[p.y][p.x - 1] == 282 || this.scene[p.y][p.x - 1] == 351)
							&& !ignorePixel[p.y][p.x - 1]) {
						l.append(new LinkedList.Node(new Point(p.x - 1, p.y)));
						obj.add(p.x - 1, p.y);
						pointsinRec.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
					}

				//ignore checked pixels
				if (p.y < this.height - 1)
					ignorePixel[p.y + 1][p.x] = true;
				if (p.x < this.width - 1)
					ignorePixel[p.y][p.x + 1] = true;
				if (p.y > 0)
					ignorePixel[p.y - 1][p.x] = true;
				if (p.x > 0)
					ignorePixel[p.y][p.x - 1] = true;
					
				l.remove(node);

			}
			var hist = this.histogram(obj);

			// abandon shelf underneath
			if (obj.height > 10) {
				var col = new Rectangle(obj.x, obj.y, 1, obj.height);
				var histCol = this.histogram(col);
			

				if (this.scene[obj.y][obj.x] == 511
						|| this.scene[obj.y][obj.x] == 447) {
					for (var m = obj.y; m < obj.y + obj.height; m++) {
						if (this.scene[m][obj.x] == 345
								|| this.scene[m][obj.x] == 418
								|| this.scene[m][obj.x] == 346
								|| this.scene[m][obj.x] == 354
								|| this.scene[m][obj.x] == 273
								|| this.scene[m][obj.x] == 281
								|| this.scene[m][obj.x] == 209
								|| this.scene[m][obj.x] == 282
								|| this.scene[m][obj.x] == 351) {
							obj.setSize(obj.width, m - obj.y);
							break;
						}
					}
				}

				while (histCol[511] >= obj.height * 0.8) {
					if(obj.width == 0)
						break;
					obj.setBounds(obj.x + 1, obj.y, obj.width - 1,
							obj.height);
					col = new Rectangle(obj.x + 1, obj.y, 1, obj.height);
					histCol = this.histogram(col);
				}

				col = new Rectangle(obj.x + obj.width, obj.y, 1, obj.height);
				histCol = this.histogram(col);
				while (histCol[511] >= obj.height * 0.8 && obj.height > 10) {
					if(obj.width == 0)
						break;
					obj.setSize(obj.width - 1, obj.height);
					col = new Rectangle(obj.x + obj.width, obj.y, 1,
							obj.height);
					histCol = this.histogram(col);
				}
			}

			if (obj.width > obj.height)
				continue;

			if ((hist[345] > Math.max(32, 0.1 * obj.width * obj.height))
					&& (hist[64] != 0)) {
				obj.addRect(new Rectangle(obj.x - obj.width / 10, obj.y
						- obj.height / 3, obj.width / 10 * 12,
						obj.height / 3 * 4));
				console.log('sling shot found');
				return obj;
			}
		}
	}
	console.log('sling shot not found!');
	return null;
}

/*
	

	// find birds in the current scene
	public List<Rectangle> findRedBirds() {
		ArrayList<Rectangle> objects = new ArrayList<Rectangle>();

		// test for red birds (385, 488, 501)
		Boolean ignore[] = new Boolean[this.nSegments];
		Arrays.fill(ignore, false);

		for (int n = 0; n < this.nSegments; n++) {
			if ((this.colours[n] != 385) || ignore[n])
				continue;

			// dilate bounding box around colour 385
			Rectangle bounds = VisionUtils.dialateRectangle(_boxes[n], 1,
					_boxes[n].height / 2 + 1);
			Rectangle obj = _boxes[n];

			// look for overlapping bounding boxes of colour 385
			for (int m = n + 1; m < this.nSegments; m++) {
				if (this.colours[m] != 385)
					continue;
				final Rectangle bounds2 = VisionUtils.dialateRectangle(
						_boxes[m], 1, _boxes[m].height / 2 + 1);
				if (bounds.intersects(bounds2)) {
					bounds.add(bounds2);
					obj.add(_boxes[m]);
					ignore[m] = true;
				}
			}

			// look for overlapping bounding boxes of colours 488 and 501
			Boolean bValidObject = false;
			for (int m = 0; m < this.nSegments; m++) {
				if ((this.colours[m] != 488) && (this.colours[m] != 501))
					continue;
				if (bounds.intersects(_boxes[m])) {
					obj.add(_boxes[m]);
					bValidObject = true;
				}
			}

			if (bValidObject) {
				obj = VisionUtils.cropBoundingBox(obj, _nWidth, _nHeight);
				objects.add(obj);
			}
		}

		return objects;
	}

	public List<Rectangle> findBlueBirds() {
		ArrayList<Rectangle> objects = new ArrayList<Rectangle>();

		// test for blue birds (238)
		Boolean ignore[] = new Boolean[this.nSegments];
		Arrays.fill(ignore, false);

		for (int n = 0; n < this.nSegments; n++) {
			if ((this.colours[n] != 238) || ignore[n])
				continue;

			// dilate bounding box around colour 238
			Rectangle bounds = VisionUtils.dialateRectangle(_boxes[n], 1,
					_boxes[n].height / 2 + 1);
			Rectangle obj = _boxes[n];

			// look for overlapping bounding boxes of colours 238, 165, 280,
			// 344, 488, 416
			for (int m = n + 1; m < this.nSegments; m++) {
				if ((this.colours[m] != 238) && (this.colours[m] != 165)
						&& (this.colours[m] != 280) && (this.colours[m] != 344)
						&& (this.colours[m] != 488) && (this.colours[m] != 416))
					continue;
				final Rectangle bounds2 = VisionUtils.dialateRectangle(
						_boxes[m], 2, _boxes[m].height / 2 + 1);
				if (bounds.intersects(bounds2)) {
					bounds.add(bounds2);
					obj.add(_boxes[m]);
					ignore[m] = true;
				}
			}

			for (int m = n + 1; m < this.nSegments; m++) {
				if (this.colours[m] != 238)
					continue;
				final Rectangle bounds2 = VisionUtils.dialateRectangle(
						_boxes[m], 2, _boxes[m].height / 2 + 1);
				if (bounds.intersects(bounds2)) {
					ignore[m] = true;
				}
			}

			// look for overlapping bounding boxes of colours 488
			Boolean bValidObject = false;
			for (int m = 0; m < this.nSegments; m++) {
				if (this.colours[m] != 488)
					continue;
				if (bounds.intersects(_boxes[m])) {
					obj.add(_boxes[m]);
					bValidObject = true;
				}
			}

			if (bValidObject && (obj.width > 3)) {
				obj = VisionUtils.cropBoundingBox(obj, _nWidth, _nHeight);
				objects.add(obj);
			}
		}

		return objects;
	}

	public List<Rectangle> findYellowBirds() {
		ArrayList<Rectangle> objects = new ArrayList<Rectangle>();

		// test for blue birds (497)
		Boolean ignore[] = new Boolean[this.nSegments];
		Arrays.fill(ignore, false);

		for (int n = 0; n < this.nSegments; n++) {
			if ((this.colours[n] != 497) || ignore[n])
				continue;

			// dilate bounding box around colour 497
			Rectangle bounds = VisionUtils.dialateRectangle(_boxes[n], 2, 2);
			Rectangle obj = _boxes[n];

			// look for overlapping bounding boxes of colours 497
			for (int m = n + 1; m < this.nSegments; m++) {
				if (this.colours[m] != 497)
					continue;
				final Rectangle bounds2 = VisionUtils.dialateRectangle(
						_boxes[m], 2, 2);
				if (bounds.intersects(bounds2)) {
					bounds.add(bounds2);
					obj.add(_boxes[m]);
					ignore[m] = true;
				}
			}

			// confirm secondary colours 288
			obj = VisionUtils.dialateRectangle(obj, 2, 2);
			obj = VisionUtils.cropBoundingBox(obj, _nWidth, _nHeight);
			int[] hist = histogram(obj);
			if (hist[288] > 0) {
				objects.add(obj);
			}
		}

		return objects;
	}

	public List<Rectangle> findWhiteBirds() {
		ArrayList<Rectangle> objects = new ArrayList<Rectangle>();

		// test for white birds (490)
		Boolean ignore[] = new Boolean[this.nSegments];
		Arrays.fill(ignore, false);

		for (int n = 0; n < this.nSegments; n++) {
			if ((this.colours[n] != 490) || ignore[n])
				continue;

			// dilate bounding box around colour 490
			Rectangle bounds = VisionUtils.dialateRectangle(_boxes[n], 2, 2);
			Rectangle obj = _boxes[n];

			// look for overlapping bounding boxes of colour 490
			for (int m = n + 1; m < this.nSegments; m++) {
				if (this.colours[m] != 490
						&& this.colours[m] != 508
						&& this.colours[m] != 510)
					continue;
				final Rectangle bounds2 = VisionUtils.dialateRectangle(
						_boxes[m], 2, 2);
				if (bounds.intersects(bounds2)) {
					bounds.add(bounds2);
					obj.add(_boxes[m]);
					ignore[m] = true;
				}
			}

			// confirm secondary colour 510
			obj = VisionUtils.dialateRectangle(obj, 2, 2);
			obj = VisionUtils.cropBoundingBox(obj, _nWidth, _nHeight);
			   // remove objects too high or too low in the image 
			// (probably false positives)
			if ((obj.y < 60) || (obj.y > 385)) {
				continue;
		                     }
			int[] hist = histogram(obj);
			if (hist[510] > 0 && hist[508] > 0) {
				objects.add(obj);
			}
		}

		return objects;
	}
	
	public List<Rectangle> findBlackBirds() {
		ArrayList<Rectangle> objects = new ArrayList<Rectangle>();

		// test for white birds (488)
		Boolean ignore[] = new Boolean[this.nSegments];
		Arrays.fill(ignore, false);

		for (int n = 0; n < this.nSegments; n++) {
			if ((this.colours[n] != 488) || ignore[n])
				continue;

			// dilate bounding box around colour 488
			Rectangle bounds = VisionUtils.dialateRectangle(_boxes[n], 2, 2);
			Rectangle obj = _boxes[n];

			// look for overlapping bounding boxes of colour 488
			for (int m = n + 1; m < this.nSegments; m++) {
				if (this.colours[m] != 488
						&& this.colours[m] != 146
						&& this.colours[m] != 64
						&& this.colours[m] != 0)
					continue;
				final Rectangle bounds2 = VisionUtils.dialateRectangle(
						_boxes[m], 2, 2);
				if (bounds.intersects(bounds2)) {
					bounds.add(bounds2);
					obj.add(_boxes[m]);
					ignore[m] = true;
				}
			}

			// confirm secondary colour
			obj = VisionUtils.dialateRectangle(obj, 2, 2);
			obj = VisionUtils.cropBoundingBox(obj, _nWidth, _nHeight);
			int[] hist = histogram(obj);
			if ((hist[0] > Math.max(32, 0.1 * obj.width * obj.height))&& hist[64] > 0 && hist[385] == 0) {
				objects.add(obj);
			}
		}

		return objects;
	}

*/


// finds 4-connected components by breadth first search (and renumbers
// from zero); pixels with negative value are ignored
Vision.prototype.findConnectedComponents = function() {

	var n = -1;
	var cc = new Array();
	for (var y = 0; y < this.height; y++) {
		cc[y] = new Array();
		for (var x = 0; x < this.width; x++) {
			cc[y][x] = -1;
		}
	}

	// iterate over all pixels
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			// skip negative pixels
			if (this.scene[y][x] == -1)
				continue;

			// check if component was already numbered
			if (cc[y][x] != -1)
				continue;

			// number the new component
			n = n + 1;
			/*Queue<Point>*/var q = new LinkedList();
			q.append(new LinkedList.Node(new Point(x, y)));
			cc[y][x] = n;
			while (q.first != null) {
				var node = q.first;
				var p = node.data;
				if ((p.y > 0) && (this.scene[p.y - 1][p.x] == this.scene[p.y][p.x])
						&& (cc[p.y - 1][p.x] == -1)) {
					q.append(new LinkedList.Node(new Point(p.x, p.y - 1)));
					cc[p.y - 1][p.x] = n;
				}
				if ((p.x > 0) && (this.scene[p.y][p.x - 1] == this.scene[p.y][p.x])
						&& (cc[p.y][p.x - 1] == -1)) {
					q.append(new LinkedList.Node(new Point(p.x - 1, p.y)));
					cc[p.y][p.x - 1] = n;
				}
				if ((p.y < this.height - 1)
						&& (this.scene[p.y + 1][p.x] == this.scene[p.y][p.x])
						&& (cc[p.y + 1][p.x] == -1)) {
					q.append(new LinkedList.Node(new Point(p.x, p.y + 1)));
					cc[p.y + 1][p.x] = n;
				}
				if ((p.x < this.width - 1)
						&& (this.scene[p.y][p.x + 1] == this.scene[p.y][p.x])
						&& (cc[p.y][p.x + 1] == -1)) {
					q.append(new LinkedList.Node(new Point(p.x + 1, p.y)));
					cc[p.y][p.x + 1] = n;
				}
				q.remove(node);
			}
		}
	}

	return cc;
}

// returns number of components
Vision.prototype.countComponents = function() {
	var n = 0;
	for (var y = 0; y < this.segments.length; y++) {
		for (var x = 0; x < this.segments[y].length; x++) {
			n = Math.max(n, this.segments[y][x] + 1);
		}
	}
	return n;
}


// compute a histogram of colours within a given bounding box
Vision.prototype.histogram = function(/*Rectangle*/ r) {
	var len = 512;
	var h = new Array(len);
	while (--len >= 0) {
        h[len] = 0;
    }

	for (var y = r.y; y < r.y + r.height; y++) {
		if ((y < 0) || (y >= this.height))
			continue;
		for (var x = r.x; x < r.x + r.width; x++) {
			if ((x < 0) || (x >= this.width))
				continue;
			h[this.colours[this.segments[y][x]]] += 1;
		}
	}

	return h;
}
