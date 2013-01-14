exports.sharp = sharp

function sharp (created) {
	var current = new Date();
	var currentYear = current.getUTCFullYear();
	var currentMonth = current.getUTCMonth() + 1;
	var currentDay = current.getUTCDate();
	var createdYear = created.getUTCFullYear();
	var createdMonth = created.getUTCMonth() + 1;
	var createdDay = created.getUTCDate();
	
	console.log();
	return Math.floor((new Date(currentYear, currentMonth, currentDay) - new Date(createdYear, createdMonth, createdDay)) / 86400000);
}