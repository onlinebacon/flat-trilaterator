export default class Centralizer {
    constructor({ width, height, ratio, margin }) {
        const maxWidth = width - margin*2;
        const maxHeight = height - margin*2;
        const screenRatio = maxWidth/maxHeight;
        let innerWidth;
        let innerHeight;
        if (screenRatio > ratio) {
            innerHeight = maxHeight;
            innerWidth = innerHeight*ratio;
        } else {
            innerWidth = maxWidth;
            innerHeight = innerWidth/ratio;
        }
        const x0 = (width - innerWidth)/2;
        const y0 = (height - innerHeight)/2;
        this.x = x0;
        this.y = y0;
        this.width = innerWidth;
        this.height = innerHeight;
    }
    projectNormal([ nx, ny ]) {
        const { x, y, width, height } = this;
        return [ x + width*nx, y + height*ny ];
    }
    getNormal([ px, py ]) {
        const { x, y, width, height } = this;
        return [ (px - x)/width, (py - y)/height ];
    }
}
