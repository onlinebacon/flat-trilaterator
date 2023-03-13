import loadImage from './load-image.js';

const { PI, sqrt, exp, log, sin, cos, tan, atan, acos } = Math;
const D45 = PI/4;
const D360 = PI*2;
const D180 = PI;

const ae = {
	name: 'Azimuthal Equidistant',
	ratio: 1,
	radianScale: D360,
	img: loadImage('./img/ae.png'),
	toNormal: ([ lat, lon ]) => {
		const rad = 0.25 - lat/D360;
		const nx = 0.5 + sin(lon)*rad;
		const ny = 0.5 + cos(lon)*rad;
		return [ nx, ny ];
	},
	toCoord: ([ x, y ]) => {
		const dx = x - 0.5;
		const dy = y - 0.5;
		const rad = sqrt(dx*dx + dy*dy);
		if (rad > 0.5) {
			return [ NaN, NaN ];
		}
		return [
			(0.5 - rad*2)*D180,
			dx >= 0 ? acos(dy/rad) : - acos(dy/rad),
		];
	},
};

const mercator = {
	name: 'Mercator',
	ratio: 1,
	radianScale: D360,
	img: loadImage('./img/mercator.png'),
	toNormal: ([ lat, lon ]) => [
		0.5 + lon/D360,
		0.5 - log(tan(D45 + lat/2))/D360,
	],
	toCoord: ([ x, y ]) => {
		if (x < 0 || x > 1 || y < 0 || y > 1) {
			return [ NaN, NaN ];
		}
		return [
			(atan(exp((0.5 - y)*D360)) - D45)*2,
			x*D360 - D180,
		];
	},
};

const eq = {
	name: 'Equirectangular',
	ratio: 2,
	radianScale: D180,
	img: loadImage('./img/equirectangular.png'),
	toNormal: ([ lat, lon ]) => [
		lon/D360 + 0.5,
		0.5 - lat/D180,
	],
	toCoord: ([ x, y ]) => {
		if (x < 0 || x > 1 || y < 0 || y > 1) {
			return [ NaN, NaN ];
		}
		return [
			(0.5 - y)*D180,
			(x - 0.5)*D360,
		];
	},
};

export default [ ae, mercator, eq ];
