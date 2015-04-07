$(document).ready(function(){
	Dropzone.options.myAwesomeDropzone = { // The camelized version of the ID of the form element
			url: "upload.php",	// Upload.php file stored on the web server, don't change
			paramName: "userfile", // must be named this, don't change
			maxFiles: 1, // Only want the user to riftify one thing at a time
			maxFileSize: 2048, //MB = 2 GB
			init: function() {
				this.on("success", function(file) {
					document.getElementById('riftify').style.visibility = "visible";
				});
			}
}});