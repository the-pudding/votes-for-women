const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $platforms = $mainbar.select('.graphic__platforms');

let yearData = [];
let issueData = [];

function resize() {
	const height = window.innerHeight;
	$mainbar.st({ height });
}

function cleanIssue(data) {
	return data.map(d => ({
		...d,
		id: +d.id,
		start: +d.start,
		end: +d.end
	}));
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

function loadData() {
	d3.loadData(
		'assets/data/platforms.json',
		'assets/data/issues.json',
		(err, response) => {
			if (err) console.log(err);
			yearData = response[0].sort((a, b) => d3.ascending(+a.key, +b.key));
			issueData = cleanIssue(response[1]);
			setupFigure();
		}
	);
}

function init() {
	loadData();
	resize();
}

export default { init, resize };
