const $text = $('.c-introduction__text');
const $bg = $('.c-introduction__bg');

export default class Introduction {
  start() {
    $text.each(function(index, el) {
      const $this = $(this);
      setTimeout(function() {
        $this.addClass('is-viewed');
      }, 200 * index);
    });
  };
  finish() {
    $bg.addClass('is-transparent');
    $text.each(function(index, el) {
      const $this = $(this);
      setTimeout(function() {
        $this.addClass('is-hidden');
      }, 200 * index + 1500);
    });
  };
}
