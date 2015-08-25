function isToday(date) {
	let today = new Date();
	let current_day = today.getDate();
	let current_month = today.getMonth();
	let current_year = today.getFullYear();
	return date.getDate() == current_day && date.getMonth() == current_month && date.getFullYear() == current_year;
}
