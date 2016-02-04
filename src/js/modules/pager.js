const $pager = $('.c-pager');
const $pager_current = $('.c-pager__current');
const $pager_all = $('.c-pager__all');

export default class Pager {
  visible() {
    $pager.addClass('is-viewed');
  };
  hide() {
    $pager.removeClass('is-viewed');
  };
  setAllNum(num) {
    $pager_all.text(num);
  };
  setCurrentNum(num) {
    $pager_current.text(num);
  };
}
