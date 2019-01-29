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
	$about.on('click', () => Mainbar.toggle('about'));

	const $textVideo = $body.select('.text__video button');
	$textVideo.on('click', () => Mainbar.toggle('video'));
}

export default { init, resize };
