/*
	3D Points Plotter
	Author - Karl Diab
 */

//$( document ).ready(function() {	
// standard global variables
var container, scene, camera, renderer, controls, stats;
var clock = new THREE.Clock();
//Hard codes a set of points are sample starter points;
var pointsArray = [[0.000,-7.136,-18.683],[-7.136,-18.683,0.000],[-18.683,0.000,-7.136],[-11.547,-11.547,-11.547],[-11.547,-11.547,11.547],[0.000,-7.136,18.683],[-7.136,18.683,0.000],[-18.683,0.000,7.136],[-11.547,11.547,-11.547],[-11.547,11.547,11.547],[0.000,7.136,-18.683],[7.136,-18.683,0.000],[18.683,0.000,-7.136],[11.547,-11.547,-11.547],[11.547,-11.547,11.547],[0.000,7.136,18.683],[7.136,18.683,0.000],[18.683,0.000,7.136],[11.547,11.547,-11.547],[11.547,11.547,11.547]]
var objectArray = new Array();
//Default point size;
var pointSize = 0.5;

// custom global variables
var cube;

// initialization
init();

// animation loop
animate();
/*This function takes in 3D points from the user in a wide variety of formats, inperperates them, and
inputs them into an array to be plotted*/

function addPoint() {
	var subArray = new Array();
	var xAdd = document.getElementById("xAdd").value;
	subArray.push(xAdd);
	document.getElementById("xAdd").value = "";
	var yAdd = document.getElementById("yAdd").value;
	subArray.push(yAdd);
	document.getElementById("yAdd").value = "";
	var zAdd = document.getElementById("zAdd").value;
	subArray.push(zAdd);
	document.getElementById("zAdd").value = "";

	pointsArray.push(subArray);
	outputPoints();
	plotPoints();
	
}

function enterPoints(option) {
	if (option == 0) {
		pointsArray = new Array();
	}
	var input = document.getElementById("pointsInput").value;
	//document.getElementById("pointsOutput").innerHTML = document.getElementById("pointsOutput").value + input;
	var subArray = new Array();
	//document.getElementById("pointsOutput").innerHTML = document.getElementById("pointsOutput").value + "\n" + input.length;
	while (input.length > 0) {
		//document.getElementById("pointsOutput").innerHTML = document.getElementById("pointsOutput").value + "\n" + input.length;
		while (input.length > 0 && isNaN(input.charAt(0)) && input.charAt(0) !== '-' && input.charAt(0) !== '.') {
			input = input.substr(1);
			
		}
		var numberHolder = "";
		while (input.length > 0 && (input.charAt(0) === '-' || input.charAt(0) === '.' || !isNaN(input.charAt(0)))) {
			numberHolder += "" + input.charAt(0);
			input = input.substr(1);
			
		}
		var parsedValue = parseFloat(numberHolder);
		subArray.push(parsedValue);
		if (subArray.length == 3) {
			pointsArray.push(subArray);
			subArray = new Array();
			
		}
	}
	
	outputPoints();
	plotPoints();
	

}
function outputPoints() {
	var outputPanel = document.getElementById("pointsOutput");
	outputPanel.innerHTML = "";
	for (var i = 0; i < pointsArray.length; i++) {
		var singlePoint = i + " [" + pointsArray[i] + "]";
		var listItem = document.createElement("option");
		var node = document.createTextNode(singlePoint);
		listItem.appendChild(node);
		outputPanel.appendChild(listItem);
	}

}
function init() 
{

	scene = new THREE.Scene();
	// set the view size in pixels (custom or according to window size)
	// var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;	
	// camera attributes
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	// set up camera
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	// add the camera to the scene
	scene.add(camera);

	camera.position.set(0,150,100);


	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	THREEx.WindowResize(renderer, camera);
	//THREEx.WindowResize(renderer, camera);
	// toggle full-screen on given key press
	//THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	controls = new THREE.OrbitControls( camera, renderer.domElement );


	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// scene.add(skyBox);
	
	// fog must be added to scene before first render
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	changeOptions();
	plotPoints();
	//createGrids();
	
}
/*This function is called whenever the user makes a change to the options panel
and makes the change to the appropriate variable, then redraws */
function changeOptions() {
	xGrid = document.getElementById("xGrid").checked;
	yGrid = document.getElementById("yGrid").checked;
	zGrid = document.getElementById("zGrid").checked;
	lockGridSize = document.getElementById("lockGridSize").checked;
	axisHelper = document.getElementById("axisHelper").checked;
	incrementValue = document.getElementById("incrementValue").value;
	var currentPointSize = pointSize;
	pointSize = document.getElementById("pointSize").value;
	//Only redraws all the points if the pointSize has been changed to save CPU;
	if (currentPointSize != pointSize) {
		plotPoints();
	}
	document.getElementById("currentGridSize").innerHTML = "Grid Detail: " + incrementValue;
	document.getElementById("currentPointSize").innerHTML = "Point Size: " + pointSize;
	
	createGrids();
	toggleAxes();
	
	
	
	
}
function createGrids() {
	if (typeof cameraDistance === 'undefined') {
		cameraDistance = 150;
	}
	cameraPosition = new THREE.Vector3();
	cameraPosition.getPositionFromMatrix( camera.matrixWorld );
	//alert(cameraPosition.x + ',' + cameraPosition.y + ',' + cameraPosition.z);
	if (!lockGridSize) {
		cameraDistance = Math.sqrt(cameraPosition.x * cameraPosition.x + cameraPosition.y * cameraPosition.y + cameraPosition.z * cameraPosition.z);
	}

	if (typeof axes !== 'undefined') {
		scene.remove(axes);
		scene.remove(gridXZ);
		scene.remove(gridXY);
		scene.remove(gridYZ);
	}
	axes = new THREE.AxisHelper(cameraDistance === 0 ? 150 : cameraDistance);
	gridXZ = new THREE.GridHelper(cameraDistance, cameraDistance/incrementValue);
	gridXY = new THREE.GridHelper(cameraDistance, cameraDistance/incrementValue);
	gridXY.rotation.x = Math.PI/2;
	gridYZ = new THREE.GridHelper(cameraDistance, cameraDistance/incrementValue);
	gridYZ.rotation.z = Math.PI/2;
	

}
//Adds or removes grid and axis helper when called
function toggleAxes() {
	if (typeof axes !== 'undefined') {
		//axis pointers
		if (axisHelper) {
			scene.add( axes );
		} else {
			scene.remove(axes);
		}
	
		//grid helpers
		if (xGrid) {
			scene.add(gridXZ);
		} else {
			scene.remove(gridXZ);
		}
		if (yGrid) {
			scene.add(gridXY);
		} else {
			scene.remove(gridXY);
		}
		if (zGrid) {
			scene.add(gridYZ);
		} else {
			scene.remove(gridYZ);
		}
	}
}
//Sample points generator
function samplePoints(sampleNumber) {
	switch(sampleNumber) {
		//Draws points of a cube
		case 0: 
			pointsArray = [[-10,-10,-10],[-10,-10,10],[-10,10,10],[-10,10,-10],[10,-10,-10],[10,-10,10],[10,10,-10],[10,10,10]];
			plotPoints();
			break;
		//Draws points for a dodecahedron
		case 1:
			pointsArray = [[0.000,-7.136,-18.683],[-7.136,-18.683,0.000],[-18.683,0.000,-7.136],[-11.547,-11.547,-11.547],[-11.547,-11.547,11.547],[0.000,-7.136,18.683],[-7.136,18.683,0.000],[-18.683,0.000,7.136],[-11.547,11.547,-11.547],[-11.547,11.547,11.547],[0.000,7.136,-18.683],[7.136,-18.683,0.000],[18.683,0.000,-7.136],[11.547,-11.547,-11.547],[11.547,-11.547,11.547],[0.000,7.136,18.683],[7.136,18.683,0.000],[18.683,0.000,7.136],[11.547,11.547,-11.547],[11.547,11.547,11.547]];
			plotPoints();
			break;
		//To draw a random scatter plot
		case 2:
			pointsArray = new Array();
			//Number of points to plot is decided by camera distance, but kept at a reasonable number
			var howManyPoints = cameraDistance < 100? 100 : cameraDistance;
			howManyPoints = howManyPoints > 2000? 2000 : howManyPoints;
			for (var i = 0; i < 100;i++) {
				var tempArray = new Array();
				tempArray[0] = (Math.random()*cameraDistance - cameraDistance/2).toFixed(3);
				tempArray[1] = (Math.random()*cameraDistance - cameraDistance/2).toFixed(3);
				tempArray[2] = (Math.random()*cameraDistance - cameraDistance/2).toFixed(3);
				pointsArray.push(tempArray);
			}
			plotPoints();
			break;
	}
}
function animate() 
{
    requestAnimationFrame( animate );
	createGrids();
	toggleAxes();
	render();		
	update();
}

function update()
{
	controls.update();
}

function render() 
{	
	renderer.render( scene, camera );
}
function plotPoints() { 
	//remove old objects
	for (var i = 0; i < objectArray.length; i++) {
		scene.remove(objectArray[i]);
	}
	objectArray = new Array();
	//alert(typeof objectArray);
	var cubeMaterial = new THREE.MeshBasicMaterial(  { color: 0x000000 } );
	for (var i = 0; i < pointsArray.length; i++) {
		var cubeGeometry = new THREE.CubeGeometry( pointSize, pointSize, pointSize);
		// using THREE.MeshFaceMaterial() in the constructor below
		//   causes the mesh to use the materials stored in the geometry
		objectArray[i] = new THREE.Mesh( cubeGeometry, cubeMaterial );
		objectArray[i].position.set(pointsArray[i][0], pointsArray[i][1], pointsArray[i][2]);
		scene.add( objectArray[i] );	
	};
	outputPoints();
};
function autoZoom() {
	var minX, maxX, minY, maxY, minZ, maxZ;
	for (var i = 0; i < pointsArray.length; i++) {
		if (typeof minX === "undefined" || pointsArray[i][0] < minX) {
			minX = pointsArray[i][0];
		}
		if (typeof maxX === "undefined" || pointsArray[i][0] > maxX) {
			maxX = pointsArray[i][0];
		}
		if (typeof minY === "undefined" || pointsArray[i][1] < minY) {
			minY = pointsArray[i][1];
		}
		if (typeof maxY === "undefined" || pointsArray[i][1] > maxY) {
			maxY = pointsArray[i][1];
		}
		if (typeof minZ === "undefined" || pointsArray[i][2] < minZ) {
			minZ = pointsArray[i][2];
		}
		if (typeof maxZ === "undefined" || pointsArray[i][2] > maxZ) {
			maxZ = pointsArray[i][2];
		}
	}
	camera.position.set(100,0,100);
}