const loadImage = (src) => new Promise((done, fail) => {
    const img = document.createElement('img');
    img.onerror = fail;
    img.onload = () => done(img);
    img.src = src;
});

export default loadImage;
