function isToday(date) {
	let today = new Date(new Date().getTime() - 4 * 60 * 60 * 1000);
	let current_day = today.getUTCDate();
	let current_month = today.getUTCMonth();
	let current_year = today.getUTCFullYear();
	return date.getUTCDate() == current_day && date.getUTCMonth() == current_month && date.getUTCFullYear() == current_year;
}
