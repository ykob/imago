const $info = $('.c-information');
const $btn = $('.c-information-btn');

export default class Information {
  constructor() {
    this.is_viewed = false;
  };
  toggle() {
    if (this.is_viewed) {
      this.hide();
    } else {
      this.visible();
    }
  };
  visible() {
    this.is_viewed = true;
    $info.addClass('is-viewed');
  };
  hide() {
    this.is_viewed = false;
    $info.removeClass('is-viewed');
  };
};
