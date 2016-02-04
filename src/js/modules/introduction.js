const $text = $('.c-introduction__text');
const $loader = $('.c-introduction__loader');
const $bg = $('.c-introduction__bg');

export default class Introduction {
  start() {
    $text.each(function(index, el) {
      const $this = $(this);
      setTimeout(function() {
        $this.addClass('is-viewed');
      }, 200 * index);
    });
    setTimeout(function() {
      $loader.addClass('is-viewed');
    }, 1000);
  };
  finish() {
    $bg.addClass('is-transparent');
    setTimeout(function() {
      $loader.removeClass('is-viewed');
    }, 1000);
    $text.each(function(index, el) {
      const $this = $(this);
      setTimeout(function() {
        $this.addClass('is-hidden');
      }, 200 * index + 1500);
    });
  };
}
