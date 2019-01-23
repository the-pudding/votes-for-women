import noUiSlider from 'nouislider';

const $main = d3.select('main');
const $mainbar = $main.select('.mainbar');
const $sidebar = $main.select('.sidebar');
const $slider = $main.select('.slider');

function resize() {
	const height = window.innerHeight;
	$mainbar.st({ height });
}

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
	const value = d3.select(this).at('data-value');
	console.log({ value });
}

function handleFilterPartyClick() {
	const value = d3.select(this).at('data-value');
	console.log({ value });
}

function handleFilterIssuesClick() {
	const value = d3.select(this).at('data-value');
	console.log({ value });
}

function setupSlider() {
	const min = 1840;
	const max = 2016;
	const start = [min, max];

	const slider = noUiSlider.create($slider.node(), {
		start,
		step: 4,
		connect: true,
		// tooltips: [
		// 	{
		// 		to: value => {
		// 			const data = nestedData[Math.round(value)];
		// 			return data.dateDisplay.slice(4);
		// 		}
		// 	}
		// ],
		range: {
			min,
			max
		}
	});

	slider.on('slide', handleSlide);
	slider.on('change', handleChange);
}

function setupNav() {
	$sidebar.selectAll('.nav__sort button').on('click', handleSortClick);
	$sidebar
		.selectAll('.nav__filter-party button')
		.on('click', handleFilterPartyClick);
	$sidebar
		.selectAll('.nav__filter-issues button')
		.on('click', handleFilterIssuesClick);
}
function init() {
	setupSlider();
	setupNav();
	resize();
}

export default { init, resize };
