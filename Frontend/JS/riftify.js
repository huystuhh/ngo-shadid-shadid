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
function bridgeConfigUpdated(config){
	console.log("Oculus config updated.");
	riftCamera.setHMD(config);
}
function bridgeAccelerationUpdated(accel) {
	// scale values so 1g = 20 world units
	accelerationIndicator.children[0].position.x = (accel.x * 1.02040816326531) * 2;
	accelerationIndicator.children[1].position.x = (accel.y * 1.02040816326531) * 2;
	accelerationIndicator.children[2].position.x = (accel.z * 1.02040816326531) * 2;
}
function bridgeOrientationUpdated(quat) {
	referenceCube.quaternion.set(quat.x, quat.y, quat.z, quat.w);
}
function bridgeConnected(){
	document.getElementById("logo").className = "";
}
function bridgeDisconnected(){
	document.getElementById("logo").className = "offline";
}
function animate() 
{
	requestAnimationFrame(animate);
	render();
}
function render() {
	try{
		if(usingRift)
		{
			controls.update();
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
	
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
	window.addEventListener('resize', onResize, false);
	//init Scene
	clock = new THREE.Clock();
	mouse = new THREE.Vector2(0, 0);
	windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
	aspectRatio = window.innerWidth / window.innerHeight;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 2000);
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
				document.getElementById("rendering").innerHTML = "Rendering Complete";
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
	point = new THREE.DirectionalLight( 0xffeedd );
	point.position.set( 0, 0, 1 );
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
		onOrientationUpdate : bridgeOrientationUpdated,
		onAccelerationUpdate : bridgeAccelerationUpdated,
		onConfigUpdate : bridgeConfigUpdated,
		onConnect : bridgeConnected,
		onDisconnect : bridgeDisconnected
	});
	
	//oculusBridge.connect();
	
	riftCamera = new THREE.OculusRiftEffect(renderer);
}

function keyDown(event)
{
	if(event.keyCode == 37)
	{
		goLeft = true;
		goRight = false;
	}//end of if
	if(event.keyCode == 39)
	{
		goRight = true;
		goLeft = false;
	}//end of if
	if(event.keyCode ==38)
	{
		goUp = true;
		goDown = false;
	}//end if
	if(event.keyCode == 40)
	{
		goDown = true;
		goUp = false;
	}//end if
}

function keyUp()
{
	goLeft = false;
	goRight = false;
	goUp = false;
	goDown = false;
}//end of keyUp

window.onload = function() {
	$('#myModal').modal('toggle');
	init();
	animate();
}
