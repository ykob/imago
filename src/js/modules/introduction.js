const $intro = $('.c-introduction');
const $text = $('.c-introduction__text');
const $loader = $('.c-introduction__loader');
const $bg = $('.c-introduction__bg');

export default class Introduction {
  start() {
    setTimeout(function() {
      $text.addClass('is-viewed');
    }, 500);
    setTimeout(function() {
      $loader.addClass('is-viewed');
    }, 1500);
  };
  finish() {
    $bg.addClass('is-transparent');
    setTimeout(function() {
      $loader.removeClass('is-viewed');
    }, 1000);
    setTimeout(function() {
      $text.addClass('is-hidden');
    }, 1500);
    setTimeout(function() {
      $intro.hide();
    }, 5000);
  };
}
