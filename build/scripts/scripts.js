const brakepoints = {
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1600
}

const $wrapper = document.querySelector('.wrapper');

document.addEventListener("DOMContentLoaded", function() {
  CustomInteractionEvents.init();
  Header.init();
  Modal.init();

  calculator();
  change_package();
  input_file();

  //Product sliders
  document.querySelectorAll('.product-slider').forEach($this => {
    new ProductSlider($this).init();
  })
  //Image sliders
  document.querySelectorAll('.image-slider').forEach($this => {
    new ImageSlider($this).init();
  })
  //toggle
  document.querySelectorAll('[data-toggle="parent"]').forEach($this => {
    new ToggleElement($this).init();
  })
  //select
  document.querySelectorAll('.select').forEach($this => {
    new SlimSelect({
      select: $this,
      showSearch: false,
      showContent: 'down'
    })
  })
  //tabs
  document.querySelectorAll('[data-tabs="parent"]').forEach($this => {
    new TabsElement($this).init();
  })
  //Product Slider
  document.querySelectorAll('.product-preview-slider').forEach($this => {
    new ProductPreviewSlider($this).init();
  })

  //mask
  Inputmask({
    mask: "8 (999) 999-99-99",
    showMaskOnHover: false,
    clearIncomplete: false
  }).mask('[data-phone]'); //validation events
});

const CustomInteractionEvents = Object.create({
  targets: {
    value: 'a, button, label, [data-custom-interaction], .ss-single-selected, .ss-option'
  },
  touchEndDelay: {
    value: 100
  }, 
  init() {
    this.events = (event) => {
      let $targets = [];
      $targets[0] = event.target!==document?event.target.closest(this.targets.value):null;
      let $element = $targets[0], i = 0;
  
      while($targets[0]) {
        $element = $element.parentNode;
        if($element!==document) {
          if($element.matches(this.targets.value)) {
            i++;
            $targets[i] = $element;
          }
        } 
        else {
          break;
        }
      }
  
      //touchstart
      if(event.type=='touchstart') {
        this.touched = true;
        if(this.timeout) clearTimeout(this.timeout);
        if($targets[0]) {
          for(let $target of $targets) $target.setAttribute('data-touch', '');
        }
      } 
      //touchend
      else if(event.type=='touchend' || (event.type=='contextmenu' && this.touched)) {
        this.timeout = setTimeout(() => {this.touched = false}, 500);
        if($targets[0]) {
          setTimeout(()=>{
            for(let $target of $targets) {
              $target.removeAttribute('data-touch');
            }
          }, this.touchEndDelay.value)
        }
      } 
      //mouseenter
      if(event.type=='mouseenter' && !this.touched && $targets[0] && $targets[0]==event.target) {
        $targets[0].setAttribute('data-hover', '');
      }
      //mouseleave
      else if(event.type=='mouseleave' && !this.touched && $targets[0] && $targets[0]==event.target) {
        $targets[0].removeAttribute('data-click');
        $targets[0].removeAttribute('data-hover');
      }
      //mousedown
      if(event.type=='mousedown' && !this.touched && $targets[0]) {
        $targets[0].setAttribute('data-click', '');
      } 
      //mouseup
      else if(event.type=='mouseup' && !this.touched  && $targets[0]) {
        $targets[0].removeAttribute('data-click');
      }
    }
    document.addEventListener('touchstart',  this.events);
    document.addEventListener('touchend',    this.events);
    document.addEventListener('mouseenter',  this.events, true);
    document.addEventListener('mouseleave',  this.events, true);
    document.addEventListener('mousedown',   this.events);
    document.addEventListener('mouseup',     this.events);
    document.addEventListener('contextmenu', this.events);
  }
})


function calculator() {

  let events = (event) => {
    let $target = event.target.closest('.count-calculator__button');

    if($target) {
      let $input = $target.parentNode.querySelector('input');

      if($target.classList.contains('count-calculator__button_minus')) {
        $input.value = Math.max(+$input.value - 1, 1)
      } else {
        $input.value = +$input.value + 1
      }
    }
  }

  let input = (event) => {
    let $target = event.target.closest('.count-calculator__input');

    if($target) {
      $target.value = Math.max(+$target.value, 1)
    }
  }

  document.addEventListener('click', events);
  document.addEventListener('input', input);
}

function change_package() {
  let events = (event) => {
    let $target = event.target.closest('.packaging-list__item input');

    if($target) {
      let name = $target.getAttribute('name'),
          $value = document.querySelector(`[data-name='${name}'] span`);

      if($value) $value.innerHTML = $target.value;
    }
  }

  document.addEventListener('change', events);
}

function input_file() {
  let events = (event) => {
    let $target = event.target.closest('.input-file');

    if($target) {

      let $input = $target.querySelector('input'),
          $text = $target.querySelector('.input-file__text'),
          value = $input.value.split('\\');

      $text.innerHTML = value[value.length - 1]

    }
  }

  document.addEventListener('change', events);
}

class ProductSlider {
  constructor($parent) {
    this.$parent = $parent
  }

  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$prev = this.$parent.querySelector('.swiper-button-prev');
    this.$next = this.$parent.querySelector('.swiper-button-next');

    this.swiper = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      slidesPerView: 1,
      speed: 500,
      navigation: {
        prevEl: this.$prev,
        nextEl: this.$next
      },
      breakpoints: {
        [brakepoints.xl]: {
          slidesPerView: 5
        }
      }
    });


  }
}

class ImageSlider {
  constructor($parent) {
    this.$parent = $parent
  }

  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$pagination = this.$parent.querySelector('.swiper-pagination');

    this.swiper = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      slidesPerView: 1,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      },
      pagination: {
        el: this.$pagination,
        clickable: true,
        bulletElement: 'button'
      }
    });


  }
}

class ToggleElement {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$trigger = this.$parent.querySelector('[data-toggle="trigger"]');
    this.$block = this.$parent.querySelector('[data-toggle="content"]');

    this.$trigger.addEventListener('click', () => {
      let state = this.$parent.classList.contains('is-active');

      if(!state) this.open();
      else this.close();
    })
    
  }

  open() {
    for(let $el of [this.$parent, this.$trigger, this.$block]) {
      $el.classList.add('is-active')
    }
  }

  close() {
    for(let $el of [this.$parent, this.$trigger, this.$block]) {
      $el.classList.remove('is-active')
    }
  }
}

class TabsElement {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$links = this.$parent.querySelectorAll('[data-tabs="link"]');
    this.$blocks = this.$parent.querySelectorAll('[data-tabs="block"]');

    this.set = (index) => {
      this.$links[index].classList.add('is-active');
      this.$blocks[index].classList.add('is-active');
      
      if(this.index!==undefined) {
        this.$links[this.index].classList.remove('is-active');
        this.$blocks[this.index].classList.remove('is-active');
      }
  
      
      
      //gsap.fromTo(this.$blocks[index], {autoAlpha:0}, {autoAlpha:1, duration:0.5, ease:'power2.out'})
      
      this.index = index;
    }

    this.$links.forEach(($this, index) => {
      if($this.classList.contains('is-active')) {
        this.index = index;
      }
      $this.addEventListener('click', () => {
        if(this.index !== index) this.set(index);
      })
    })

  }
}

class ProductPreviewSlider {
  constructor($parent) {
    this.$parent = $parent;
  }

  init() {
    this.$slider = this.$parent.querySelector('.swiper-container');
    this.$small_images = this.$parent.querySelectorAll('.product-preview-slider__small-image');

    console.log(this.$slider )

    this.slider = new Swiper(this.$slider, {
      touchStartPreventDefault: false,
      slidesPerView: 1,
      speed: 500,
      lazy: {
        loadOnTransitionStart: true,
        loadPrevNext: true
      }
    });

    if(this.$small_images.length>1) {

      this.$small_images[0].classList.add('is-active');
      this.slider.on('slideChange', (event)=> {
        this.$small_images.forEach($this => {
          $this.classList.remove('is-active')
        })
        this.$small_images[event.realIndex].classList.add('is-active');
      })

      this.$small_images.forEach(($this, index)=>{
        $this.addEventListener('mouseenter', ()=> {
          this.slider.slideTo(index);
        })
        $this.addEventListener('click', ()=> {
          this.slider.slideTo(index);
        })
      })
      
    }

  }
}

const Header = {
  $element: document.querySelector('.header'),

  init: function () {

    let check = () => {
      let y = $wrapper.getBoundingClientRect().y,
          fixed = this.$element.classList.contains('header_fixed');

      if (y <= 0 && !fixed) this.$element.classList.add('header_fixed');
      else if (y > 0 && fixed) this.$element.classList.remove('header_fixed');
    }

    window.addEventListener('scroll', check)
    check();
  }
}

const Modal = {
  init: function () {
    gsap.registerEffect({
      name: "modal",
      effect: ($modal, $content) => {
        let anim = gsap.timeline({paused: true})
          .fromTo($modal, {autoAlpha: 0}, {autoAlpha:1, duration:0.5})
          .fromTo($content, {y: 20}, {y:0, duration:0.5, ease:'power2.out'}, `-=0.5`)
        return anim;
      },
      extendTimeline: true
    });

    document.addEventListener('click', (event) => {
      let $open = event.target.closest('[data-modal="open"]'),
        $close = event.target.closest('[data-modal="close"]'),
        $wrap = event.target.closest('.modal'),
        $block = event.target.closest('.modal-block');

      //open
      if ($open) {
        event.preventDefault();
        let $modal = document.querySelector(`${$open.getAttribute('href')}`);
        this.open($modal);
      }
      //close 
      else if ($close || (!$block && $wrap)) {
        this.close();
      }
    })

    //this.open(document.querySelector('#product'))
  },
  open: function ($modal) {
    let open = ()=> {
      scrollLock.disablePageScroll();
      $modal.classList.add('active');
      //animation
      let $content = $modal.querySelector('.modal-block')
      this.animation = gsap.effects.modal($modal, $content);
      this.animation.play();
      this.$active = $modal;
    }
    if($modal) {
      if(this.$active) this.close(open);
      else open();
    }
  },
  close: function (callback) {
    if (this.$active) {

      if(this.timeout) {
        clearTimeout(this.timeout);
        delete this.timeout;
      }

      this.animation.timeScale(2).reverse().eventCallback('onReverseComplete', ()=> {
        delete this.animation;
        scrollLock.enablePageScroll();
        this.$active.classList.remove('active');
        delete this.$active;
        if (callback) callback();
      })
    }
  }
}