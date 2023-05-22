const tStamppi = () => {
	var d = new Date();
	var datetime = d.toLocaleString()+": "
	return datetime
}
module.exports = tStamppi