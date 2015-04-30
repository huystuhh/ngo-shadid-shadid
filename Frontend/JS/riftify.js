var renderer, camera, scene, element;
var point;
var aspectRatio, windowHalf;
var object;
var accelerationIndicator;
var oculusBridge;
var usingRift = false;
var riftCamera;
var goLeft = false
var goRight = false
var goUp = false
var goDown = false
var rotationx = rotationy = rotationz = 0    
var axisX = new THREE.Vector3( 1, 0, 0 ); 
var axisZ = new THREE.Vector3( 0, 0, 1 );
var fileLoc = 'Database/';
var controls;

var clock;
var mouse, time;
var bodyAngle;
var bodyAxis;
var bodyPosition;
var viewAngle;
var velocity;

function onResize() {
	if(!usingRift){
		windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
		aspectRatio = window.innerWidth / window.innerHeight;
		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}else {
		riftCamera.setSize(window.innerWidth, window.innerHeight);
	}
	
}
function bridgeConnected(){
  document.getElementById("logo").className = "";
}

function bridgeDisconnected(){
  document.getElementById("logo").className = "offline";
}

function bridgeConfigUpdated(config){
  console.log("Oculus config updated.");
  riftCam.setHMD(config);      
}

function bridgeOrientationUpdated(quatValues) {

  // Do first-person style controls (like the Tuscany demo) using the rift and keyboard.

  // TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

  // make a quaternion for the the body angle rotated about the Y axis.
  var quat = new THREE.Quaternion();
  quat.setFromAxisAngle(bodyAxis, bodyAngle);

  // make a quaternion for the current orientation of the Rift
  var quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

  // multiply the body rotation by the Rift rotation.
  quat.multiply(quatCam);


  // Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
  var xzVector = new THREE.Vector3(0, 0, 1);
  xzVector.applyQuaternion(quat);

  // Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
  // so you can steer with a combination of the keyboard and by moving your head.
  viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI;

  // Apply the combined look/body angle to the camera.
  camera.quaternion.copy(quat);
}
function animate() 
{
	var delta = clock.getDelta();
	time += delta;
  
	updateInput(delta);
	
	requestAnimationFrame(animate);
	render();
}
function render() {
	try{
		if(usingRift)
		{
			riftCamera.render(scene, camera);
		}
		else
		{
			controls.update();
			renderer.render(scene, camera);
		}
	}catch(e){
		console.log(e);
		if(e.name == "SecurityError"){
			crashSecurity(e);
		} else {
			crashOther(e);
		}
		return false;
	}
	return true;
}
function init()
{
	//initialize the object.
	object = new THREE.Object3D();
	var axes = new THREE.AxisHelper();
	object.add(axes);
	
	window.addEventListener('resize', onResize, false);
]
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);
	document.addEventListener('mousedown', onMouseDown, false);
	document.addEventListener('mousemove', onMouseMove, false);
	document.addEventListener( 'mousewheel', onMouseWheel, false );
	document.addEventListener( 'DOMMouseScroll', onMouseWheel, false );
	
	time          = Date.now();
	bodyAngle     = 0;
	bodyAxis      = new THREE.Vector3(0, 1, 0);
	bodyPosition  = new THREE.Vector3(0, 15, 0);
	velocity      = new THREE.Vector3();
	
	//init Scene
	clock = new THREE.Clock();
	mouse = new THREE.Vector2(0, 0);
	windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
	aspectRatio = window.innerWidth / window.innerHeight;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 2000);
	camera.useQuaternion = true;
	camera.position.z = 250;
	camera.lookAt(scene.position);
	// Initialize the renderer
	renderer = new THREE.WebGLRenderer({alpha: true},{antialias:true});
	renderer.setClearColor(0xFFFFFF, 1);
	renderer.setSize(window.innerWidth, window.innerHeight);
	element = document.getElementById('viewport');
	element.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls(camera);
	
	//methods for OBJLoader
	var onProgress = function ( xhr ) 
	{
		if ( xhr.lengthComputable ) 
		{
			var percentComplete = xhr.loaded / xhr.total * 100;
			$('.progress-bar').css('width',percentComplete+'%').attr('aria-valuenow', percentComplete);
			document.getElementById("progress-bar").innerHTML = Math.round(percentComplete, 2) + "%";
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
			
			if(percentComplete == 100) {
				$('.progress-bar').removeClass('active');
				document.getElementById("rendering").innerHTML = "Rendering Complete!";
				document.getElementById("got-it").style.display = "inline-block";
			}
		}
	};
	
	var onError = function ( xhr ) 
	{
	};
	
	var loader = new THREE.ImageLoader( manager );
	var manager = new THREE.LoadingManager();	
	
	var fileName = sessionStorage.getItem("name");
	fileLoc += fileName;
	var ext = fileName.split(".");
	if(ext[ext.length -1].toLowerCase() == "obj")
	{
		var loader = new THREE.OBJLoader(manager);
		loader.load(fileLoc, function(obj)
				{
					
					object.add(obj);
					scene.add(object);
				}, onProgress, onError);
	}//end of if
	else if(ext[ext.length -1].toLowerCase() == "stl")
	{
		var loader = new THREE.STLLoader(manager);
		loader.load(fileLoc, function(stl)
				{
					var mesh = new THREE.Mesh(stl);
					scene.add(mesh);
				}, onProgress, onError);
	}//end of else if
	
	//init Lights
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6);
	hemiLight.color.setHSL(0.6, 1, 0.6);
	hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	hemiLight.position.set(0, 500, 0);
	scene.add(hemiLight);
	
	point = new THREE.DirectionalLight( 0xffeedd, 0.6 );
	point.color.setHSL(0.1, 1, 0.95)
	point.position.set( 0, 10, 0 );
	scene.add(point);
	
	var ambient = new THREE.AmbientLight( 0x101030 );
	scene.add( ambient );
	
	//button for rift camera
	document.getElementById("toggle-render").addEventListener("click", function(){
		usingRift = !usingRift;
		onResize();
	});	
	
	// Create the bridge object and attempt to connect.
	oculusBridge = new OculusBridge({
		"debug"
		"onOrientationUpdate" : bridgeOrientationUpdated,
		"onConfigUpdate" : bridgeConfigUpdated,
		"onConnect" : bridgeConnected,
		"onDisconnect" : bridgeDisconnected
	});
	
	oculusBridge.connect();
	
	riftCamera = new THREE.OculusRiftEffect(renderer);
}

function onMouseMove(event) {
  mouse.set( (event.clientX / window.innerWidth - 0.5) * 2, (event.clientY / window.innerHeight - 0.5) * 2);
}


function onMouseDown(event) {
  // Stub
  //floorTexture.needsUpdate = true;
  console.log("update.");
}


function onKeyDown(event) {

  if(event.keyCode == 48){ // zero key.
    useRift = !useRift;
    onResize();
  }

  // prevent repeat keystrokes.
  if(!keys[32] && (event.keyCode == 32)){ // Spacebar to jump
    velocity.y += 1.9;
  }

  keys[event.keyCode] = true;
}


function onKeyUp(event) {
  keys[event.keyCode] = false;
}

function onMouseWheel( event ) {

	var delta = 0;
	
	if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

		delta = event.wheelDelta;

	} else if ( event.detail ) { // Firefox

		delta = - event.detail;

	}

	if ( delta > 0 ) {

		bodyPosition.y += delta;

	} else {

		bodyPosition.y += delta;

	}

}

function updateInput(delta) {
  
  var step        = 25 * delta;
  var turn_speed  = (55 * delta) * Math.PI / 180;


  // Forward/backward

  if(keys[87] || keys[38]){ // W or UP
      bodyPosition.x += Math.cos(viewAngle) * step;
      bodyPosition.z += Math.sin(viewAngle) * step;
  }

  if(keys[83] || keys[40]){ // S or DOWN
      bodyPosition.x -= Math.cos(viewAngle) * step;
      bodyPosition.z -= Math.sin(viewAngle) * step;
  }

  // Turn

  if(keys[81]){ // E
      bodyAngle += turn_speed;
  }   
  
  if(keys[69]){ // Q
       bodyAngle -= turn_speed;
  }

  // Straif

  if(keys[65] || keys[37]){ // A or LEFT
      bodyPosition.x -= Math.cos(viewAngle + Math.PI/2) * step;
      bodyPosition.z -= Math.sin(viewAngle + Math.PI/2) * step;
  }   
  
  if(keys[68] || keys[39]){ // D or RIGHT
      bodyPosition.x += Math.cos(viewAngle+Math.PI/2) * step;
      bodyPosition.z += Math.sin(viewAngle+Math.PI/2) * step;
  }
  

  // VERY simple gravity/ground plane physics for jumping.
  
 

  // update the camera position when rendering to the oculus rift.
  if(useRift) {
    camera.position.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);
  }
}

window.onload = function() {
	$('#myModal').modal('toggle');
	$('#popoverData').popover();
	init();
	animate();
}

