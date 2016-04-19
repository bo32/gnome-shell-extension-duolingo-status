/* From http://blog.tompawlak.org/number-currency-formatting-javascript
10000 -> 10.000 */
function formatThousandNumber(num) {
	return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") // use . as a separator
}
