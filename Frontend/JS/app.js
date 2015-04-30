$(document).ready(function(){
	Dropzone.options.myAwesomeDropzone = { // The camelized version of the ID of the form element
			url: "upload.php",	// Upload.php file stored on the web server, don't change
			paramName: "userfile", // must be named this, don't change
			maxFiles: 1, // Only want the user to riftify one thing at a time
			maxFileSize: 250, //MB
			acceptedFiles: ".obj,.stl",
			init: function() {
				this.on("success", function(file) {
					document.getElementById('riftify').style.display = "inline-block";
					sessionStorage.setItem("name", file.name);
				});
			}
}});

function riftify() {
	window.open("riftify.html");
	document.getElementById('reload').style.display = "inline-block";
}

function reload() {
	window.location.reload(true);
}

$(window).on('load resize', function(){
    $('#viewport').height($(this).height() - 350);
});