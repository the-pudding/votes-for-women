import noUiSlider from 'nouislider';

const $main = d3.select('main');
const $sidebar = $main.select('.sidebar');
const $slider = $main.select('.slider');
const $btnSort = $sidebar.selectAll('.nav__sort button');
const $btnFilterParty = $sidebar.selectAll('.nav__filter-party button');
const $btnFilterIssues = $sidebar.selectAll('.nav__filter-issues button');

function resize() {}

function handleChange() {
	// isSliding = false;
	console.log('change');
}

function handleSlide(value) {
	console.log('slide', { value });
	// isSliding = true;
	// const [index] = value;
	// if (+index < nestedData.length) {
	// 	currentDay = +index;
	// 	updateChart(true);
	// }
}

function handleSortClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');
	const active = $btn.classed('is-active');
	$btnSort.classed('is-active', false);
	$btn.classed('is-active', !active);
}

function handleFilterPartyClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');
	const active = $btn.classed('is-active');
	$btn.classed('is-active', !active);
}

function handleFilterIssuesClick() {
	const $btn = d3.select(this);
	const value = $btn.at('data-value');
	const active = $btn.classed('is-active');
	$btn.classed('is-active', !active);
}

function setupSlider() {
	const min = 1840;
	const max = 2016;
	const start = [min, max];

	const slider = noUiSlider.create($slider.node(), {
		start,
		step: 4,
		connect: true,
		tooltips: [
			{
				to: value => value
			},
			{
				to: value => value
			}
		],
		range: {
			min,
			max
		}
	});

	slider.on('slide', handleSlide);
	slider.on('change', handleChange);
}

function setupNav() {
	$btnSort.on('click', handleSortClick).classed('is-active', (d, i) => i === 0);
	$btnFilterParty.on('click', handleFilterPartyClick);
	$btnFilterIssues.on('click', handleFilterIssuesClick);
}

function init() {
	setupSlider();
	setupNav();
}

export default { init, resize };
