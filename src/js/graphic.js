import Sidebar from './sidebar';
import Mainbar from './mainbar';

const $body = d3.select('body');
const $header = $body.select('header');

function resize() {
	Sidebar.resize();
	Mainbar.resize();
}

function init() {
	Sidebar.init();
	Mainbar.init();

	const $about = $header.select('.header__about');
	const $textVideo = $body.select('.text__video button');

	$about.on('click', function() {
		Mainbar.toggle('about')
		d3.select('.section__video').classed('is-hidden', true)
	})
	
	$textVideo.on('click', function() {
		Mainbar.toggle('video')
		d3.select('.section__about').classed('is-hidden', true)
	})
}

export default { init, resize };
