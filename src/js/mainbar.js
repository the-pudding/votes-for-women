const $header = d3.select('header');
const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $sidebar = $main.select('.sidebar');
const $graphic = $mainbar.select('.section__graphic');
const $platforms = $graphic.select('.graphic__platforms');
const $tooltip = $graphic.select('.tooltip');

const GRAF_M = 1;
const GRAF_H = 3;
const BP = 768;
const BPD = 1048;
const REM = 16;
const TOOLTIP_WIDTH = $tooltip.node().offsetWidth + REM;
const linkSVG =
	'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#61507b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';

let $year = null;
let $party = null;
let $figure = null;

let platformData = [];
let yearData = [];
let issueData = [];

let headerH = 0;
let wordTotalMax = 0;
let offX = 0;
let mainWidth = 0;
let mobileSlide = false;

function handleMouseMove() {
	const [x, y] = d3.mouse(this);
	const $grafs = d3.select(this);
	const $graf = $grafs.selectAll('.graf');
	const count = $graf.size() - 1;
	const index = Math.min(Math.max(0, Math.floor(y / (GRAF_H + GRAF_M))), count);
	$graf
		.filter((d, i) => i === index)
		.each((d, i, n) => {
			handleGrafEnter.call(n[i], d);
		});
}

function handleMouseLeave() {
	d3.select(this)
		.selectAll('.graf')
		.classed('is-active', false);
	$tooltip.classed('is-visible', false);
}

function handleGrafEnter(d) {
	const $el = d3.select(this);
	const { left, top } = $el.node().getBoundingClientRect();
	const max = 200;
	$el
		.parent()
		.selectAll('.graf')
		.classed('is-active', false);
	$el.classed('is-active', true);

	if (d.issue) {
		// d3.selectAll('.graf').classed('is-disable', v => v.index === d.index);
		const { start, end, text } = d.issue;
		const diff = end - start;

		// add padding of text to before and after excerpt
		const pad = diff < max ? Math.floor((max - diff) / 2) : 0;
		const startPad = Math.max(0, start - pad);
		const endPad = Math.max(text.length, end + pad);
		const textPad = text.substring(startPad, endPad);

		// find spaces before and after excerpt to have clean break on words
		const startClean = startPad ? textPad.indexOf(' ') : 0;
		const endClean =
			endPad < text.length ? textPad.lastIndexOf(' ') : text.length;
		const textClean = textPad.substring(startClean, endClean);

		const beforeStop = startPad ? pad - startClean : start;
		const afterStart = beforeStop + diff + 1;
		const before = textClean.substring(0, beforeStop);
		const between = textClean.substring(beforeStop, afterStart);
		const after = textClean.substring(afterStart, textClean.length);

		const eBefore = startClean ? '...' : '';
		const eAfter = endClean !== text.length ? '...' : '';

		const qBefore = eBefore.length || before.length ? '“' : '<mark>“</mark>';
		const qAfter = eAfter.length || after.length ? '”' : '<mark>”</mark>';

		const html = `${qBefore}${eBefore}${before}<mark>${between}</mark>${after}${eAfter}${qAfter}`;

		const delta = left + TOOLTIP_WIDTH - mainWidth;
		const offset = delta > -REM ? delta + REM : 0;
		const x = left - offset;

		$tooltip.select('p').html(html);
		$tooltip
			.st({ left: x, top: top - headerH })
			.classed('is-visible', true)
			.classed('is-highlight', $el.classed('is-highlight'));
	} else {
		$tooltip.classed('is-visible', false);
	}
}

function updateFigure(figureH) {
	const count = Math.floor(figureH / GRAF_H);

	const $graf = $figure
		.select('.grafs')
		.selectAll('.graf')
		.data(d => {
			const numLines = Math.max(
				1,
				Math.floor((d.wordTotal / wordTotalMax) * count)
			);
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

	const $GRAF_Merge = $grafEnter.merge($graf);

	$GRAF_Merge
		.st('height', GRAF_H)
		.st('margin-bottom', GRAF_M)
		// .st('border-bottom', `${GRAF_M}px solid #fff`)
		.classed('is-issue', d => d.issue);

	$graf.exit().remove();
}

function sortBy(value) {
	if (value === 'Percent women')
		$year.sort((a, b) => d3.descending(a.wordWomen, b.wordWomen));
	else $year.sort((a, b) => d3.ascending(a.year, b.year));
	$platforms.st({ left: 0 });
}

function containsIssue(arr, issue) {
	if (!arr.length) return false;
	if (!issue) return false;
	return !!issue.find(i => arr.includes(i));
}

function filterBy({ party, issues, years }) {
	const partyVals = Object.keys(party)
		.filter(d => party[d])
		.map(d => d);

	const issuesVals = Object.keys(issues)
		.filter(d => issues[d])
		.map(d => d);

	$year.classed('is-hidden', false);
	$party.classed('is-hidden', false);

	$party.classed('is-hidden', d => {
		const hasParty = partyVals.length ? !!partyVals.includes(d.party) : true;
		const hasIssues = issuesVals.length
			? !!d.issues.find(v => containsIssue(issuesVals, v.issue))
			: true;
		return !hasParty || !hasIssues;
	});

	$year.classed('is-hidden', d => {
		const hasYear = d.year >= years.start && d.year <= years.end;

		const hasParty = partyVals.length
			? !!d.values.find(v => partyVals.includes(v.party))
			: true;

		const hasIssues = issuesVals.length
			? !!d.values.find(
				v => !!v.issues.find(i => containsIssue(issuesVals, i.issue))
			  )
			: true;
		return !hasParty || !hasIssues || !hasYear;
	});

	$year
		.selectAll('.party:not(.is-hidden)')
		.selectAll('.graf')
		.classed('is-highlight', d => {
			if (d.issue) return containsIssue(issuesVals, d.issue.issue);
			return false;
		});

	$platforms.st({ left: 0 });
}

function toggle(section) {
	const $section = $mainbar.select(`.section__${section}`);
	const hidden = $section.classed('is-hidden');
	$section
		.on('click', () => $section.classed('is-hidden', true))
		.classed('is-hidden', !hidden);
}

function resize() {
	mainWidth = $main.node().offsetWidth;
	headerH = $header.node().offsetHeight;
	const height = window.innerHeight - headerH;
	$mainbar.st({ height });

	mobileSlide = mainWidth < BPD;

	const $visibleYear = $platforms.select('.year:not(.is-hidden)');

	const yearH = $visibleYear.node().offsetHeight;
	const infoH = $platforms.select('.info').node().offsetHeight;
	const figureH = yearH - infoH;
	$figure.st('height', figureH);

	const yearMargin = +$visibleYear.st('margin-left').replace('px', '');
	offX = mainWidth < BP ? 0 : $sidebar.node().offsetWidth + yearMargin;
	updateFigure(figureH);
}

function getNextPos({ dir, x }) {
	// mobile
	if (mobileSlide) {
		const $p = $platforms.select('.year:not(.is-hidden) .party');
		const partyW = $p.node().offsetWidth + REM * 2;
		let count = $platforms.selectAll('.year:not(.is-hidden) .party').size();
		count -= offX ? 0 : 2;

		if (dir === -1 && x >= 0) return 0;
		if (dir === 1 && x < offX + count * partyW * -1) return 0;
		return partyW * dir * -1;
	}

	// desktop
	const width = $graphic.node().offsetWidth - offX;
	const output = [];

	$platforms.selectAll('.year:not(.is-hidden)').each((d, i, n) => {
		let { left } = n[i].getBoundingClientRect();
		left -= offX;
		const offLeft = left - width; // how far from right edge of screen
		const offRight = left + width;
		output.push({ i, left, offLeft, offRight });
	});
	if (dir === 1) {
		output.reverse();
		const { left } = output.filter(d => d.left > 0).pop();
		return -left;
	}
	// back
	const { left } = output.find(d => d.offRight > 0);
	return -left;
}

function handleNavClick() {
	const dir = +d3.select(this).at('data-dir');
	const x = +$platforms.st('left').replace('px', '');
	const nextPos = getNextPos({ dir, x });
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

	$year.at('data-year', d => d.key).classed('is-hidden', d => d.year < 1920);

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
		.on('mousemove touchend', handleMouseMove)
		.on('mouseleave', handleMouseLeave);

	$info.append('p.party-year').text(d => d.year);
	$info.append('p.party-name').text(d => d.party);
	d3.selectAll('.party-name')
		.append('span.doc-link')
		.html(d => `<a href='${d.link}' target='blank'>${linkSVG}</a>`);
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
	return data
		.map(d => ({
			...d,
			id: +d.id,
			percent: getPercent(d),
			start: +d.start,
			end: +d.end,
			issue: d.issue.split('|').map(v => v.trim())
		}))
		.filter(d => d.excerpt.length > 30);
}

function joinData() {
	const withIssues = platformData.map(d => ({
		...d,
		issues: issueData.filter(v => v.title === d.key)
	}));

	const joined = d3
		.nest()
		.key(d => d.year)
		.entries(withIssues);

	return joined.map(d => ({
		...d,
		year: +d.key,
		wordWomen: d3.mean(d.values, v => v.percentWord)
	}));
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

export default { init, resize, sortBy, filterBy, toggle };
