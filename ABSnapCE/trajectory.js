//double
var X_OFFSET = 0.5;
var Y_OFFSET = 0.65;
var BOUND = 0.1;
var STRETCH = 0.4;

//int
var  X_MAX = 640;

// 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70
var _launchAngle = [ 0.13, 0.215, 0.296, 0.381, 0.476,
		0.567, 0.657, 0.741, 0.832, 0.924, 1.014, 1.106, 1.197 ];
var _changeAngle = [ 0.052, 0.057, 0.063, 0.066, 0.056,
		0.054, 0.050, 0.053, 0.042, 0.038, 0.034, 0.029, 0.025 ];
var _launchVelocity = [ 2.9, 2.88, 2.866, 2.838, 2.810,
		2.800, 2.790, 2.773, 2.763, 2.745, 2.74, 2.735, 2.73 ];
		
function trajectoryPlanner(){
	// small modification to the scale and angle
	this.scaleFactor = 1.005;

	// conversion between the trajectory time and actual time in milliseconds
	this.timeUnit = 815;

	// boolean flag on set trajectory
	this.trajSet = false;

	// parameters of the set trajectory
	/*Point*/ this.release = null;
	
	/*double*/
	this.theta = null;
	this.velocity = null; 
	this.ux = null;
	this.uy = null;
	this.a = null;
	this.b = null;

	// the trajectory points
	/*List<Point>*/ this.trajectory = null;

	// reference point and current scale
	/*Point*/ this.ref = null;
	/*double*/this.scale = null;
}
	
	/**
	 * the estimated tap time given the tap point
	 * 
	 * @param sling - bounding box of the slingshot release - point the mouse
	 * clicked was released from tapPoint - point the tap should be made
	 * 
	 * @return tap time (relative to the release time) in milli-seconds
	 */
	trajectoryPlanner.prototype.getTimeByDistance(Rectangle sling, Point release,
			Point tapPoint) {
		// update trajectory parameters
		setTrajectory(sling, release);

		var pullback = this.scale * STRETCH * Math.cos(this.theta);
		var distance = (tapPoint.x - this.ref.x + pullback) / this.scale;

//		System.out.println("distance " + distance);
//		System.out.println("velocity " + this.ux);

		return Math.floor(distance / this.ux * this.timeUnit);
	}

		// find the reference point given the sling
	trajectoryPlanner.prototype.getReferencePoint(/*Rectangle*/ sling) {
		/*Point*/ var p = new Point(Math.floor(sling.x + X_OFFSET * sling.width),
				Math.floor(sling.y + Y_OFFSET * sling.width));
		return p;
	}

	/*
	 * Choose a trajectory by specifying the sling location and release point
	 * Derive all related parameters (angle, velocity, equation of the parabola,
	 * etc)
	 * 
	 * @param sling - bounding rectangle of the slingshot releasePoint - point
	 * where the mouse click was released from
	 */
	trajectoryPlanner.prototype.setTrajectory(/*Rectangle*/ sling, /*Point*/ releasePoint) {
		// don't update parameters if the ref point and release point are the
		// same
		if (this.trajSet && this.ref != null && this.ref.equals(getReferencePoint(sling))
				&& this.release != null && this.release.equals(releasePoint))
			return;

		// set the scene parameters
		this.scale = sling.height + sling.width;
		this.ref = getReferencePoint(sling);

		// set parameters for the trajectory
		this.release = new Point(releasePoint.x, releasePoint.y);

		// find the launch angle
		this.theta = Math.atan2(this.release.y - this.ref.y, this.ref.x - this.release.x);
		this.theta = launchToActual(this.theta);

		// work out initial velocities and coefficients of the parabola
		this.velocity = getVelocity(this.theta);
		this.ux = this.velocity * Math.cos(this.theta);
		this.uy = this.velocity * Math.sin(this.theta);
		this.a = -0.5 / (this.ux * this.ux);
		this.b = this.uy / this.ux;

		// work out points of the trajectory
		this.trajectory = new ArrayList<Point>();
		for (int x = 0; x < X_MAX; x++) {
			double xn = x / this.scale;
			int y = this.ref.y - (int) ((this.a * xn * xn + this.b * xn) * this.scale);
			this.trajectory.add(new Point(x + this.ref.x, y));
		}

		// turn on the setTraj flag
		this.trajSet = true;
	}
	
	/*
	 * Estimate launch points given a desired target point using maximum
	 * velocity If there are two launch point for the target, they are both
	 * returned in the list {lower point, higher point) Note - angles greater
	 * than 75 are not considered
	 * 
	 * @param slingshot - bounding rectangle of the slingshot targetPoint -
	 * coordinates of the target to hit
	 * 
	 * @return A list containing 2 possible release points
	 */
	trajectoryPlanner.prototype.estimateLaunchPoint(/*Rectangle*/ slingshot,
			/*Point*/ targetPoint) {

		// calculate relative position of the target (normalised)
		var scale = getSceneScale(slingshot);
		// System.out.println("scale " + scale);
		/*Point*/ var ref = getReferencePoint(slingshot);

		var x = (targetPoint.x - ref.x) / scale;
		var y = -(targetPoint.y - ref.y) / scale;

		var bestError = 1000;
		var theta1 = 0;
		var theta2 = 0;

		// first estimate launch angle using the projectile equation (constant
		// velocity)
		var v = this.scaleFactor * _launchVelocity[6];
		var v2 = v * v;
		var v4 = v2 * v2;
		var tangent1 = (v2 - Math.sqrt(v4 - (x * x + 2 * y * v2))) / x;
		var tangent2 = (v2 + Math.sqrt(v4 - (x * x + 2 * y * v2))) / x;
		var t1 = actualToLaunch(Math.atan(tangent1));
		var t2 = actualToLaunch(Math.atan(tangent2));

		// search angles in range [t1 - BOUND, t1 + BOUND]
		for (var theta = t1 - BOUND; theta <= t1 + BOUND; theta += 0.001) {
			var velocity = getVelocity(theta);

			// initial velocities
			var u_x = velocity * Math.cos(theta);
			var u_y = velocity * Math.sin(theta);

			// the normalised coefficients
			var a = -0.5 / (u_x * u_x);
			var b = u_y / u_x;

			// the error in y-coordinate
			var error = Math.abs(a * x * x + b * x - y);
			if (error < bestError) {
				theta1 = theta;
				bestError = error;
			}
		}

		bestError = 1000;

		// search angles in range [t2 - BOUND, t2 + BOUND]
		for (var theta = t2 - BOUND; theta <= t2 + BOUND; theta += 0.001) {
			var velocity = getVelocity(theta);

			// initial velocities
			var u_x = velocity * Math.cos(theta);
			var u_y = velocity * Math.sin(theta);

			// the normalised coefficients
			var a = -0.5 / (u_x * u_x);
			var b = u_y / u_x;

			// the error in y-coordinate
			var error = Math.abs(a * x * x + b * x - y);
			if (error < bestError) {
				theta2 = theta;
				bestError = error;
			}
		}

		theta1 = actualToLaunch(theta1);
		theta2 = actualToLaunch(theta2);

		// System.out.println("Two angles: " + Math.toDegrees(theta1) + ", " +
		// Math.toDegrees(theta2));

		// add launch points to the list
		/*ArrayList<Point>*/var pts = new LinkedList();
		pts.add(findReleasePoint(slingshot, theta1));

		// add the higher point if it is below 75 degrees and not same as first
		if (theta2 < Math.toRadians(75) && theta2 != theta1)
			pts.add(findReleasePoint(slingshot, theta2));

		return pts;
	}