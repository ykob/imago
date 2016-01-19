import debounce from './debounce.js';

const resizeCanvas = (canvas) => {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  canvas.style.width = `${document.body.clientWidth}px`;
  canvas.style.height = `${document.body.clientHeight}px`;
};

export default function(canvas) {
  resizeCanvas(canvas);
  debounce(window, 'resize', () => {
    resizeCanvas(canvas);
  });
};
