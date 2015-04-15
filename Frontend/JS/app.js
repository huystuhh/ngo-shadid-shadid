var renderer, camera, scene, element;
var point;
var aspectRatio, windowHalf;
var object;
var riftCamera;
var usingRift = false;
var goLeft = false;
var goRight = false;
var goUp = false;
var goDown = false;
var rotationx = rotationy = rotationz = 0;   
var _q1 = new THREE.Quaternion(); 
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
					console.log(file);
				});
			}
}});

function riftify() {
	window.open("../../OculusConnection/ConnectionTest/connection.html");
}

function onResize() 
{
	if(!usingRift)
	{
		windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
		aspectRatio = window.innerWidth / window.innerHeight;
		camera.aspect = aspectRatio;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}//end of if
	else 
	{
		riftCamera.setSize(window.innerWidth, window.innerHeight);
	}//end of else
}//end of onResize

function animate()
{
	requestAnimationFrame(animate);
	render();
}//end of animate

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
function init()
{
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

	//initialize the object.
	object = new THREE.Object3D();
	var axes = new THREE.AxisHelper();
	object.add(axes);
	
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
	window.addEventListener('resize', onResize, false);
	
	//button for rift camera
	//document.getElementById("toggle-render").addEventListener("click", function(){
	//	usingRift = !usingRift;
	//	onResize();
	//});
		
	//initialze the scene
	windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
	aspectRatio = window.innerWidth / window.innerHeight;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 10000);
	camera.position.set(120, 160, 120);
	camera.lookAt(scene.position);
	
	// Initialize the renderer
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setClearColor(0x161616);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth, window.innerHeight);
	element = document.getElementById('viewport');
	element.appendChild(renderer.domElement);
	
	//Let there be Light.
	point = new THREE.DirectionalLight( 0xffffff, 1, 0, Math.PI, 1 );
	point.position.set( -250, 250, 150 );
	scene.add(point);
	
	//create object
	var material = new THREE.MeshLambertMaterial({ color: 0x29d6e1, emissive:0x297d67});
	var manager = new THREE.LoadingManager();
	var loader = new THREE.OBJLoader(manager);
	loader.load(localStorage.getItem("obj"), function(obj)
			{
				object.add(obj)
				scene.add(object);
				
			}, onProgress, onError);
	
	
	riftCamera = new THREE.OculusRiftEffect(renderer);
	usingRift = !usingRift;
	onResize();
}//end of init

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
}//end of keyDown

function keyUp()
{
	goLeft = false;
	goRight = false;
	goUp = false;
	goDown = false;
}//end of keyUp
