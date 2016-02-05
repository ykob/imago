export default class Popup {
  constructor($elm) {
    this.$elm = $elm;
    this.href = $elm.attr('href');
    this.name = '';
    this.width = 600;
    this.height = 400;
  };
  init(name, width, height) {
    if (name) this.name = name;
    if (width) this.width = width;
    if (height) this.height = height;
    const _this = this;
    this.$elm.on('click', function() {
      _this.open();
      return false;
    });
  };
  open() {
    window.open(
      this.href,
      this.name,
      `width=${this.width},height=${this.height}`
    );
  };
};
