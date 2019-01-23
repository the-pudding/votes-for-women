import Sidebar from './sidebar';
import Mainbar from './mainbar';

function resize() {
	Sidebar.resize();
	Mainbar.resize();
}

function init() {
	Sidebar.init();
	Mainbar.init();
}

export default { init, resize };
