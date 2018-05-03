'use strict';

require("./index.scss");
var _data = {};
var hooked = {
  init: function init() {
    var me = this;
    me.BusEvents();
    me.setData();
    me.vue();
  },
  BusEvents: function BusEvents() {
    Bus.$on('shareBoxShow', function (val) {
      return _data.shareBoxShow = val;
    });
    Bus.$on('isShared', function (val) {
      return _data.isShared = val;
    });
  },
  setData: function setData() {
    _data.bg = '//hbpic-10057247.file.myqcloud.com/char/a6c5af4523b1656ee05eb9d9a7e4cc63.png';
    _data.chatStyle = 1;
    //
    _data.hookedData = [];
    _data.clickIndex = 0;
    _data.showHooked = [];
    _data.isContitue = false;
    _data.contitueUrl = '';
    // if (data.detailIdArr.length > 1) {
    //   data.isContitue = true
    // }
    _data.idIdx = 0;
    // data.detailId = data.detailIdArr[data.idIdx]
    _data.clickDelay = true;
    // data.hookedEnd = false

    _data.startTime = parseInt(+new Date() / 1000);
    _data.setEnd = false;
    _data.detail = {};
    _data.showImg = '';
    _data.isShared = 0; //是否分享过 0 正常 1 分享过 2 未分享
    _data.sharedTempObj = {};
    _data.shareBoxShow = false;
    _data.weChatStyle = false;
    _data.scrollRun = false;
  },
  vue: function vue() {
    var me = this;
    Vue.component('Hooked', {
      template: require('./hooked.html'),
      created: function created() {},
      props: ['msg'],
      data: function data() {
        $.extend(_data, this.msg);
        return {
          data: _data
        };
      },
      watch: {
        'data.clickIndex': function dataClickIndex(val) {
          Bus.$emit('clickIndex', val);
        },
        'data.hookedEnd': function dataHookedEnd(val) {
          Bus.$emit('hookedEnd', val);
        },
        'data.shareBoxShow': function dataShareBoxShow(val) {
          Bus.$emit('shareBoxShow', val);
        }
      },
      mounted: function mounted() {
        $('.BigImg').hide();
      },
      methods: {
        shareJump: function shareJump(id, event) {
          event.stopPropagation();
          var url = 'https://h5.xintiaotime.com/hooked-h5/hooked.html?id=' + id;
          window.open(url, '_blank');
        },
        changeAvatar: function changeAvatar(val) {
          Bus.$emit('changeAvatar', val);
        },
        bigImgHide: function bigImgHide() {
          $('.BigImg').hide();
        },

        clickHooked: function clickHooked() {
          if (_data.showHooked.length <= 0) {
            return;
          }
          //me.clickFn()
          if (_data.clickDelay) {
            me.clickFn();
            _data.clickDelay = false;
            setTimeout(function () {
              _data.clickDelay = true;
            }, 300);
          }
        },
        showBigImg: function showBigImg(event, img) {
          event.stopPropagation();
          _data.showImg = img;
          $('.BigImg').show();
          var image = new Image();
          image.src = img;
          var imgSize = $('#app').width() / image.width;
          // console.log(imgSize)
          var imgHei = image.height * imgSize;
          if (imgHei > $('#app').height()) {
            $('.BigImg').addClass('big-img-out');
          } else {
            $('.BigImg').removeClass('big-img-out');
          }
        },
        playAudio: function playAudio(event, idx) {
          event.stopPropagation();
          $('.audio').removeClass('audio-playing');
          var arr = document.getElementsByClassName('hooked_audio');
          for (var i = 0; i < arr.length; i++) {
            arr[i].pause();
          }
          $('#audio_div_' + idx).addClass('audio-playing');
          var myVideo = document.getElementById('audio_' + idx);
          myVideo.onended = function () {
            $('#audio_div_' + idx).removeClass('audio-playing');
          };

          myVideo.play();
        }
      }
    });
  },
  clickFn: function clickFn() {
    if (_data.isEdit) {
      return;
    }
    var me = this;
    //设置结束的结束
    if (_data.setEnd || _data.isShared == 2) {
      return;
    }
    clearInterval(window.timer);
    var obj;
    // 
    if (_data.isShared == 0) {
      _data.clickIndex++;
      obj = _data.hookedData[_data.clickIndex] || {};
      if (obj.s) {
        //$('.shareBox').show()
        _data.shareBoxShow = true;
        _data.sharedTempObj = obj;
        _data.isShared = 2;
        Bus.$emit('log', {
          name: 'HOOKED_2_SHARE_SET',
          args: _data.detailId + ',' + _data.clickIndex
        });
        return;
      }
    } else {
      obj = _data.sharedTempObj;
      _data.isShared = 0;
    }

    if (_data.clickIndex == 5) {
      Bus.$emit('topLinkShow');
    }

    if (_data.clickIndex == _data.hookedData.length - 1) {
      _data.hookedEnd = true;
      var time = parseInt(+new Date() / 1000);
      time = time - _data.startTime;
      Bus.$emit('log', {
        name: 'HOOKED_2_END',
        args: _data.detailId + ',' + _data.clickIndex + ',' + time
      });
    } else if (_data.clickIndex < _data.hookedData.length - 1) {
      //console.log('正常')
      Bus.$emit('log', { name: 'HOOKED_2_CLICK', args: _data.detailId + ',' + _data.clickIndex });
      //如果设置了结束
      if (obj.setEnd == 1) {
        var time = parseInt(+new Date() / 1000);
        time = time - _data.startTime;
        Bus.$emit('log', { name: 'HOOKED_2_SETEND', args: _data.detailId + ',' + _data.clickIndex + ',' + time });
        _data.setEnd = true;
        _data.hookedEnd = true;
      }
    } else {
      if (_data.hookedData.length == 1) {
        _data.hookedEnd = true;
      }
      return;
    }
    _data.showHooked.push(obj);
    setTimeout(function () {
      var t = $('.list-box').height() - $(window).height() + Number($('.hooked').css('padding-bottom').replace('px', ''));
      if (t > 0 && t > window.scrollY) {
        var _step = function _step() {
          window.scrollBy(0, scrollStep);
          if (window.scrollY < t) {
            setTimeout(function () {
              window.requestAnimationFrame(_step);
            }, rate);
          } else {
            _data.scrollRun = false;
          }
        };

        if (_data.scrollRun) {
          return;
        }
        _data.scrollRun = true;
        var rate = Math.ceil(400 / 40);
        var scrollStep = Math.ceil((t - window.scrollY) / rate);

        window.requestAnimationFrame(_step);
      }
    }, 250);
  }
};

module.exports = hooked;
