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

$(document).ready(function(){
	Dropzone.options.myAwesomeDropzone = { // The camelized version of the ID of the form element
			url: "upload.php",	// Upload.php file stored on the web server, don't change
			paramName: "userfile", // must be named this, don't change
			maxFiles: 1, // Only want the user to riftify one thing at a time
			maxFileSize: 2048, //MB = 2 GB
			init: function() {
				this.on("success", function(file) {
					document.getElementById('riftify').style.display = "inline-block";
					localStorage.setItem("obj", file);
					riftify(file);
					console.log(file);
				});
			}
}});

$(function(){
	$("#riftify, #modal-background, #modal-close").click(function () {
		$("#modal-content,#modal-background").toggleClass("active");
	});
});

function riftify(var file) {
	$("#modal-content,#modal-background").toggleClass("active");
	init(file);
	animate();
	//window.open("../../OculusConnection/ConnectionTest/connection.html");
}

function initScene() {
	clock = new THREE.Clock();
	mouse = new THREE.Vector2(0, 0);
	windowHalf = new THREE.Vector2( $("#modal-content").width() / 2, $("#modal-content").height() / 2);
	aspectRatio = $("#modal-content").width() / $("#modal-content").height();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 2000);
	camera.position.z = 25;
	camera.lookAt(scene.position);
	// Initialize the renderer
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setClearColor(0x161616);
	renderer.setSize($("#modal-content").width(), $("#modal-content").height());
	element = document.getElementById('modal-content');
	element.appendChild(renderer.domElement);
}

function initLights(){
	point = new THREE.DirectionalLight( 0xffeedd );
	point.position.set( 0, 0, 1 );
	scene.add(point);
	
	var ambient = new THREE.AmbientLight( 0x101030 );
	scene.add( ambient );


}
function initGeometry(var file){
	//methods for OBJLoader
	var onProgress = function ( xhr ) 
	{
		if ( xhr.lengthComputable ) 
		{
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) 
	{
	};
	
	var manager = new THREE.LoadingManager();
	var texture = new THREE.Texture(manager);
	var loader = new THREE.ImageLoader( manager );
	var material = new THREE.MeshLambertMaterial({ color: 0x29d6e1, emissive:0x297d67});
	
	var loader = new THREE.OBJLoader(manager);
	loader.load(file, function(obj)
			{
				obj.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
						child.material.map = texture;
					}
				} );
				object.add(obj);
				scene.add(object);
			}, onProgress, onError);
	
}

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
			if(goLeft)
				object.rotateOnAxis(axisZ, 0.08);
			if(goRight)
				object.rotateOnAxis(axisZ, -0.08);
			if(goUp)
				object.rotateOnAxis(axisX, 0.08);
			if(goDown)
				object.rotateOnAxis(axisX, -0.08);
			riftCamera.render(scene, camera);
		}
		else
		{
			if(goLeft)
				object.rotateOnAxis(axisZ, 0.08);
			if(goRight)
				object.rotateOnAxis(axisZ, -0.08);
			if(goUp)
				object.rotateOnAxis(axisX, 0.08);
			if(goDown)
				object.rotateOnAxis(axisX, -0.08);
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
function init(var file)
{
	//initialize the object.
	object = new THREE.Object3D();
	var axes = new THREE.AxisHelper();
	object.add(axes);
	
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
	window.addEventListener('resize', onResize, false);
	initScene();
	initGeometry(file);
	initLights();
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
	
	oculusBridge.connect();
	
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
