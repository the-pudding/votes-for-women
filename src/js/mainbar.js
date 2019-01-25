const $header = d3.select('header');
const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $platforms = $mainbar.select('.graphic__platforms');
let $party = null;
let $figure = null;

let platformData = [];
let yearData = [];
let issueData = [];

let wordTotalMax = 0;

function updateFigure(figureH) {
	const grafM = 1;
	const grafH = 2;
	const count = Math.floor(figureH / (grafH + grafM));

	const $graf = $figure.selectAll('.graf').data(d => {
		const numLines = Math.floor((d.wordTotal / wordTotalMax) * count);
		const lines = d3.range(numLines).map(i => ({ index: i }));
		d.issues.forEach(issue => {
			let target = Math.floor(issue.percent * numLines);
			let placed = false;
			while (!placed) {
				if (!lines[target].issue) {
					lines[target].issue = { ...issue };
					placed = true;
				} else target += 1;

				if (target >= lines.length) {
					lines.push({ index: lines.length });
				}
			}
		});

		return lines;
	});

	const $grafEnter = $graf.enter().append('p.graf');

	const $grafMerge = $grafEnter.merge($graf);

	$grafMerge
		.st('height', grafH)
		.st('margin-bottom', grafM)
		.classed('is-issue', d => d.issue);

	$graf.exit().remove();
}

function resize() {
	const height = window.innerHeight - $header.node().offsetHeight;
	$mainbar.st({ height });
	const yearH = $platforms.select('.year').node().offsetHeight;
	const infoH = $platforms.select('.info').node().offsetHeight;
	const figureH = yearH - infoH;
	$figure.st('height', figureH);
	updateFigure(figureH);
}

function setupFigure() {
	const $year = $platforms
		.selectAll('.year')
		.data(yearData)
		.enter()
		.append('div.year');

	$year.at('data-year', d => d.key);
	$year.append('h3.hed').text(d => d.key);
	const $parties = $year.append('div.parties');

	// store $party global
	$party = $parties
		.selectAll('.party')
		.data(d => d.values)
		.enter()
		.append('div.party');

	$party.at('data-key', d => d.key);

	const $info = $party.append('div.info');

	// store $figure global
	$figure = $party.append('figure');
	$figure.append('div.grafs');

	$info.append('p.party-name').text(d => d.party);
	$info.append('p.candidate').text(d => d.candidate);
	$info
		.append('p.word-total')
		.text(d => `${d3.format(',')(d.wordTotal)} total words`);
	$info
		.append('p.word-women')
		.html(
			d =>
				`<span>${d3.format(',')(d.wordWomen)}</span> word${
					d.wordWomen === 1 ? '' : 's'
				} about women`
		);
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
			wordTotalMax = d3.max(platformData, d => d.wordTotal);
			setupFigure();
			resize();
		}
	);
}

function init() {
	loadData();
}

export default { init, resize };
