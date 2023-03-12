import parseAngle from './parse-angle.js';

const degToRad = (deg) => deg/180*Math.PI;

const parseCircle = (line) => {
    line = line.trim().split(/\s*,\s*/);
    line = line.map(parseAngle);
    line = line.map(degToRad);
    const [ lat, lon, radius ] = line;
    const coord = [ lat, lon ];
    return { coord, radius };
};

export default parseCircle;
