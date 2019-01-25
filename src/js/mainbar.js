const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $platforms = $mainbar.select('.graphic__platforms');

let platformData = [];
let yearData = [];
let issueData = [];

function resize() {
	const height = window.innerHeight;
	$mainbar.st({ height });
}

function setupFigure() {
	const $year = $platforms
		.selectAll('.year')
		.data(yearData)
		.enter()
		.append('div.year');

	$year.append('h3').text(d => d.key);
	const $parties = $year.append('div.parties');

	const $party = $parties
		.selectAll('.party')
		.data(d => d.values)
		.enter()
		.append('div.party');

	const $info = $party.append('div.info');
	const $figure = $party.append('figure');

	$info.append('p.party-name').text(d => d.party);

	$figure
		.selectAll('.graf')
		.data(d => d3.range(d.grafTotal))
		.enter()
		.append('p.graf');
}

function cleanPlatforms(data) {
	return data.map(d => ({
		...d,
		grafTotal: +d.grafTotal,
		grafWomen: +d.grafWomen,
		wordTotal: +d.wordTotal,
		wordWomen: +d.wordWomen,
		percentWord: +d.percentWord
	}));
}

function getPercent(datum) {
	const { grafTotal } = platformData.find(p => p.key === datum.title);
	return +datum.id / grafTotal;
}

function cleanIssue(data) {
	return data.map(d => ({
		...d,
		id: +d.id,
		percent: getPercent(d),
		start: +d.start,
		end: +d.end
	}));
}

function joinData() {
	const withIssues = platformData.map(d => ({
		...d,
		issues: issueData.filter(v => v.title === d.key)
	}));

	return d3
		.nest()
		.key(d => d.year)
		.entries(withIssues);
}

function loadData() {
	d3.loadData(
		'assets/data/platforms.json',
		'assets/data/issues.json',
		(err, response) => {
			if (err) console.log(err);
			platformData = cleanPlatforms(response[0]);
			issueData = cleanIssue(response[1]);
			yearData = joinData();
			console.log(yearData);
			// setupFigure();
		}
	);
}

function init() {
	loadData();
	resize();
}

export default { init, resize };
