(function (w) {
  if (w.$) {
    w.komboxFilterJsInit = function () {}
    return;
  }
  var _funcs = [];
  w.$ = function (f) { // add functions to a queue
    _funcs.push(f);
  };
  w.komboxFilterJsInit = function () { // move the queue to jQuery's DOMReady
    while (f = _funcs.shift())
      f();
  };
})(window);

$(function () {
  $.komboxInherit = function (name, base, prototype) {
    if (!prototype) {
      prototype = base;
      base = $.KomboxSmartFilter;
    }

    $[name] = function (wrapper, settings) {
      if (arguments.length) {
        this.init(wrapper, settings);
      }
    };

    var basePrototype = new base();
    basePrototype.options = $.extend({}, basePrototype.options);
    $[name].prototype = $.extend(true, basePrototype, {
      name: name
    }, prototype);

    $.fn[name] = function (options) {
      var filters = [];
      $(this).each(function () {
        var filter = new $[name](this, options);
        filters[filters.length] = filter;
      });
      return filters;
    };
  };

  $.KomboxSmartFilter = function (wrapper, options) {
    if (arguments.length) {
      this.init(wrapper, options);
    }
  };

  $.KomboxSmartFilter.prototype = {
    options: {
      ajaxURL: false,
      align: 'LEFT',
      modeftimeout: 0,
      urlDelete: false,
      callbacks: {
        init: false
      }
    },

    init: function (wrapper, options) {
      this.wrapper = $(wrapper);

      this.options = $.extend(this.options, options);
      this.form = $('form', this.wrapper);
      this.timer = null;
      this.hint = null;

      this.initRanges();
      this.initHints();
      this.initToggleProperties();
      this.initTogglePropertiesValues();
      this.initChoice();
      this.initForm();

      if (typeof this.options.callbacks.init == 'function') {
        this.options.callbacks.init.call(this.wrapper, this.options);
      }
    },

    initRanges: function () {
      var _this = this;
      $(".kombox-range div", _this.wrapper).each(function () {
        var slider = $(this);
        var min = parseFloat(slider.data('min'));
        var max = parseFloat(slider.data('max'));
        var diaposonNumbers = max - min;
        var parent = slider.parents('.kombox-num');
        var step = 1;
        if (diaposonNumbers / 20 < 1)
          step = Math.round(diaposonNumbers / 20 * 1000000) / 1000000;

        var inputFrom = $('.kombox-num-from', parent);
        var inputTo = $('.kombox-num-to', parent);

        slider.ionRangeSlider({
          type: "double",
          hasGrid: true,
          step: step,
          hideMinMax: true,
          hideFromTo: true,
          prettify: false,
          onChange: function (obj, slider) {
            if (obj.fromNumber == min)
              inputFrom.val('');
            else
              inputFrom.val(obj.fromNumber);

            if (obj.toNumber == max)
              inputTo.val('');
            else
              inputTo.val(obj.toNumber);
          },
          onFinish: function (obj, slider) {
            if (obj.fromNumber == min)
              inputFrom.val('');
            else
              inputFrom.val(obj.fromNumber);

            if (obj.toNumber == max)
              inputTo.val('');
            else
              inputTo.val(obj.toNumber);

            _this.keyup(inputFrom);
          }
        });


        inputFrom.on('change', function () {
          var from = inputFrom.val();
          if (!from.length) from = min;
          from = parseFloat(from);

          var to = inputTo.val();
          if (!to.length) to = max;
          to = parseFloat(to);

          if (from > to) {
            from = to;
            inputFrom.val(from);
          } else if (from == min) {
            inputFrom.val('');
          }

          slider.ionRangeSlider("update", {
            from: from,
            to: to
          });

          _this.keyup(inputFrom);
        });

        inputTo.on('change', function () {
          var from = inputFrom.val();
          if (!from.length) from = min;
          from = parseFloat(from);

          var to = inputTo.val();
          if (!to.length) to = max;
          to = parseFloat(to);

          if (from > to) {
            to = from;
            inputTo.val(to);
          } else if (to == max) {
            inputTo.val('');
          }

          slider.ionRangeSlider("update", {
            from: from,
            to: to
          });

          _this.keyup(inputTo);
        });
      });
    },

    initHints: function () {
      var _this = this;

      $('.kombox-filter-property-hint', _this.wrapper).on('click', function () {
        var $this = $(this);
        var hint = $this.next();
        if (hint.length) {
          var hintHtml = hint.html();
          if (hintHtml.length) {
            if (_this.hint == null) {
              _this.hint = new BX.PopupWindow("kombox-hint", BX(this), {
                content: '',
                lightShadow: true,
                autoHide: true,
                closeByEsc: true,
                bindOptions: {
                  position: "bottom"
                },
                closeIcon: {
                  top: "5px",
                  right: "10px"
                },
                offsetLeft: 0,
                offsetTop: 2,
                angle: {
                  offset: 14
                }
              });
            }
            _this.hint.setContent('<div class="kombox-filter-hint">' + hintHtml + '</div>');
            _this.hint.setBindElement(BX(this));
            _this.hint.show();
          }
        }
        return false;
      });
    },

    initToggleProperties: function () {
      $('.kombox-filter-property-name, .kombox-filter-property-head', this.wrapper).on('click', function () {
        var $this = $(this);
        var property = $this.parents('.lvl1');
        var body = $('.kombox-filter-property-body', property);
        if (body.length) {
          body.slideToggle(300);
          if (property.hasClass('kombox-closed')) {
            property.removeClass('kombox-closed');
            $.cookie('kombox-filter-closed-' + property.data('id'), false, {
              path: '/'
            });
          } else {
            property.addClass('kombox-closed');
            $.cookie('kombox-filter-closed-' + property.data('id'), true, {
              path: '/'
            });
          }
        }
        return false;
      });

      $('.kombox-closed .kombox-filter-property-body.kombox-num', this.wrapper).slideToggle(0);
    },

    initTogglePropertiesValues: function () {
      $('.kombox-values-other-show', this.wrapper).on('click', function () {
        var $this = $(this);
        var propertybody = $this.closest('.kombox-filter-property-body');
        var hide = propertybody.find('.kombox-values-other-hide'),
          valuesHidden = propertybody.find('.kombox-values-other');

        valuesHidden.show();
        $this.hide();
        hide.show();

        return false;
      });

      $('.kombox-values-other-hide', this.wrapper).on('click', function () {
        var $this = $(this);
        var propertybody = $this.closest('.kombox-filter-property-body');
        var show = propertybody.find('.kombox-values-other-show'),
          valuesHidden = propertybody.find('.kombox-values-other');

        valuesHidden.hide();
        $this.hide();
        show.show();

        return false;
      });
    },

    initChoice: function () {
      var _this = this;
      var form = this.form;
      $('.kombox-filter-choice a.kombox-remove-link').not('a.kombox-remove-all-link').on('click', function () {
        var id = $(this).data('filter');
        var control = $('#' + id);
        var submit = false;

        if (control.is(':selected')) {
          control.prop('selected', false);
          submit = true;

        } else if (control.is(':checked')) {
          control.prop('checked', false);
          submit = true;

        } else if (control.is('a')) {
          control[0].click();
        } else if (control.is('input[type=text]')) {
          control.val('');
          if (_this.isAjax)
            control.trigger('change');
          else
            submit = true;
        }

        if (submit) {
          _this.form.data('clicked', 'set_filter');
          _this.form.find('#set_filter').removeClass('disabled');
          _this.form.submit();
        }

        return false;
      });
    },

    initForm: function () {
      var _this = this;
      var form = this.form;

      form.on('click', 'input[type=submit], button[type=submit]', function () {
        form.data('clicked', $(this).attr('name'));
      });

      form.on('click', '.kombox-combo input[type="checkbox"], .kombox-radio input[type="radio"]', function () {
        _this.click($(this));
      });

      form.on('change', '.kombox-select select, .kombox-list select', function () {
        _this.click($(this));
      });

      $('.kombox-link .lvl2 a', this.wrapper).on('click', function () {
        var $this = $(this);
        var lvl2 = $this.closest('.lvl2');

        if (lvl2.hasClass('kombox-disabled') && !lvl2.hasClass('kombox-checked'))
          return false;
      });

      $('.kombox-disabled input[type="checkbox"], .kombox-disabled input[type="radio"], .kombox-disabled option', this.wrapper).each(function () {
        var $this = $(this);

        if (!$this.prop('checked')) {
          $this.prop('disabled', true);
        }
      });

      form.on('keypress', 'input[type="text"]', function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
          form.trigger('submit');
          return false;
        } else {
          return true;
        }
      });

      form.on('submit', function () {
        if (_this.submitForm() == false)
          return false;
      });
    },

    submitForm: function () {
      var _this = this;
      var form = this.form;

      $(':input', form).filter(
        function () {
          var val = $(this).val();
          if (val)
            return val.length == 0;
          else
            return true;
        }
      ).prop('disabled', true);

      $('select', form).filter(
        function () {
          return $(this).val() == '';
        }
      ).prop('disabled', true);

      if (form.data('sef') == 'yes' && !$('input[name=bxajaxid]', _this.form).length) {
        var url = '';
        if (form.data('clicked') == 'del_filter') {
          url = _this.options.urlDelete;
        } else {
          var filter_part = _this.getSefUrl();

          if (filter_part) {
            var action = document.createElement('a');
            action.href = form.attr('action');

            var pathname = action.pathname;
            if (pathname.substr(0, 1) !== '/')
              pathname = '/' + pathname;

            url = pathname + 'filter/' + filter_part + action.search;
          } else
            url = form.attr('action');
        }
        window.location = url;
        return false;
      }
    },

    getSefUrl: function () {
      var form = this.form;
      var url = '';
      var _this = this;

      $('.lvl1 .kombox-filter-property-body', form).each(function () {
        var $this = $(this);
        var name = $this.data('name');

        if (name.length) {
          var values = '';

          if ($this.hasClass('kombox-num')) {
            var from = $('input.kombox-num-from', $this).val();
            if (from.length)
              values += '-from-' + parseFloat(from);

            var to = $('input.kombox-num-to', $this).val();
            if (to.length)
              values += '-to-' + parseFloat(to);
          } else if ($this.hasClass('kombox-combo') || $this.hasClass('kombox-radio')) {
            values = _this.getSefUrlValues($('input:checked', $this));
          } else if ($this.hasClass('kombox-select') || $this.hasClass('kombox-list')) {
            values = _this.getSefUrlValues($('option:selected', $this));
          } else if ($this.hasClass('kombox-link')) {
            values = _this.getSefUrlValues($('.kombox-checked a', $this));
          }

          if (values.length) {
            url += name + values + '/';
          }
        }
      });

      return url;
    },

    getSefUrlValues: function (items) {
      var values = '';

      var arValues = items.map(function () {
        var result = '';
        var value = $(this).data('value');
        if (typeof value != 'undefined')
          result = value;
        else
          result = $(this).val();

        if (result)
          return result;
      }).get();

      if (arValues.length)
        values = '-' + arValues.join('-or-');

      return values;
    },

    updateUrl: function (params, values) {
      var form = this.form;
      var url = "";
      var bSef = form.data('sef') == 'yes';

      if (bSef) {
        var arParts = window.location.pathname.split("/");
        var baseurl = '/';
        var add = true;
        $.each(arParts, function (key, part) {
          if (part == 'filter' || part == 'index.php')
            add = false;
          if (add && part.length)
            baseurl += part + '/';
        });

        var sefUrl = this.getSefUrl();
        window.komboxSefUrl = sefUrl;

        if (sefUrl.length) {
          url += 'filter/' + sefUrl;
        }

        if (window.location.search)
          url += window.location.search;

      }

      values.forEach(function (entry) {
        if (typeof params[entry.name] != 'undefined' && !$.isArray(params[entry.name])) {
          var first = params[entry.name];
          params[entry.name] = new Array;
          params[entry.name].push(first);
        }

        if ($.isArray(params[entry.name]))
          params[entry.name].push(entry.value);
        else
          params[entry.name] = entry.value;

        if (entry.name != 'ajax' && entry.name != 'SECTION_CODE' && !bSef) {
          if (url.length) url += '&';
          url += (entry.name + '=' + entry.value);
        }
      });

      if (!bSef) {
        if (url.length) {
          url = '?' + url;
        } else {
          url = window.location.pathname;
        }
      }

      try {
        if (bSef) {
          url = baseurl + url;
          $('[name="ys-request-uri"]').val(url);
          history.pushState(null, null, window.location.origin + url);
        } else {
          history.pushState(null, null, url);
        }
        return params;
      } catch (e) {}
      location.hash = '#' + url;
      return params;
    },

    keyup: function (input) {
      this.reload(input);
    },

    click: function (checkbox) {
      var parent = checkbox.closest('.lvl2');

      if (checkbox.prop('checked'))
        parent.addClass('kombox-checked');
      else
        parent.removeClass('kombox-checked');

      this.reload(checkbox);
    },

    reload: function (input) {
      this.input = input;

      if (this.form.length) {
        var values = new Array;
        values[0] = {
          name: 'ajax',
          value: 'y'
        };

        this.gatherInputsValues(values, this.form.find('input, select, .kombox-link .lvl2 a'));

        BX.ajax.loadJSON(
          this.options.ajaxURL,
          this.values2post(values),
          BX.delegate(this.postHandler, this)
        );
      }
    },

    postHandler: function (result) {
      if (result.ITEMS) {
        for (var PID in result.ITEMS) {
          var arItem = result.ITEMS[PID];
          if (arItem.SETTINGS.VIEW == 'SLIDER') {
            var control = $('#' + arItem.VALUES.MAX.CONTROL_ID);
            if (control.length) {
              if (control[0].hasAttribute('placeholder')) {
                if (typeof arItem.VALUES.MAX.RANGE_VALUE !== 'undefined')
                  control.prop('placeholder', +arItem.VALUES.MAX.RANGE_VALUE);
                else
                  control.prop('placeholder', +arItem.VALUES.MAX.VALUE);
              }

              var slider = control.closest('.lvl1').find('.kombox-range div');
              if (slider.length) {
                slider.data('range-from', parseFloat(arItem.VALUES.MIN.RANGE_VALUE));
                slider.data('range-to', parseFloat(arItem.VALUES.MAX.RANGE_VALUE));

                slider.ionRangeSlider("updateRange");
              }
            }

            control = $('#' + arItem.VALUES.MIN.CONTROL_ID);
            if (control.length) {
              if (control[0].hasAttribute('placeholder')) {
                if (typeof arItem.VALUES.MIN.RANGE_VALUE !== 'undefined')
                  control.prop('placeholder', +arItem.VALUES.MIN.RANGE_VALUE);
                else
                  control.prop('placeholder', +arItem.VALUES.MIN.VALUE);
              }
            }
          } else if (arItem.VALUES) {
            for (var i in arItem.VALUES) {
              var ar = arItem.VALUES[i];
              var control = $('#' + ar.CONTROL_ID);
              if (control.length) {
                var parent = control.closest('.lvl2');

                if (arItem.SETTINGS.VIEW == 'LIST' || arItem.SETTINGS.VIEW == 'SELECT') {
                  if (ar.DISABLED)
                    control.addClass('kombox-disabled');
                  else
                    control.removeClass('kombox-disabled');

                  if (ar.CHECKED) {
                    control.addClass('kombox-checked');
                  } else
                    control.removeClass('kombox-checked');

                  if (ar.CNT > 0 && !ar.CHECKED)
                    control.text(ar.VALUE + ' (' + ar.CNT + ')');
                  else
                    control.text(ar.VALUE);
                } else {
                  if (ar.DISABLED)
                    parent.addClass('kombox-disabled');
                  else
                    parent.removeClass('kombox-disabled');

                  if (ar.CHECKED)
                    parent.addClass('kombox-checked');
                  else
                    parent.removeClass('kombox-checked');

                  if (ar.CNT > 0)
                    parent.find('span.kombox-cnt').text('(' + ar.CNT + ')');
                  else
                    parent.find('span.kombox-cnt').text('');
                }

                if (ar.DISABLED && !ar.CHECKED) {
                  control.prop('disabled', true);
                } else {
                  control.prop('disabled', false);
                }

                if (control.is('a') && ar.HREF) {
                  control.attr('href', ar.HREF);
                }
              }
            }
          }
        }
        this.showModef(result);
      }
    },

    showModef: function (result) {
      var modef = $('#modef', this.wrapper);
      var modef_num = $('#modef_num', this.wrapper);

      if (modef_num.length) {
        modef_num.html(result.ELEMENT_COUNT);
        var href = modef.find('a');
        if (result.FILTER_URL && href.length)
          href.attr('href', BX.util.htmlspecialcharsback(result.FILTER_URL));

        if (result.FILTER_AJAX_URL && result.COMPONENT_CONTAINER_ID) {
          href.off();
          href.on('click', function () {
            url = BX.util.htmlspecialcharsback(result.FILTER_AJAX_URL);
            BX.ajax.insertToNode(url, result.COMPONENT_CONTAINER_ID);
            return false;
          });
        }

        if (result.INSTANT_RELOAD && result.COMPONENT_CONTAINER_ID) {
          var url = BX.util.htmlspecialcharsback(result.FILTER_AJAX_URL);
          BX.ajax.insertToNode(url, result.COMPONENT_CONTAINER_ID);
        } 
        
        else {
          let $input = $(this.input).parent(),
              $filter = $input.closest('.catalogue-filter'),
              $container = $input.closest('.lvl1').find('.for_modef'),
              h = $input.height(),
              y1 = $container[0].getBoundingClientRect().top,
              y2 = $input[0].getBoundingClientRect().top,
              top = y2 - y1 + h/2;

          $container.css({
            'display': 'block',
            'position': 'relative'
          });

          if(window.innerWidth > breakpoints.lg) {
            $container.append(modef);
            modef.css('top', `${top}px`);
            modef.fadeIn(100);
            if (this.modeftimer) {
              clearTimeout(this.modeftimer);
            }
            this.modeftimer = setTimeout(function () {
              modef.fadeOut(100);
              console.log('3nd')
            }, this.options.modeftimeout * 1000);

            console.log("time:", this.options.modeftimeout * 1000)

          } else {
            $filter.append(modef);
            modef.fadeIn(100);
          }

          /* var input = $(this.input);
          var curProp = input.closest('.lvl1').find('.for_modef');

          console.log(input[0], curProp[0])

          if (curProp.length) {
            modef.show();

            var lvl2 = input.closest('.lvl2');
            var top = 0;

            if (lvl2.length) {
              top = lvl2.position().top - lvl2.height() / 2;
            }

            modef.css({
              'top': top + 'px'
            });

            if (this.options.align == 'LEFT') {
              modef.css({
                'left': '-' + modef.outerWidth() + 'px'
              });
            } else {
              modef.addClass('modef-right');
              modef.css({
                'right': '-' + modef.outerWidth() + 'px'
              });
            }

            curProp.append(modef);

            if (this.options.modeftimeout > 0) {
              if (this.modeftimer)
                clearTimeout(this.modeftimer);

              this.modeftimer = setTimeout(function () {
                modef.hide();
              }, this.options.modeftimeout * 1000);
            }
          } */
        }
      }
    },

    gatherInputsValues: function (values, elements) {
      if (elements.length) {
        elements.each(function () {
          var el = $(this);

          if (el.is('a') && el.data('checked') == 'checked') {
            values[values.length] = {
              name: el.data('name'),
              value: el.data('value')
            };
          } else if (!el.prop('disabled') && el[0].type) {
            switch (el[0].type.toLowerCase()) {
              case 'text':
              case 'textarea':
              case 'password':
              case 'hidden':
                var val = el.val();
                if (val.length)
                  values[values.length] = {
                    name: el.attr('name'),
                    value: el.val()
                  };
                break;
              case 'radio':
              case 'checkbox':
                var val = el.val();
                if (el.prop('checked') && val.length)
                  values[values.length] = {
                    name: el.attr('name'),
                    value: el.val()
                  };
                break;
              case 'select-one':
              case 'select-multiple':
                el.find('option').each(function () {
                  var option = $(this);
                  if (option.prop('selected') && option.val().length)
                    values[values.length] = {
                      name: el.attr('name'),
                      value: option.val()
                    };
                });
                break;
              default:
                break;
            }
          }
        });
      }
    },

    values2post: function (values) {
      var post = new Object;
      var current = post;
      var i = 0;
      while (i < values.length) {
        var value = values[i].value;
        var name = values[i].name;
        var p = name.indexOf('[');
        if (p != -1) {
          name = values[i].name.substring(0, p);
        }

        if (typeof current[name] != 'undefined' && !$.isArray(current[name])) {
          var first = current[name];
          current[name] = new Array;
          current[name].push(first);
        }

        if ($.isArray(current[name]))
          current[name].push(value);
        else
          current[name] = value;

        current = post;
        i++;
      }

      return post;
    }
  };

  $.komboxInherit('komboxSmartFilter');
});