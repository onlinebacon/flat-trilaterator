import projections from './projections.js';
import parseCircle from './parse-circle.js';
import stringifyAngles from './stringify-angle.js';

import Centralizer from './centralizer.js';
import Searcher from './searcher.js';

const divCanvas = document.querySelector('.canvas');
const mapSelect = document.querySelector('#map');
const canvas = document.createElement('canvas');
const circlesInput = document.querySelector('#circles');
const searchersOutput = document.querySelector('#searchers');
const ctx = canvas.getContext('2d');
divCanvas.appendChild(canvas);

let [ projection ] = projections;
let searchers = [];
let circles = [];
let centralizer = new Centralizer({});

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
	drawSpot(x, y, '#fff');
	ctx.strokeStyle = '#fff';
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI*2);
	ctx.stroke();
};

const drawSearcher = (searcher) => {
	const [ x, y ] = centralizer.projectNormal(searcher.normal);
	drawSpot(x, y, '#fc2');
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
	clearSearchers();
};

const addSearcher = (searcher) => {
	searchers.push(searcher);
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
	if (text !== searchersOutput.value) {
		searchersOutput.value = text;
	}
};

circlesInput.value = `
5°10.1'N, 150°27.5'W, 64°50.1'
89°21.5'N, 138°56.1'E, 44°25'
19°3.9'N, 52°4.8'W, 44°19'
`.split('\n').filter(line => line.trim()).join('\n');

updateCircles();
adjustCanvasSize();
render();

setInterval(() => {
	searchers.forEach((searcher) => {
		searcher.tryImprovements();
	});
	updateSearchersOutput();
	render();
}, 0);

window.addEventListener('resize', () => {
	adjustCanvasSize();
	render();
});

canvas.addEventListener('mousedown', (e) => {
	e.preventDefault();
	e.stopPropagation();
});

canvas.addEventListener('dblclick', (e) => {
	const x = e.offsetX;
	const y = e.offsetY;
	const normal = centralizer.getNormal([ x, y ]);
	const searcher = new Searcher({ projection, circles, normal });
	addSearcher(searcher);
	render();
});

mapSelect.addEventListener('input', () => {
	const index = mapSelect.value;
	projection = projections[index];
	clearSearchers();
	render();
});

circlesInput.addEventListener('input', () => {
	updateCircles();
});
