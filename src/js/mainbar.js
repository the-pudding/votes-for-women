const $header = d3.select('header');
const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $sidebar = $main.select('.sidebar');
const $graphic = $mainbar.select('.section__graphic');
const $platforms = $graphic.select('.graphic__platforms');

let $year = null;
let $party = null;
let $figure = null;

let platformData = [];
let yearData = [];
let issueData = [];

let wordTotalMax = 0;
let offX = 0;

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

	const $visibleYear = $platforms.select('.year:not(.is-hidden)');

	const yearH = $visibleYear.node().offsetHeight;
	const infoH = $platforms.select('.info').node().offsetHeight;
	const figureH = yearH - infoH;
	$figure.st('height', figureH);

	const yearMargin = +$visibleYear.st('margin-left').replace('px', '');
	offX = $sidebar.node().offsetWidth + yearMargin;
	updateFigure(figureH);
}

function getNextPos(dir) {
	const width = $graphic.node().offsetWidth - offX;
	const output = [];
	$platforms.selectAll('.year:not(.is-hidden)').each((d, i, n) => {
		let { left } = n[i].getBoundingClientRect();
		left -= offX;
		const offLeft = left - width; // how far from right edge of screen
		const offRight = left + width;
		output.push({ i, left, offLeft, offRight });
	});
	// forward
	if (dir === 1) {
		output.reverse();
		const { left } = output.find(d => d.offLeft < 0);
		return -left;
	}
	// back
	const { left } = output.find(d => d.offRight > 0);
	return -left;
}

function handleNavClick() {
	const dir = +d3.select(this).at('data-dir');
	const x = +$platforms.st('left').replace('px', '');
	const nextPos = getNextPos(dir);
	const left = x + nextPos;
	$platforms.st({ left });
}

function setupNav() {
	$mainbar.selectAll('.graphic__nav button').on('click', handleNavClick);
}

function setupFigure() {
	$year = $platforms
		.selectAll('.year')
		.data(yearData)
		.enter()
		.append('div.year');

	$year.at('data-year', d => d.key).classed('is-hidden', d => +d.key < 1920);

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
			setupNav();
			setupFigure();
			resize();
		}
	);
}

function init() {
	loadData();
}

export default { init, resize };
