const negRegex = /^[-sw]|[sw]$/i;
const posRegex = /^[+ne]|[ne]$/i;

const parseAngle = (str) => {
    str = str.replace(/[°'"]/g, '\x20').trim();
    let sign = 1;
    if (negRegex.test(str)) {
        str = str.replace(negRegex, '').trim();
        sign = -1;
    } else {
        str = str.replace(posRegex, '').trim();
    }
    let values = str.split(/\s+/).map((v, i) => v*Math.pow(60, -i));
    let sum = values.reduce((a, b) => a + b);
    return sum*sign;
};

export default parseAngle;
