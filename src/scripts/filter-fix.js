document.addEventListener('click', event => {
  let _filter_trigger = '.catalogue-filter__category-head',
      _filter_icon = '.icon';


  if (event.target.closest(_filter_trigger) && event.target.closest(_filter_icon)) {
    event.preventDefault();
  } else if (event.isTrusted) {
    event.target.closest(_filter_trigger).dispatchEvent(new Event("click"));
  }
})