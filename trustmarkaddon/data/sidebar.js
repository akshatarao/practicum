addon.port.on("trustmark", function(trustmarkmessage) {
	window.alert(trustmarkmessage);
	addon.port.emit("trustmarksshown");
});
