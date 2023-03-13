const { PI, sqrt, sin, cos } = Math;
const ini_step = 0.001;
const max_step = 0.01;
const min_step = 1e-10;

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
        this.dir = 0;
        this.focus = 0;
        this.error = this.calcError();
        this.active = true;
        this.iterations = 0;
    }
    focusDir(angle) {
        let dif = (angle - this.dir)/(PI*2);
        if (dif > 0.5) {
            dif = dif - 1;
        } else if (dif < -0.5) {
            dif = 1 + dif;
        }
        dif = Math.pow(Math.abs(dif), 1.5)*(dif > 0 ? 1: -1);
        let res = this.dir + dif*(PI*2);
        res = (res + PI*2)%(PI*2);
        return res;
    }
    distanceTo(searcher) {
        return flatDistance(this.normal, searcher.normal, this.projection.ratio);
    }
    calcError(normal = this.normal) {
        const { projection, circles } = this;
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
        const { step } = this;
        let [ x, y ] = this.normal;
        const normal = [
            x + step*sin(dir),
            y + step*cos(dir),
        ];
        const error = this.calcError(normal);
        return { error, normal, dir };
    }
    tryImprovements() {
        const nDir = 12;
        const angleStep = PI*2/nDir;
        let best = null;
        for (let i=0; i<nDir; ++i) {
            const dir = this.focusDir(angleStep*i);
            const result = this.shoot(dir);
            if (best === null || result.error < best.error) {
                best = result;
            }
        }
        if (best.error < this.error) {
            this.dir = best.dir;
            this.normal = best.normal;
            this.error = best.error;
            this.reward();
        } else {
            this.punish();
        }
        ++ this.iterations;
        return this;
    }
    punish() {
        this.step *= 0.75;
        this.focus = 1;
        if (this.step < min_step) {
            this.active = false;
        }
        return this;
    }
    reward() {
        this.step *= 1.5;
        this.step = Math.min(max_step, this.step);
        this.focus = 1.5;
        return this;
    }
}
