self.port.on("show", function onShow()
{
	self.port.emit("whatsup");
	window.alert("hey");
});

self.port.on("failedtip", function onFailedTIP(tip)
{
	var d = document.getElementById(tip);
	d.style.background = "red";

});

self.port.on("passedtip", function onPassedTIP(tip)
{
	var d = document.getElementById(tip);
	d.style.background = "green";
});

var minimizationDiv = document.getElementById("minimization");

minimizationDiv.addEventListener("click", function(event)
{
	window.alert("Minimization");
	self.postMessage("minimization");
}, false);

minimizationDiv.addEventListener("mouseover", function(event)
{
	minimizationDiv.style.border = "thin solid black";
}, false);

minimizationDiv.addEventListener("mouseout", function(event)
{
	minimizationDiv.style.border = "";
}, false);

var transparencyDiv = document.getElementById("transparency");
transparencyDiv.addEventListener("click", function(event)
{
        self.postMessage("transparency");
}, false);
