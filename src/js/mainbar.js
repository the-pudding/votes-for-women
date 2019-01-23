const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');

let yearData = [];
let issueData = [];

function resize() {
	const height = window.innerHeight;
	$mainbar.st({ height });
}

function cleanYears(data) {
	return d3
		.nest()
		.key(d => d.year)
		.entries(data)
		.map(d => ({
			...d,
			values: d.values.map(v => ({
				...v,
				grafTotal: +v.grafTotal,
				grafWomen: +v.grafWomen,
				wordTotal: +v.wordTotal,
				wordWomen: +v.wordWomen,
				percentWord: +v.percentWord
			}))
		}));
}

function cleanIssue(data) {
	return data.map(d => ({
		...d,
		id: +d.id,
		start: +d.start,
		end: +d.end
	}));
}

function loadData() {
	d3.loadData(
		'assets/data/platforms.csv',
		'assets/data/issues.json',
		(err, response) => {
			if (err) console.log(err);
			yearData = cleanYears(response[0]);
			issueData = cleanIssue(response[1]);
			console.log({ yearData, issueData });
		}
	);
}

function init() {
	loadData();
	resize();
}

export default { init, resize };
