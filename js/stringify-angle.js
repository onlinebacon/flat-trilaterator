const stringifyAngles = (degrees, posSuffix, negSuffix) => {
    let t = Math.abs(Math.round(degrees*600));
    let min = (t%600)/10;
    let deg = Math.floor(t/600);
    let suffix = degrees >= 0 ? posSuffix : negSuffix;
    return `${deg}° ${min}' ${suffix}`;
};

export default stringifyAngles;
