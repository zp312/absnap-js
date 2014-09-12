/**Useful geometric shapes in Angry Birds**/

//represents a point
//retrieved from libsjs project https://code.google.com/p/libsjs/source/browse/trunk/geom/point.class.js
//modified
/**
 * Create a point with x and y coordinates
 * @version 1.0
 * @param {Number} x new x coordinate
 * @param {Number} y new y coordinate
 * @param {Object} x Object literal containing x and y values
 * @returns true
 */
function Point(x, y) {
        if (typeof x === 'number' && typeof x === 'number') {
                this.x = x;
                this.y = y;             
        }
        else if (typeof x === 'object' && typeof x.x === 'number' && typeof x.y === 'number') {
                this.x = x.x;
                this.y = x.y;
        }
        else {
                throw new Error('com.bb.geom.Point expected a coordinate pair');
        }
        return true;
};

/**
 * com.bb.geom.Point prototype object
 */
Point.prototype = {
        /**
         * Set the X coordinate of the point
         * @param {Number} x new x coordinate
         * @returns true
         */
        setX: function (x) {
                this.x = x;
                return true;
        },
        /**
         * Set the Y coordinate of the point
         * @param {Number} y new y coordinate
         * @returns true
         */
        setY: function (y) {
                this.y = y;
                return true;
        },
        /**
         * Get the X coordinate of the point
         * @returns {Number} x coordinate of the point
         */
        getX: function () {
                return this.x;
        },
        /**
         * Get the Y coordinate of the point
         * @returns {Number} y coordinate of the point
         */
        getY: function () {
                return this.y;
        },
        /**
         * Set the x and y coordinate of the point
         * @param {Number} x new x coordinate
         * @param {Number} y new y coordinate
         * @param {Object} x Object literal containing x and y values
         * @returns true
         */
        setLocation: function (x, y) {
                if (typeof x === 'number' && typeof x === 'number') {
                        this.x = x;
                        this.y = y;             
                }
                else if (typeof x === 'object' && typeof x.x === 'number' && typeof x.y === 'number') {
                        this.x = x.x;
                        this.y = x.y;
                }
                return true;
        },
        /**
         * Get the x and y coordinates of the point
         * @returns Object literal containing x and y values
         */
        getLocation: function () {
                return {
                        x: this.x,
                        y: this.y
                };
        }
};


//Constructs a rectangle with top-left point and its width and height
//retrieved from libsjs project https://code.google.com/p/libsjs/source/browse/trunk/geom/rectangle.class.js?r=2 
/**
 * A class to handle the height, width, and x y cordinates of a rectangle.
 * @version 1.1
 * @param {String} height Rectangle height
 * @param {String} width Rectangle width
 * @param {String} x Rectangle x coordinate
 * @param {String} y Rectangle y coordinate
 */
function Rectangle( x, y,width,height) {
		if (isNaN(height) || isNaN(width) || isNaN(x) || isNaN(y)  || typeof height !== 'number' || typeof width !== 'number' || typeof x !== 'number' || typeof y !== 'number') {
				return false;
		}
		else {
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
		}
};


function dialateRectangle(rect, dx, dy) {
	return new Rectangle(rect.x - dx, rect.y - dy, rect.width + 2 * dx, rect.height + 2 * dy);
};
				
				
// crops a bounding box to be within an image of size width-by-height				
function cropBoundingBox(r, width, height) {
		if (r.x < 0)
			r.x = 0;
		if (r.y < 0)
			r.y = 0;
		if ((r.x + r.width) > width)
			r.width = width - r.x;
		if ((r.y + r.height) > height)
			r.height = height - r.y;

		return r;
	}				

/**
 * Prototype of BB.Geom.Rectangle
 */
        Rectangle.prototype = {
                /**
                 * Get the height of the rectangle
                 * @returns The height of the rectangle
                 */
                getHeight: function () {
                        return this.height;
                },
                /**
                 * Get the width of the rectangle
                 * @returns The width of the rectangle.
                 */
                getWidth: function () {
                        return this.width;
                },
                /**
                 * Get the x coordinate of the rectangle
                 * @returns The x coordinate of the rectangle
                 */
                getX: function () {
                        return this.x;
                },
                /**
                 * Get the y coordinate of the rectangle
                 * @returns The y coordinate of the rectangle
                 */
                getY: function () {
                        return this.y;
                },
                /**
                 * Get the hight and width of the rectangle
                 * @returns Object literal containing the height and width of the rectangle
                 */
                getSize: function () {
                        return {
                                height: this.height,
                                width: this.width
                        };
                },
                /**
                 * Get the X Y coordinates of the rectangle
                 * @returns Object literal containing the X and Y coordinates of the rectangle
                 */
                getLocation: function () {
                        return {
                                x: this.x,
                                y: this.y
                        };
                },
                /**
                 * Set the height of the rectangle
                 * @param {Number} height Number value to set as the height of the rectangle
                 * @returns True when the height is set false when an error is encountered
                 */
                setHeight: function (height) {
                        if (!isNaN(height) && typeof height === 'number' && height >= 0 && height !== Infinity) {
                                this.height = height;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
                /**
                 * Set the width of the rectangle
                 * @param {Number} width Number value to set as the width of the rectangle
                 * @returns True when the width is set false when an error is encountered
                 */
                setWidth: function (width) {
                        if (!isNaN(width) && typeof width === 'number' && width >= 0 && width !== Infinity) {
                                this.width = width;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
                /**
                 * Set the x cooridnant of the rectangle
                 * @param {Number} x Number value to set as the x cooridnant of the rectangle
                 * @returns True when the x coordinate is set false when an error is encountered
                 */
                setX: function (x) {
                        if (!isNaN(x) && typeof x === 'number' && x >= 0 && x !== Infinity) {
                                this.x = x;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
                /**
                 * Set the y cooridnant of the rectangle
                 * @param {Number} y Number value to set as the y cooridnant of the rectangle
                 * @returns True when the y coordinate is set false when an error is encountered
                 */
                setY: function (y) {
                        if (!isNaN(y) && typeof y === 'number' && y >= 0 && y !== Infinity) {
                                this.y = y;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
                /**
                 * Set the height and width of the rectangle
                 * @param {Number} width Width to set for the rectangle                
				 * @param {Number} height Height to set for the rectangle
                 * @returns True if the size has been set for the rectangle and false if an error condition was met
                 */
                setSize: function (width, height) {
                        if (!isNaN(width) && typeof width === 'number' && width >= 0 && width !== Infinity && !isNaN(height) && typeof height === 'number' && height >= 0 && height !== Infinity) {
                                this.width = width;
                                this.height = height;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
				
				 /**
                 * Set the bounds of the rectangle
				 * @param {Number} x X to set for the rectangle
                 * @param {Number} y Y to set for the rectangle
                 * @param {Number} width Width to set for the rectangle
				 * @param {Number} height Height to set for the rectangle
                 * @returns True if the size has been set for the rectangle and false if an error condition was met
                 */
                setBounds: function (x, y, width, height) {
                        if (!isNaN(width) && typeof width === 'number' && width >= 0 && width !== Infinity && !isNaN(height) && typeof height === 'number' && height >= 0 && height !== Infinity &&
							!isNaN(x) && typeof x === 'number' && x >= 0 && x !== Infinity && !isNaN(y) && typeof y === 'number' && y >= 0 && y !== Infinity ) {
                                this.width = width;
                                this.height = height;
								this.x = x;
								this.y = y;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
				
                /**
                 * Set the X and Y coordinates of the rectangle
                 * @param {Number} x X coordinate to set for the rectangle
                 * @param {Number} y Y coordinate to set for the rectangle
                 * @returns True if the location has been set for the rectangle and false if an error condition was met
                 */
                setLocation: function (x, y) {
                        if (!isNaN(x) && typeof x === 'number' && x >= 0 && x !== Infinity && !isNaN(y) && typeof y === 'number'  && y >= 0 && y !== Infinity) {
                                this.y = y;
                                this.x = x;
                                return true;
                        }
                        else {
                                return false;
                        }
                },
                /**
                 * Get the center point of the rectangle
                 * @returns Object literal with x & y properties containing the coordinates of the center point of the rectangle
                 */
                getCenter: function () {
                        return {
                                x: this.x + (this.width / 2),
                                y: this.y + (this.height / 2)
                        };
                },
                /**
                 * Determine if a given set of coordinates fall withing the rectangle
                 * @param {Number} x X coordinate
                 * @param {Object} x Object literal with x and y
                 * @param {Number} y Y coordinate
                 * @returns True if coordinates fall within rectangle and false if they fall outside of the rectangle
                 */
                contains: function (x, y) {
                        if (x.x && x.y) { /* Accept JSON */
                                y = x.y;
                                x = x.x;
                        }
                        if (x <= this.x || y <= this.y || y >= this.y + this.height || x >= this.x + this.width) {
                                return false;
                        }
                        else {
                                return true;
                        }
                },
                /**
                 * Determine if a given X coordinate falls within the rectangle
                 * @param {Number} x X coordinate
                 * @returns True if coordinates fall within rectangle and false if they fall outside of the rectangle
                 */
                containsX: function (x) {
                        if (x < this.x || x > this.x + this.width) {
                                return false;
                        }
                        else {
                                return true;
                        }
                },
                /**
                 * Determine if a given Y coordinate falls within the rectangle
                 * @param {Number} y Y coordinate
                 * @returns True if coordinates fall within rectangle and false if they fall outside of the rectangle
                 */
                containsY: function (y) {
                        if (y < this.y || y > this.y + this.height) {
                                return false;
                        }
                        else {
                                return true;
                        }
                },
				
				/**
				 * If the rectangle contains another rectangle
				 * will return true if two rectangle are equal
				 */
				containsRect: function (rect){
					if (rect.x >= this.x && rect.x + rect.width <= this.x + this.width &&  rect.y >= this.y && rect.y + rect.height <= this.y + this.height) {
                        return true;
                    }
					else
						return false;
				},
				
				/**ADDED function
				 * Add a point to the rectangle, possibly enlarged by external point
				 */
				add: function(x,y){
					if(x < this.x){
						this.x = x;
					}
				
					else if(x > this.x + this.width){
						this.width = x - this.x;
					}
				
					if(y < this.y){
						this.y = y;
					}
					
					else if(y > this.y + this.height){
						this.height = y - this.y;
					}
					
					
				},
				
				/**ADDED function
				 * Add a rectangle to the rectangle, possibly enlarged
				 */
				addRect: function(rect){
					var xRect = rect.x;
					var yRect = rect.y;
					var widthRect = rect.width;
					var heightRect = rect.height;					
				
					if(xRect < this.x){
						this.x = xRect;
					}
				
					if(xRect + widthRect > this.x + this.width){
						this.width = xRect + widthRect - Math.min(this.x, xRect);
					}
				
					if(yRect < this.y){
						this.y = yRect;
					}
					
					if(yRect + heightRect > this.y + this.height){
						this.height = yRect + heightRect - Math.min(this.y, yRect);
					}
					
					
				},
				
				/**ADDED function
				 * Tests if the given rectangle intersects with this rectangle
				 */
				interests: function(rect){
					var x = rect.x;
					var y = rect.y;
					var width = rect.width;
					var height = rect.height;

					if(this.contains(x,y) || this.contains(x + width, y) ||this.contains(x + width, y) ||this.contains(x + width, y + height))
						return true;
							
					else 
						return false;
					
				},
				
                /**
                 * Returns a string representing the rectangle
                 * @returns {String} representing the rectangle
                 */
                toString: function () {
                        return "{height: " + this.height + ", width: " + this.width + ", x: " + this.x + ", y: " + this.y + "}";
                }
};

