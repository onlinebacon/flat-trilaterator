import projections from './projections.js';
import parseCircle from './parse-circle.js';
import stringifyAngles from './stringify-angle.js';

import Centralizer from './centralizer.js';
import Searcher from './searcher.js';

const divCanvas = document.querySelector('.canvas');
const mapSelect = document.querySelector('#map');
const canvas = document.createElement('canvas');
const circlesInput = document.querySelector('#circles');
const resultOutput = document.querySelector('#results');
const ctx = canvas.getContext('2d');
divCanvas.appendChild(canvas);

let [ projection ] = projections;
let searchers = [];
let circles = [];
let centralizer = new Centralizer({});
let circleColor = 'rgba(255, 255, 255, 0.5)';
let searcherColor = '#f70';

projections.forEach((projection, i) => {
	mapSelect.innerHTML += `<option value="${i}">${projection.name}</option>`
});

const adjustCanvasSize = () => {
	let { width, height } = window.getComputedStyle(divCanvas);
	width = Number(width.replace('px', ''));
	height = Number(height.replace('px', ''));
	canvas.width = width;
	canvas.height = height;
};

const drawSpot = (x, y, color) => {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI*2);
	ctx.fill();
};

const drawCircle = (circle) => {
	const normal = projection.toNormal(circle.coord);
	const [ x, y ] = centralizer.projectNormal(normal);
	const radius = circle.radius/projection.radianScale*centralizer.height;
	drawSpot(x, y, circleColor);
	ctx.strokeStyle = circleColor;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI*2);
	ctx.stroke();
};

const drawSearcher = (searcher) => {
	const space = 1.5;
	const len = 3;
	const [ x, y ] = centralizer.projectNormal(searcher.normal);
	ctx.strokeStyle = searcher.test ? '#f00' : searcherColor;
	ctx.beginPath();
	ctx.arc(x, y, space + len/3, 0, Math.PI*2);
	ctx.moveTo(x - space - len, y);
	ctx.lineTo(x - space, y);
	ctx.moveTo(x + space + len, y);
	ctx.lineTo(x + space, y);
	ctx.moveTo(x, y - space - len);
	ctx.lineTo(x, y - space);
	ctx.moveTo(x, y + space + len);
	ctx.lineTo(x, y + space);
	ctx.stroke();
};

const render = async () => {
	centralizer = new Centralizer({
		width: canvas.width,
		height: canvas.height,
		ratio: projection.ratio,
		margin: 50,
	});
	const img = await projection.img;
	const { x, y, width, height } = centralizer;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, x, y, width, height);
	circles.forEach(drawCircle);
	searchers.forEach(drawSearcher);
};

const updateCircles = () => {
	const lines = circlesInput.value.split(/\n/).filter(line => line.trim());
	circles = lines.map(parseCircle);
};

const addSearcher = (searcher) => {
	searchers.push(searcher);
};

const iterateSearchers = () => {
	for (let searcher of searchers) {
		let { active } = searcher;
		if (active) searcher.tryImprovements();
		if (active && !searcher.active) {
			console.log('done', searcher.iterations);
		}
	}
};

const forceFind = () => {
	const { length } = searchers;
	for (let i=0; i<1500; +i) {
		let active = 0;
		for (let j=0; j<length; ++j) {
			const searcher = searchers[j];
			if (searcher.active === false) continue;
			searcher.tryImprovements();
			active |= searcher.active;
		}
		if (!active) break;
	}
};

const mergeDuplicatedResults = () => {
	const minDist = 1e-6;
	const result = searchers.slice(0, 1);
	for (let i=1; i<searchers.length; ++i) {
		let add = true;
		const a = searchers[i];
		for (let j=0; j<result.length; ++j) {
			const b = searchers[j];
			const dist = a.distanceTo(b);
			if (dist < minDist) {
				add = false;
				break;
			}
		}
		if (add) {
			result.push(a);
		}
	}
	searchers.length = 0;
	searchers.push(...result);
};

const runSearchers = () => {
	forceFind();
	mergeDuplicatedResults();
};

const clearSearchers = () => {
	searchers.length = 0;
};

const updateSearchersOutput = () => {
	let text = '';
	searchers.forEach((searcher) => {
		const coord = projection.toCoord(searcher.normal);
		const [ lat, lon ] = coord.map((val) => val/Math.PI*180);
		text += stringifyAngles(lat, 'N', 'S');
		text += ', ' + stringifyAngles(lon, 'E', 'W') + '\n';
	});
	if (text !== resultOutput.value) {
		resultOutput.value = text;
	}
};

const resetSearchers = () => {
	clearSearchers();
	const nDivs = 4;
	for (let i=0; i<nDivs; ++i) {
		const x = (i + 0.5)/nDivs;
		for (let j=0; j<nDivs; ++j) {
			const y = (j + 0.5)/nDivs;
			addSearcher(new Searcher({
				projection,
				circles,
				normal: [ x, y ],
			}));
		}
	}
	forceFind();
	mergeDuplicatedResults();
	updateSearchersOutput();
};

circlesInput.value = `
16°22.9'S, 55°53.8'W, 65°59.8'
56°39.6'N, 7°38.3'W, 50°28.6'
8°55.6'N, 80°25.7'W, 34°30'
`.split('\n').filter(line => line.trim()).join('\n');

updateCircles();
resetSearchers();
adjustCanvasSize();
render();

window.addEventListener('resize', () => {
	adjustCanvasSize();
	render();
});

canvas.addEventListener('mousedown', (e) => {
	e.preventDefault();
	e.stopPropagation();
});

mapSelect.addEventListener('input', () => {
	const index = mapSelect.value;
	projection = projections[index];
	resetSearchers();
	render();
});

circlesInput.addEventListener('input', () => {
	updateCircles();
	resetSearchers();
	render();
});
