(function ($) {
  function Spriteshow($elem, options) {
    this.$elem = $elem;
    this.options = options;

    this.$target = this.options.target || $elem;
    if (this.options.sprite_orientation && this.options.sprite_orientation === 'horizontal') {
      this.offset = this.$target.width();
    } else {
      this.offset = this.$target.height();
    }
    this.index = 0;
    this.playing = true;

    if (this.options.index_control) {
      this.$index_control_children = this.options.index_control.children();
    } else {
      this.$index_control_children = $([]);
    }

    if (!this.options.should_autoadvance_callback) {
      this.options.should_autoadvance_callback = function () { return true; };
    }

    this.number = this.options.number || this.$index_control_children.length;

    this.update_offset();
    this._attach();

    var _this = this;
    if (options.play_delay) {
      this.playing_timer();
    }
  }

  $.fn.spriteshow = function (options) {
    options = options || {};
    return $(this).each(function () {
      var spriteshow = $(this).data('spriteshow');
      if (!spriteshow) {
        spriteshow = new Spriteshow($(this), options);
        $(this).data('spriteshow', spriteshow);
      }
    });
  };

  $.extend(Spriteshow.prototype, {
    _attach: function () {
      var _this = this;
      this.$index_control_children.click(function (e) {
        e.preventDefault();
        _this.set_index($(this).index());
        _this.pause();
      });
      if (this.options.controls) {
        this.options.controls.children('.left').click(function (e) {
          e.preventDefault();
          _this.page_left();
          _this.pause();
        });
        this.options.controls.children('.right').click(function (e) {
          e.preventDefault();
          _this.page_right();
          _this.pause();
        });
        this.options.controls.children('.play-pause').click(function (e) {
          if (_this.playing) {
            _this.pause();
          } else {
            _this.play();
          }
        });
      }
    },
    update_offset: function () {
      var _this = this,
        $new_image = $([]);
      if (this.options.effect === 'fade') {
        $new_image = this.$target.clone();
        this.$target.css('position', 'absolute');
        this.$target.after($new_image);
        this.$target.fadeOut(function () {
          $(this).remove();
        });
        this.$target = $new_image;
      }

      this.current_offset = this.index * this.offset;
      if (this.options.sprite_orientation && this.options.sprite_orientation === 'horizontal') {
        this.$target.css('background-position', '-' + this.current_offset + 'px 0');
      } else {
        this.$target.css('background-position', '0 -' + this.current_offset + 'px');
      }
    },
    set_index: function (index) {
      this.index = index;
      this.$index_control_children.removeClass('selected');
      this.$index_control_children.filter(':eq(' + index + ')').addClass('selected');
      this.$target.trigger('spriteshow:index', [index]);
      this.update_offset();
    },
    page_left: function () {
      var target_index = this.index - 1;
      if (target_index < 0) {
        target_index = this.number - 1;
      }
      this.set_index(target_index);
    },
    page_right: function () {
      var target_index = this.index + 1;
      if (target_index >= this.number) {
        target_index = 0;
      }
      this.set_index(target_index);
    },
    playing_timer: function () {
      var _this = this;
      this.play_timeout = setTimeout(function () {
        if (_this.playing && _this.options.should_autoadvance_callback()) {
          _this.page_right();
        }
        if (_this.options.pause_when_behind_by) {
          var right_now = (new Date()).getTime();
          if (_this.last_play_date && Math.abs(_this.last_play_date - right_now - _this.options.play_delay) > _this.options.pause_when_behind_by) {
            if (!_this.slow_strikes) {
              _this.slow_strikes = 0;
            } else {
              _this.slow_strikes += 1;
            }
            if (_this.slow_strikes > 3) {
              _this.pause();
            }
          } else {
            _this.slow_strikes = 0;
          }
          _this.last_play_date = right_now;
        }
        _this.playing_timer();
      }, this.options.play_delay);
    },
    play: function () {
      this.playing = true;
      if (this.options.controls) {
        this.options.controls.children('.play-pause').removeClass('spriteshow-play').addClass('spriteshow-pause');
      }
    },
    pause: function () {
      this.playing = false;
      if (this.options.controls) {
        this.options.controls.children('.play-pause').removeClass('spriteshow-pause').addClass('spriteshow-play');
      }
    }
  });

}(jQuery));
