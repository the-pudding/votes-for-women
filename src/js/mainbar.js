const $header = d3.select('header');
const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $sidebar = $main.select('.sidebar');
const $graphic = $mainbar.select('.section__graphic');
const $platforms = $graphic.select('.graphic__platforms');
const $tooltip = $graphic.select('.tooltip');

let $year = null;
let $party = null;
let $figure = null;

let platformData = [];
let yearData = [];
let issueData = [];

let headerH = 0;
let wordTotalMax = 0;
let offX = 0;

function handleMouseMove() {}

function handleMouseLeave() {
	$tooltip.classed('is-visible', false);
}

function handlGrafEnter(d) {
	const { left, top } = d3
		.select(this)
		.node()
		.getBoundingClientRect();
	const max = 200;
	if (d.issue) {
		const { start, end, excerpt, text } = d.issue;
		const diff = end - start;
		const pad = diff < max ? Math.floor((max - diff) / 2) : 0;
		const startPad = Math.max(0, start - pad);
		const endPad = Math.max(text.length, end + pad);
		const sub = text.substring(startPad, endPad);
		// clean break
		const startClean = startPad ? sub.indexOf(' ') : 0;
		const endClean =
			endPad !== text.length ? sub.lastIndexOf(' ') : text.length;
		const clean = sub.substring(startClean, endClean);

		const before = clean.substring(0, start - startPad);
		const between = clean.substring(start - startPad, start - startPad + diff);
		const after = clean.substring(start - startPad + diff, clean.length);

		const eBefore = startClean ? '...' : '';
		const eAfter = endClean !== text.length ? '...' : '';
		const html = `“${eBefore}${before}<mark>${between}</mark>${after}${eAfter}”`;
		console.log({
			excerpt,
			endClean,
			startClean,
			clean,
			diff,
			pad,
			start,
			startPad,
			end,
			endPad,
			sub,
			before,
			between,
			after
		});
		$tooltip.select('p').html(html);
		$tooltip.st({ left, top: top - headerH }).classed('is-visible', true);
	}
}

function updateFigure(figureH) {
	const grafM = 1;
	const grafH = 3;
	const count = Math.floor(figureH / grafH);

	const $graf = $figure
		.select('.grafs')
		.selectAll('.graf')
		.data(d => {
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
		.st('border-bottom', `${grafM}px solid #fff`)
		.classed('is-issue', d => d.issue)
		.on('mouseenter', handlGrafEnter);

	$graf.exit().remove();
}

function resize() {
	headerH = $header.node().offsetHeight;
	const height = window.innerHeight - headerH;
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
	$figure
		.append('div.grafs')
		.on('mousemove', handleMouseMove)
		.on('mouseleave', handleMouseLeave);

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
