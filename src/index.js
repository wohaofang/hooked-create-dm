require("./index.scss");
let data = {}
let hooked = {
  init(){
    let me = this
    me.BusEvents()
    me.setData()
    me.vue()
  },
  BusEvents(){
    Bus.$on('shareBoxShow', (val) => data.shareBoxShow = val)
    Bus.$on('isShared', (val) => data.isShared = val)
  },
  setData(){
    data.bg = '//hbpic-10057247.file.myqcloud.com/char/a6c5af4523b1656ee05eb9d9a7e4cc63.png'
    data.chatStyle = 1
    //
    data.hookedData = []
    data.clickIndex = 0
    data.showHooked = []
    data.isContitue = false
    data.contitueUrl = ''
    // if (data.detailIdArr.length > 1) {
    //   data.isContitue = true
    // }
    data.idIdx = 0
    // data.detailId = data.detailIdArr[data.idIdx]
    data.clickDelay = true
    // data.hookedEnd = false

    data.startTime = parseInt(+new Date() / 1000)
    data.setEnd = false
    data.detail = {}
    data.showImg = ''
    data.isShared = 0   //是否分享过 0 正常 1 分享过 2 未分享
    data.sharedTempObj = {}
    data.shareBoxShow = false
    data.weChatStyle = false
    data.scrollRun = false
    /*----来电需求-----*/ 
    data.extensionShow = false  // 来电 是否显示
    
    data.answerShow = false
    data.currentTime = 0
    data.bgm = {
      url:'',
      autoplay:''
    }
  },
  vue(){
    let me = this;
    Vue.component('Hooked', {
      template: require('./hooked.html'),
      created: function () {
      },
      props: ['msg'],
      data: function () {
        $.extend(data, this.msg)
        return {
          data: data
        }
      },
      watch: {
        'data.clickIndex': (val) => {
          Bus.$emit('clickIndex', val)
        },
        'data.hookedEnd': function (val) {
          Bus.$emit('hookedEnd', val)
        },
        'data.shareBoxShow': function (val) {
          Bus.$emit('shareBoxShow', val)
        }
      },
      mounted: function () {
        $('.BigImg').hide()
        this.playBgm()
        setInterval(this.present,500)
      },
      methods: {
        shareJump(id,event){
          event.stopPropagation()
          let url = `http://h5.xintiaotime.com/hooked-h5/hooked.html?id=${id}`
          window.open(url,'_blank')
        },
        changeAvatar(val){
          Bus.$emit('changeAvatar', val)
        },
        bigImgHide(){
          $('.BigImg').hide()
        },
        clickHooked: function () {
          if (data.showHooked.length <= 0) {
            return
          }

          //me.clickFn()
          if (data.clickDelay) {
            me.clickFn()
            data.clickDelay = false;
            setTimeout(function () {
              data.clickDelay = true;
            }, 300)
          }
        },
        showBigImg: function (event, img) {
          event.stopPropagation()
          data.showImg = img
          $('.BigImg').show()
          var image = new Image();
          image.src = img;
          var imgSize = $('#app').width() / image.width;
          // console.log(imgSize)
          var imgHei = image.height * imgSize
          if (imgHei > $('#app').height()) {
            $('.BigImg').addClass('big-img-out')
          } else {
            $('.BigImg').removeClass('big-img-out')
          }
        },
        playAudio: function (event, idx) {
          event.stopPropagation()
          $('.audio').removeClass('audio-playing')
          var arr = document.getElementsByClassName('hooked_audio')
          for (var i = 0; i < arr.length; i++) {
            arr[i].pause()
          }
          $('#audio_div_' + idx).addClass('audio-playing')
          var myVideo = document.getElementById('audio_' + idx);
          myVideo.onended = function () {
            $('#audio_div_' + idx).removeClass('audio-playing')
          }

          myVideo.play()
        },
        /*------------来电----------------*/ 
        playExtension(event,obj,idx){  //  来电Fn
          event.stopPropagation()
          data.extension.value=obj.value
          data.extension.head=obj.head
          data.extension.name=obj.name
          data.extensionShow = true
          document.getElementById('audio').pause()
          this.videoCallAudioPlay(0)
        },
        extensionShowHide(){  // 挂断
          data.extensionShow = false
          data.answerShow = false
          // data.extension.value=''
          data.extension.head=''
          data.extension.name=''
          if(data.bgm.autoplay==1){
            document.getElementById('audio').play()
          }        
          this.videoCallAudioPlay(1)
        },
        videoCallAudioPlay(val){  // 来电准备音乐 val 0 来电音乐  1 挂断音乐 2接听音乐
          let _this = this
          let [videoCallAudio,videoCloseAudio,callResources,videoCallAudio1] = 
          [document.getElementById('videoCallAudio'),document.getElementById('videoCloseAudio'),document.getElementById('call_resources'),document.getElementById('videoCallAudio1')]
          if(val == 0){
            videoCallAudio.play()
          }else if(val == 1){
            videoCallAudio.pause()
            videoCallAudio1.pause()
            videoCallAudio.currentTime = 0.0; 
            callResources.pause()
            callResources.currentTime = 0.0; 
            videoCloseAudio.play()
          }else if(val == 2){
            videoCallAudio.pause()
            videoCallAudio1.pause()
            videoCallAudio.currentTime = 0.0; 
            callResources.play()
            callResources.onended = ()=>{
              _this.extensionShowHide()
            }
          }
        },
        answerPlay(){
          this.videoCallAudioPlay(2)
          data.answerShow = true
        },
        present(){  // 播放时间
          let _this = this
          let callResources = document.getElementById('call_resources')
          let start = Math.floor(callResources.currentTime)
          data.currentTime  = _this.time(start)
        },
        time(val){
          let minute= `0${parseInt(val/60)}`
          let second = val%60
          if(second<=9){
              second=`0${second}`
          }
          let time = `${minute}:${second}`
          return time
        },
        /*---------bgm && scene_bgm---------*/ 
        playBgm() {
          var myAudio = document.getElementById('audio')
          playPause(data.bgm.autoplay)

          function playPause(num) { // 判断是否默认播放 0 播放 1 不播放
            console.log(num)
            if (num == 0) {
              if (navigator.userAgent.match(/(iPhone);?/i)) {
                audioAutoPlay('audio');
                autoPlayAudio1()
              } else {
                myAudio.play()
              }
              data.bgm.autoplay = 1
            } else if (num == 1) {
              data.bgm.autoplay = 0
              myAudio.pause()
            }
          }
          //ios 音乐播放 
          function autoPlayAudio1() {
            wx.config({
              // 配置信息, 即使不正确也能使用 wx.ready
              debug: false,
              appId: '',
              timestamp: 1,
              nonceStr: '',
              signature: '',
              jsApiList: []
            });
            wx.ready(function () {
              document.getElementById('audio').play();
            });
          }

          function audioAutoPlay(id) {
            var audio = document.getElementById(id),
              play = function () {
                audio.play();
                document.removeEventListener("touchstart", play, false);
              };
            audio.play();
            document.addEventListener("WeixinJSBridgeReady", function () {
              play();
            }, false);
            document.addEventListener("touchstart", play, false);
          }
        },
      }
    })

  },
  clickFn(){
    if(data.isEdit){
      return
    }
    var me = this;
    //设置结束的结束
    if (data.setEnd || data.isShared == 2) {
      return
    }
    clearInterval(window.timer)
    var obj
    // 
    if (data.isShared == 0) {
      data.clickIndex++
      obj = data.hookedData[data.clickIndex] || {}
      if (obj.s) {
        //$('.shareBox').show()
        data.shareBoxShow = true
        data.sharedTempObj = obj
        data.isShared = 2
        Bus.$emit('log', {
          name: 'HOOKED_2_SHARE_SET',
          args: data.detailId + ',' + data.clickIndex
        })
        return
      }
    } else {
      obj = data.sharedTempObj
      data.isShared = 0
    }

    if (data.clickIndex == 5) {
      Bus.$emit('topLinkShow')
    }
    /*-----------来电 首次显示---------------*/
    // console.log(obj)
    if(obj.scene){ //场景背景
      data.bg = obj.scene_bg
    }
    if(obj.extension_type){  // 来电
      data.extension.value=obj.extension_value
      data.extension.head=obj.head
      data.extension.name=obj.name
      data.extensionShow = true
      document.getElementById('videoCallAudio').play()
      document.getElementById('audio').pause()
    }
    if(obj.scene_bgm_url){
      if(data.bgm.url != obj.scene_bgm_url){
        data.bgm.url = obj.scene_bgm_url
        // data.bgm.autoplay = 1
        var myAudio = document.getElementById('audio')
        myAudio.load()
        if(!obj.extension_type){
          myAudio.play()
        }
      }
    }
    // 进度条
    let progress = document.getElementById('progress')
    if(obj.idx){
      progress.value = (obj.idx/data.dataLength)*100
    }
  

    if (data.clickIndex == data.hookedData.length - 1) {
      data.hookedEnd = true
      var time = parseInt(+new Date() / 1000)
      time = time - data.startTime
      Bus.$emit('log', {
        name: 'HOOKED_2_END',
        args: data.detailId + ',' + data.clickIndex + ',' + time
      })
    } else if (data.clickIndex < data.hookedData.length - 1) {
      
      Bus.$emit('log', {name: 'HOOKED_2_CLICK', args: data.detailId + ',' + data.clickIndex})
      //如果设置了结束
      if (obj.setEnd == 1) {
        var time = parseInt(+new Date() / 1000)
        time = time - data.startTime
        Bus.$emit('log', {name: 'HOOKED_2_SETEND', args: data.detailId + ',' + data.clickIndex + ',' + time})
        data.setEnd = true
        data.hookedEnd = true
      }
    } else {
      if (data.hookedData.length == 1) {
        data.hookedEnd = true
      }
      return
    }
    data.showHooked.push(obj)
    var timeout=setTimeout(function () {
      var t = $('.list-box').height() - $(window).height() + Number($('.hooked').css('padding-bottom').replace('px',''))
      if (t > 0 && t>window.scrollY) {
        if(data.scrollRun){
          return
        }
        data.scrollRun = true
        var rate = 5//Math.ceil(400/40)
        var scrollStep = Math.ceil((t-window.scrollY)/ (rate));
        function step(){
          window.scrollBy(0, scrollStep);
          // console.log(window.scrollY,t,scrollStep)
          if(window.scrollY<t){
            var timeout2=setTimeout(function () {
              window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
              window.requestAnimationFrame(step)
              window.clearTimeout( timeout2 )
            },rate)
          }
          else{
            data.scrollRun = false
            window.clearTimeout( timeout )
          }
        }
        window.requestAnimationFrame(step)
      }
    }, 250)
  }
}

module.exports = hooked