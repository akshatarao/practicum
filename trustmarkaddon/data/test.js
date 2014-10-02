self.port.on("show", function onShow()
{
	self.port.emit("whatsup");
	window.alert("hey");
});

self.port.on("failedtip", function onFailedTIP(tip)
{
	var d = document.getElementsByName(tip);
	d[0].style.background = "red";

});

self.port.on("passedtip", function onPassedTIP(tip)
{
	var d = document.getElementsByName(tip);
	d[0].style.background = "green";
});
