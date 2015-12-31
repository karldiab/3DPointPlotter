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
var objectArray = [];
//Default point size;
var pointSize = 0.5;
var raycaster;
//Default viewing option variables
var xGrid = true;
var yGrid = false;
var zGrid = false;
var lockGridSize = true;
var axisHelper = false;

// initialization
init();

// animation loop
animate();
/*This function takes in 3D points from the user in a wide variety of formats, inperperates them, and
inputs them into an array to be plotted*/

function addPoint() {
	var subArray = [];
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
	var subArray = new Array();
	while (input.length > 0) {
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
function removePoints(option) {
    switch (option) {
        case 0:
            pointsArray = new Array();
            break;
        case 1:
            console.log(selectedPoint);
            pointsArray.splice(selectedPoint, 1);
            selectedPoint = undefined;
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
        listItem.setAttribute("id", "point" + i);
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
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	changeOptions();
	plotPoints();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    projector = new THREE.Projector();
    mouseVector = new THREE.Vector2();
    window.addEventListener( 'click', mouseSelector, false );
    //window.addEventListener( 'mousemove', mouseHover, false );
}
/*This function is called whenever the user makes a change to the options panel
and makes the change to the appropriate variable, then redraws */
function changeOptions(option) {
    switch (option) {
        case 0:
        if (axisHelper) {
            axisHelper = false;
            document.getElementById("axisHelper").innerHTML = "Show Axis";
        } else {
            axisHelper = true;
            document.getElementById("axisHelper").innerHTML = "Hide Axis";
        }
        break;
        case 1:
        if (lockGridSize) {
            lockGridSize = false;
            document.getElementById("lockGridSize").innerHTML = "Lock Grid Size";
        } else {
            lockGridSize = true;
            document.getElementById("lockGridSize").innerHTML = "Unlock Grid Size";
        }
        break;
        case 2:
        if (xGrid) {
            xGrid = false;
            document.getElementById("xGrid").innerHTML = "Show XZ Grid";
        } else {
            xGrid = true;
            document.getElementById("xGrid").innerHTML = "Hide XZ Grid";
        }
        break;
        case 3:
        if (yGrid) {
            yGrid = false;
            document.getElementById("yGrid").innerHTML = "Show XY Grid";
        } else {
            yGrid = true;
            document.getElementById("yGrid").innerHTML = "Hide XY Grid";
        }
        break;
        case 4:
        if (zGrid) {
            zGrid = false;
            document.getElementById("zGrid").innerHTML = "Show YZ Grid";
        } else {
            zGrid = true;
            document.getElementById("zGrid").innerHTML = "Hide YZ Grid";
        }
        break;
    };
	/*xGrid = document.getElementById("xGrid").checked;
	yGrid = document.getElementById("yGrid").checked;
	zGrid = document.getElementById("zGrid").checked;*/
	//lockGridSize = document.getElementById("lockGridSize").checked;
	//axisHelper = document.getElementById("axisHelper").checked;
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
	cameraPosition.setFromMatrixPosition( camera.matrixWorld );
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
    
    if (typeof selectedPoint !== "undefined" && objectArray.length > selectedPoint) {
        sizeIncrementor += Math.PI/60
        var scaleFactor = (Math.cos(sizeIncrementor))/2 + 2
        objectArray[selectedPoint].scale.set( scaleFactor, scaleFactor, scaleFactor );
    }
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
	for (var i = 0; i < pointsArray.length; i++) {
		var pointGeometry = new THREE.SphereGeometry( pointSize, 8, 8 );
        if (typeof selectedPoint !== "undefined" && selectedPoint === i) {
            objectArray[i] = new THREE.Mesh( pointGeometry, new THREE.MeshBasicMaterial(  { color: 0xff0000 } ));
        } else {
		    objectArray[i] = new THREE.Mesh( pointGeometry, new THREE.MeshBasicMaterial(  { color: 0xffffff } ));
        }
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

function listSelector(event) {
    //if there is already a selected point, deselect it
    if (typeof selectedPoint !== "undefined") {
        pointDeselector(selectedPoint);
    }
    selectedPoint = parseInt(this.options[this.selectedIndex].text);
    selectPoint();
}
/*Takes in the currently selected point and redraws it as red*/
function selectPoint() {
    //global variable is used by animator function to allow selected point's size to fluctuate
    sizeIncrementor = 0;
    //takes in selected point and redraws it as a colored point
    scene.remove(objectArray[selectedPoint]);
    var pointMaterial = new THREE.MeshBasicMaterial(  { color: 0xff0000 } );
    var pointGeometry = new THREE.SphereGeometry( pointSize, 8, 8 );
    objectArray[selectedPoint] = new THREE.Mesh( pointGeometry, pointMaterial );
    objectArray[selectedPoint].position.set(pointsArray[selectedPoint][0], pointsArray[selectedPoint][1], pointsArray[selectedPoint][2]);
    scene.add( objectArray[selectedPoint] );
}
//takes old selected point, if it exists and redraws it as a normal point
function pointDeselector(deselectPoint) {
        scene.remove(objectArray[deselectPoint]);
        var pointMaterial = new THREE.MeshBasicMaterial(  { color: 0xffffff } );
        var pointGeometry = new THREE.SphereGeometry( pointSize, 8, 8 );
        objectArray[deselectPoint] = new THREE.Mesh( pointGeometry, pointMaterial );
        objectArray[deselectPoint].position.set(pointsArray[deselectPoint][0], pointsArray[deselectPoint][1], pointsArray[deselectPoint][2]);
        scene.add( objectArray[deselectPoint] );
}
function mouseSelector(e) {
    e.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objectArray );
    if ( intersects.length > 0 ) {
        //if there is already a selected point, deselect it
        if (typeof selectedPoint !== "undefined") {
            pointDeselector(selectedPoint);
        }
        if (objectArray.indexOf(intersects[ 0 ].object) !== -1) {
            selectedPoint = objectArray.indexOf(intersects[ 0 ].object);
        }
        selectPoint();
        document.getElementById("point" + selectedPoint).setAttribute("selected", "selected");
    }
}
function colorHoverPoint() {
    scene.remove(objectArray[hoverPoint]);
    var pointMaterial = new THREE.MeshBasicMaterial(  { color: 0xffff00 } );
    var pointGeometry = new THREE.SphereGeometry( pointSize, 8, 8 );
    objectArray[hoverPoint] = new THREE.Mesh( pointGeometry, pointMaterial );
    objectArray[hoverPoint].position.set(pointsArray[hoverPoint][0], pointsArray[hoverPoint][1], pointsArray[hoverPoint][2]);
    scene.add( objectArray[hoverPoint] );
}
function mouseHover(e) {
    e.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objectArray );
    if ( intersects.length > 0 ) {
        var tempHoverPoint = objectArray.indexOf(intersects[ 0 ].object);
        if (typeof hoverPoint !== "undefined" && hoverPoint !== tempHoverPoint) {
            console.log("now");
            //pointDeselector(hoverPoint);
        }
        if (typeof selectedPoint === "undefined" || (typeof selectedPoint !== "undefined" && selectedPoint !== tempHoverPoint)) {
            hoverPoint = tempHoverPoint;
            colorHoverPoint();
        }
    } else if (typeof hoverPoint !== "undefined" && (typeof selectedPoint === "undefined" || (typeof selectedPoint !== "undefined" && selectedPoint !== hoverPoint))){
        console.log(hoverPoint);
        pointDeselector(hoverPoint);
    }
    /*if ( intersects.length > 0) {
        var newHoverPoint = objectArray.indexOf(intersects[ 0 ].object);
    } else {
        var newHoverPoint = -1;
    }
    if (newHoverPoint !== -1 && (typeof selectedPoint === "undefined" ||(typeof selectedPoint !== "undefined" && newHoverPoint !== selectedPoint))) {
            if (typeof hoverPoint !== "undefined" && newHoverPoint !== hoverPoint) {
                pointDeselector(hoverPoint);
            }
            if (typeof selectedPoint === "undefined" || hoverPoint !== selectedPoint) {
                console.log('hi');
                hoverPoint = newHoverPoint;
                colorHoverPoint();
            }
        } else if (typeof hoverPoint !== "undefined" || typeof selectedPoint !== "undefined" && hoverPoint !== selectedPoint) {
            pointDeselector(hoverPoint);
        }*/
     
}