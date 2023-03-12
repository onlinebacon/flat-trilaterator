const { PI, sqrt, sin, cos } = Math;
const ini_step = 0.001;
const max_step = 0.01;

const flatDistance = ([ ax, ay ], [ bx, by ], ratio) => {
    const dx = (bx - ax)*ratio;
    const dy = by - ay;
    return sqrt(dx*dx + dy*dy);
};

export default class Searcher {
    constructor({ projection, circles, normal }) {
        this.step = ini_step;
        this.projection = projection;
        this.circles = circles;
        this.normal = normal ?? [ 0, 0 ];
        this.error = this.calcError();
    }
    calcError() {
        const { normal, projection, circles } = this;
        const { ratio } = projection;
        let sum = 0;
        for (let circle of circles) {
            const center = projection.toNormal(circle.coord);
            const radius = circle.radius/projection.radianScale;
            const distance = flatDistance(normal, center, ratio);
            const error = distance - radius;
            sum += error*error;
        }
        return sum;
    }
    shoot(dir) {
        const { step, normal } = this;
        let [ x, y ] = normal;
        x += step*sin(dir);
        y += step*cos(dir);
        this.normal = [ x, y ];
        const error = this.calcError();
        if (error < this.error) {
            this.error = error;
            return true;
        }
        this.normal = normal;
        return false;
    }
    tryImprovements(nDir = 4) {
        const angle = PI*2/nDir;
        let improved = false;
        for (let i=0; i<nDir; ++i) {
            improved = this.shoot(angle*i) || improved;
        }
        if (improved) {
            this.reward();
        } else {
            this.punish();
        }
        return this;
    }
    punish() {
        this.step *= 0.75;
        return this;
    }
    reward() {
        this.step *= 1.25;
        this.step = Math.min(max_step, this.step);
        return this;
    }
}
