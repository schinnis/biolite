var APP = (function () {

  var app = {}


  /**
   * Module Properties
   *
   * config
   * data
   * $el
   * 
   */
  app = {

    // Config
    config : {
      environment : window.location.href.match(/(localhost)/g) ? 'development' : 'production',
      debug : window.location.href.match(/(localhost)/g) ? true : false,
      debug_plugins : window.location.href.match(/(localhost)/g) ? true : false,
      debug_console: false
    },

    // Data
    data : {
      temp : null,
      binds : {}
    },

    // URLs
    urls : {
      social : {
        facebook : 'https://www.facebook.com/biolitestove',
        twitter : 'https://twitter.com/biolitestove',
        youtube : 'https://www.youtube.com/channel/UCH7vBwioK6P58AqC9Xi1Pjg',
        instagram : 'http://instagram.com/biolitestove',
        pinterest : 'https://www.pinterest.com/biolitestove/'
      }
    },

    // Supports
    supports : {

    },

    // Body Classes
    classes : {
      alert_bar : 'show--alert_bar',
      loader_full : 'show--loader_full',
      modal_overlay : 'show--modal_overlay'
    },

    // Elements
    $el : {
      body : $('body'),

      nav : {
        horizontal : $('.nav-horizontal'),
        sidebar : $('.sidebar__header'),
        product_grid_filter : $('#product-grid-filter')
      },

      sidebar : $('#sidebar'),

      controls : {
        nav : $('*[data-control-nav]'),
        animation : $('*[data-control-animation]'),
        stage_height : $('*[data-control-stage-height]'),
        toggle_icon : $('*[data-control-toggle-icons]'),
        curtain : $('*[data-control-curtain]'),
        expander : $('*[data-control-expander]'),
        display : $('*[data-control-display]'),
        text : $('*[data-control-text]'),
        sibling : $('*[data-control-sibling]'),
        scrollto : $('*[data-control-scrollto]'),
        active_items : $('*[data-control-activeitems]').find('li'),
        modal : $('*[data-control-modal]')
      },

      alerts : {
        bar : $('#alert-bar')
      },

      modals : {
        modal : $('.modal'),
        bay : $('#modals'),
        close : $('.modal--close')
      },

      grid : {
        product : $('#product-grid'),
        story : $('#story-grid')
      },

      toggles : {
        
      },

      sticky : $('*[data-sticky]'),

      sliders : {
        hero_carousel : $('.hero-carousel'),
        hero_carousel_nav : $('.hero-carousel-nav')
      },

      figure : {
        campstove : $('#figure-campstove')
      },

      animation : {
        energy_arc : $('#animation--energy_arc')
      },

      forms : {

        inputs : {
          select : $('.input-select'),
          checkbox : $('.input-checkbox'),
          complex : $('.input-complex')
        }

      },

      debug : $('#debug')
    },

    // Flags
    flag : {
      animating : false
    }
  };



  /**
   * Init
   */
  app.init = function () {
    
    this.pluginsInit()
    this.cookies()
    this.events()
    this.modals()
    this.forms.init()
    this.touchEvents()
    this.animations.init()
    this.dataControls.init()
    this.animationFrames()
    
    // Debug APP Object
    if ( app.config.debug ) { console.log(app) }
    // Debug Console
    if ( app.config.debug_console ) {
      
      this.debug({
        coords : true,
        viewport: true,
        events : false,
        ajax : true
      })  
    }

  }




  /**
   * Plugins Init
   */
  app.pluginsInit = function () {
    
    // Read bower dependencies
    if ( !app.config.debug_plugins ) {

      var pluginsList = '';

      $.ajax({ url: '../bower.json' })
        .done(function (data) {
          
          var dependencies = [];

          $.each(data.dependencies, function (name, version) {
            pluginsList += name + ', ';

            dependencies.push( { component : name, version : version } )
          })

          // console.log('%cCOMPONENTS LOADED', 'color:#45b0d7', '- '+pluginsList)

          console.table(dependencies)

        })
        .fail(function() {
          console.log('error');
        })
    }


    // jquery.easing.js
    // https://github.com/danro/jquey-easing
    if ( $.easing ) {

      jQuery.easing.def = 'string';
      
    }

    // jquery.countTO.js
    // https://github.com/mhuggins/jquery-countTO
    if ( $.fn.countTo ) {

      $('.countto').countTo({
        speed : 1500,
        refreshInterval : 75,
        onUpdate: function (value) {
            var counter = $(this).text()
            $(this).text(counter.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
        }
      });

    }

    // jquery.sticky.js
    // https://github.com/garand/sticky
    if ( $.fn.sticky() ) {
      
      var $window = $(window);

      var stickyElements = [ app.$el.sticky ];

      stickyElements.forEach(function (element) {

        var unstickPoint = element.data('unstick') || false;

        // init sticky
        element.sticky({
          topSpacing : 0
        })

        // init unstick
        if ( unstickPoint ) {
          
          $window.scroll(function() {
            var scrollTop = $window.scrollTop()

            console.log(scrollTop, unstickPoint)
          })

        }

      })

    }

    // jquery.cookie.js
    // 
    if ( $.cookie ) {

    }

    // jquery.flexslider.js
    if ( $.fn.flexslider.length > 0 ) {

      app.sliders()

    }


    // wow.js
    // https://github.com/matthieua/WOW
    if ( window.WOW ) {

      new WOW().init()
      
    }

    // walkway.js
    // https://github.com/ConnorAtherton/walkway
    if ( window.Walkway ) {

    }

    // jquery.isotope.js
    // https://github.com/metafizzy/isotope
    if ( $.fn.isotope ) {

      app.isotope.init()
    }


  }



  



  /**
   * Events
   */
  app.events = function () {


    // Toggle sidebar
    $(document).delegate('.toggle__sidebar', 'click', function (event) {
      event.preventDefault()
      
      var $this = $(this)

      app.$el.sidebar.toggleClass('show')

      if ( app.config.debug ) console.log('%cEVENT', 'color:#3d8627', '- toggle #sidebar')

    })



    // Remove Cart Item
    $(document).delegate('.cart-item--remove', 'click', function (event) {

      event.preventDefault()
      
      var $this = $(this),
          item  = $(this).parent().parent()

      item
        .addClass('animated fadeOutRightBig')

      setTimeout(function() {
        item.remove()
      }, 500)

      // setTimeout(function() {
      //   item.animate({
      //     height : '0px'
      //   })
      // }, 150)

      if ( app.config.debug ) console.log('%cEVENT', 'color:#3d8627', '- cart item removed')
    })
    
  }





  /**
   * Modals
   */
  app.modals = function() {

      var modal = app.$el.modals.modal;

      // Move all modals on page into modal bay
      modal.appendTo(app.$el.modals.bay)

      // Click event
      $(document).delegate(app.$el.controls.modal.selector, 'click', function (event) {

        event.preventDefault()

        var modalID = $(this).data('control-modal');

        modalShow(modalID);
      })

      // Add close event listener - ESC
      $(document).on('keyup', function (event) {
        
        event.preventDefault()
        
        var activeModal = $('.modal.show').attr('id'),
            activeModalID = '#'+activeModal;

        if ( activeModal !== undefined ) {
          // Check if ESC key
          if ( event.keyCode == 27 ) {
            modalClose(activeModalID)
          }

          if ( app.config.debug ) console.log('%cEVENT', 'color:#3d8627', '- toggle '+activeModalID+' by keyup ESC')
        }
      })

      // Add close event listener - .modal--close
      $(document).delegate(app.$el.modals.close.selector, 'click', function (event) {
        
        event.preventDefault()

        var activeModal = $('.modal.show').attr('id'),
            activeModalID = '#'+activeModal;

        if ( activeModal !== undefined ) {
          modalClose(activeModalID)
        }

        if ( app.config.debug ) console.log('%cEVENT', 'color:#3d8627', '- toggle '+activeModalID+' by click on '+app.$el.modals.close.selector)
      })



      /**
       * modalShow
       * @param  {String} targetID 
       */
      function modalShow(targetID) {

        var targetID = targetID || null;

        // Toggle body class
        app.$el.body.toggleClass(app.classes.modal_overlay)

        // Toggle modal class
        $(targetID).toggleClass('show')

        if ( app.config.debug ) console.log('%cDATA-CONTROL', 'color:#d2a946', '- firing modal with ID '+targetID)
        

      }


      /**
       * modalClose
       * @param  {String} targetID 
       */
      function modalClose(targetID) {

        var targetID = targetID || null;

        // Toggle body class
        app.$el.body.toggleClass(app.classes.modal_overlay)

        // Toggle modal class
        $(targetID).toggleClass('show')

      }

  }



  /**
   * Forms
   */
  app.forms = {

    init: function() {

      this.inputSelect()
    },

    inputSelect: function() {

      var select = app.$el.forms.inputs.select.find('select')

      $(document).delegate(select.selector, 'change', function (event) {

        var label = $(this).parent().find('label > span'),
            selection = event.currentTarget.value;

        label.html(selection)

      })


    }


  }





  /**
   * Touch Events
   */
  app.touchEvents = function() {



  }



  

  /**
   * Sliders
   */
  app.sliders = function() {

    /**
     * Hero Carousel
     */
    if ( app.$el.sliders.hero_carousel.length > 0 ) {

      app.$el.sliders.hero_carousel.flexslider({
        animation: 'slide',
        directionNav : false,
        animationLoop: false,
        slideshow: true,
        startAt: 0,
        slideshowSpeed : 7000,
        animationSpeed: 350,
        controlNav: 'thumbnails',

        init: function(slides) {


        },

        start: function(slides) {

          slides.parent().addClass('show')

          var thumb = slides.find('.flex-control-thumbs li')

          thumb.each(function (i, obj) {

            var $this    = $(this),
                thumbImg = $this.find('img'),
                thumbURL = thumbImg.attr('src')

            // remove the image inside of it and make it the <li> bg
            $this.attr('style', 'background-image:url("'+thumbURL+'")');

            // append a div
            $this.append('<div />');

          })

          // add active class to first
          $(thumb).first().addClass('active')
        },
        after: function(slides) {

          var activeThumb = slides.find('.flex-control-thumbs li img.flex-active')

          activeThumb.parent().siblings().removeClass('active')
          activeThumb.parent().addClass('active')
        }
      })

      // click event for change active class elements
      $('.hero-carousel .flex-control-thumbs li').click(function (event) {
          var $this = $(this),
              img   = $this.find('img')

          $this.siblings().removeClass('active')
          $this.addClass('active')
      })

    }

  }


  
  

  /**
   * Animations
   */
  app.animations = {

    init : function() {

      // this.alertBar()

    },

    /**
     * CampStove Progress 
     */
    campStoveProgress : function() {
      // Figure Campstove
      var $campstoveStageProgress = app.$el.figure.campstove.find('.figure-campstove__stages-bar'),
          $campstoveStage1        = $('#figure-campstove--stage-1'),
          $campstoveStage2        = $('#figure-campstove--stage-2'),
          $campstoveStage3        = $('#figure-campstove--stage-3');

      if ( app.flag.animating ) {
        // Stage 1
        animationLoop()
      }

      function animationLoop() {

        $campstoveStageProgress.addClass('stage-1')
        $campstoveStage1.fadeIn(2000)
        
        setTimeout(function() {
          $campstoveStageProgress.addClass('stage-2')
          $campstoveStage2.fadeIn(2000)  
        }, 2000)

        setTimeout(function() {
          $campstoveStageProgress.addClass('stage-3')
          $campstoveStage3.fadeIn(2000)  
        }, 4000 )

        setTimeout(function() {
          // $campstoveStageProgress.removeClass('stage-1 stage-2 stage-3')
          // animationLoop()
          
          $campstoveStageProgress.fadeOut(1500)

          app.flag.animating = false;
        }, 6000)
      }
    },


    /**
     * Energy Arc
     */
    energyArc: function() {

      if ( app.flag.animating ) {
        
        setTimeout(function() {

          app.$el.animation.energy_arc.addClass('show')

        }, 500)
      }

    },


    /**
     * Alert Bar
     */
    alertBar: function() {

      app.$el.body.addClass('show--alert_bar')


    }

    
  }

  





  











  /**
   * Cookies
   */
  app.cookies = function () {
    
    
  }

  



  /**
   * Data Controls
   */
  app.dataControls = {

    init : function() {

      this.stageHeight()
      this.controlNavs()
      this.controlAnimation()
      this.toggleIcon()
      this.controlCurtain()
      this.controlExpander()
      this.controlDisplay()
      this.controlText()
      this.controlSibling()
      this.controlScrollTo()
      this.controlActiveItems()

    },

    /**
     * Control Navs
     * data-control-nav
     * data-control-targets
     */
    controlNavs: function() {

      // set up event bindings
      app.$el.controls.nav.each(function (i, el) {
        
        var $this           = $(this),
            navItems        = $this.find('li'),
            controlTargets  = $this.data('control-targets')
            index           = 0,
            transitionSpeed = 100;

        // set active class on first nav item
        navItems.first().addClass('active')

        // show first item
        // $(controlTargets).find('li:first-child').fadeIn(transitionSpeed)
        $(controlTargets).find('li:first-child').show()
        

        // set up click event
        navItems.on('click', function (event) {

          var $self = $(this);
          
          // set scoped index based on clicked index        
          index = $self.index()

          // set active classes on nav
          $self.siblings().removeClass('active')
          $self.addClass('active')

          // split them from comma separator
          if ( controlTargets.indexOf(',') ) {
            
            var target = controlTargets.split(',')
            
            target.forEach(function (selector, x) {
                  
                var $targetItem = $(selector).find('li').eq(index)

                $targetItem.siblings().stop().hide()
                // $targetItem.stop().delay(transitionSpeed+5).fadeIn(transitionSpeed)
                $targetItem.stop().show()

            })

          } else {
            
            var $targetItem = $(controlTargets).find('li').eq(index)

            $targetItem.siblings().stop().fadeOut(transitionSpeed)
            $targetItem.stop().delay(transitionSpeed+5).fadeIn(transitionSpeed)

          }

        })

      })

    },




    /**
     * Control Animation
     * data-control-animation
     */
    controlAnimation: function() {

      // set up event bindings
      $(document).delegate(app.$el.controls.animation.selector, 'click', function (event) {

        var $this = $(this),
            controlTarget = $this.data('control-animation-target'),
            animationClass = $this.data('control-animation-class')

        $(controlTarget)
          .stop()
          .removeClass('animated')
          .removeClass(animationClass)
          .addClass('animated '+animationClass)

        if ( app.config.debug ) console.log('%cDATA-CONTROL', 'color:#d2a946', '- added class "'+animationClass+'" on "'+controlTarget+'"')

      })

    },



    /**
     * Stage Height
     * data-control-stage-height
     */
    stageHeight: function() {

      $(document).delegate(app.$el.controls.stage_height.selector, 'click', function (event) {

        var $this = $(this),
            ww    = $(window).width(),
            wh    = $(window).height()

        $this.width(ww).height(wh)

      })

    },


    /**
     * Icon Toggle
     */
    toggleIcon: function() {

      $(document).delegate(app.$el.controls.toggle_icon.selector, 'click', function (event) {

        var $this       = $(this),
            $icon       = $this.find('.fa'),
            iconClasses = $this.data('control-toggle-icons')

        var icons = iconClasses.split(',')

        $icon
          .toggleClass(icons[0])
          .toggleClass(icons[1])

      })

    },

    /**
     * Control Curtain
     */
    controlCurtain: function() {

      $(document).delegate(app.$el.controls.curtain.selector, 'click', function (event) {

        var $this            = $(this),
            targetCurtainId = $this.data('control-curtain'),
            $targetCurtain  = $(targetCurtainId)

        $targetCurtain.toggleClass('show')

        if ( app.config.debug ) console.log('%cDATA-CONTROL', 'color:#d2a946', '- curtains on '+targetCurtainId)

      })

    },


    /**
     * Control Display
     */
    controlDisplay: function() {

      $(document).delegate(app.$el.controls.display.selector, 'click', function (event) {

        var $this            = $(this),
            targetDisplayId = $this.data('control-display'),
            $targetDisplay  = $(targetDisplayId)

        $targetDisplay.toggle()

        if ( app.config.debug ) console.log('%cDATA-CONTROL', 'color:#d2a946', '- display toggle on '+targetDisplayId)

      })

    },



    /**
     * Control Text
     */
    controlText: function() {

      $(document).delegate(app.$el.controls.text.selector, 'click', function (event) {

        var $this        = $(this),
            text         = $this.data('control-text').split(','),
            $targetText  = $this.find('*[data-control-text-target]'),
            currentText  = $targetText.text()

          if ( currentText == text[0] ) {
            $targetText.text(text[1])
          } else {
            $targetText.text(text[0])
          }

      })

    }, 



    /**
     * Control Sibling
     */
    controlSibling: function() {

      $(document).delegate(app.$el.controls.sibling.selector, 'click', function (event) {

        var $this            = $(this),
            $targetSibling   = $this.siblings(0);

        $targetSibling.toggle()

      })

    },


    /**
     * Control Expander
     */
    controlExpander: function() {

      $(document).delegate(app.$el.controls.expander.selector, 'click', function (event) {


        var $this            = $(this),
            targetExpanderId = $this.data('control-expander'),
            $targetExpander  = $(targetExpanderId)

        $targetExpander.toggleClass('show')

        if ( app.config.debug ) console.log('%cDATA-CONTROL', 'color:#d2a946', '- expander on '+targetExpanderId)

      })

    },


    

    /**
     * Control ScrollTo
     */
    controlScrollTo: function() {

      $(document).delegate(app.$el.controls.scrollto.selector, 'click', function (event) {

        event.preventDefault()

        var $this            = $(this),
            targetElementId  = $this.data('control-scrollto'),
            $targetElement   = $(targetElementId)

        var options = {
          offset : $this.data('control-scrollto-offset') || 0,
          duration : Math.floor( Math.abs($(window).scrollTop() - $targetElement.offset().top) / 2.75 ),
          // easing : $.easing ? 'easeInOutExpo' : 'swing'
          easing : 'swing'
        }

        if ( $targetElement.length > 0 ) {
          
          scrollToElement({
            target : targetElementId,
            offset : options.offset,
            easing : options.easing,
            duration : options.duration
          })

          if ( app.config.debug ) console.log('%cDATA-CONTROL', 'color:#d2a946', '- scrollto element '+targetElementId, options.offset, (options.duration / 1000)+'s', options.easing)
          
        } else {
          if ( app.config.debug ) console.log('%cERROR : DATA-CONTROL', 'color:#eb1817', '- scrollto element '+targetElementId+' does not exist' + options.offset)
        }

      })

    },


    /**
     * Control Active Items
     */
    controlActiveItems: function() {

      $(document).delegate(app.$el.controls.active_items.selector, 'click', function (event) {

        var $this = $(this)

        $this.siblings().removeClass('active')
        $this.addClass('active')

      })

    },





  }





  /**
   * Isotope
   */
  app.isotope = {

    init: function() {
      this.setup()
      this.events()
    },

    /**
     * Events
     * click events to filter
     */
    events: function() {

      $(document).delegate('.isotope-filter', 'click', function (event) {
          event.preventDefault();

          var $this       = $(this),
              $navItem    = $this.parent(),
              filterClass = $(this).data('filter');

          // Swap active classes
          $navItem.siblings().removeClass('active')
          $navItem.addClass('active')

          // Filter isotope - PRODUCT
          if ( app.$el.grid.product.length > 0 ) {
            scrollToElement({
              target : '#product-grid',
              offset : 100
            })
            app.$el.grid.product.isotope({
                filter : filterClass
            })
          }
          // Filter isotope - STORY
          if ( app.$el.grid.story.length > 0 ) {
            scrollToElement({
              target : '#story-grid',
              offset : 100
            })
            app.$el.grid.story.isotope({
                filter : filterClass
            })
          }

          // Debug
          if ( app.config.debug ) console.log('%cISOTOPE FILTER', 'color:#9267d2', '- '+filterClass)
      })

    },

    /**
     * Setup
     * Invoke isotope with defaults
     */
    setup: function() {

      // Setup isotope - STORY
      app.$el.grid.story.isotope({
          itemSelector : '.story-grid-item',
          layoutMode: 'packery',
          resizesContainer: false,
          transitionDuration: '0.25s'
      });

      // Setup isotope - PRODUCT
      app.$el.grid.product.isotope({
          itemSelector: '.product-grid-item',
          layoutMode: 'packery',
          resizesContainer: false,
          transitionDuration: '0.25s'
      })


    }

  }









  /**
   * Full Page Loader
   */
  app.fullPageLoader = function () {
    
    // Landing page loading
    if ( window.location.pathname == '/' || window.location.pathname.indexOf('index') > -1 ) {
      
      if ( document.body.classList && document.body.classList.contains('show--loader_full') ) {

        $('#svg-biolite').stop().show()

        var svg = new Walkway({
          selector: '#svg-biolite',
          duration: 750
        }).draw(function () {
          
          if ( app.config.debug ) console.log('%cCALLBACK', 'color:#dca44d', '- walkway.js on \'#svg-biolite\'')

        });

        setTimeout(function() {

          var el = document.getElementById('svg-biolite--clone')
              el.classList.add('show')

        }, 650)

        setTimeout(function() {
          
          $('body').removeClass('show--loader_full')

        }, 1750)

      }

    }

  }
 




  /**
   * animationFrames
   */
  app.animationFrames = function(){

      var scroll = window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   // IE Fallback, you can even fallback to onscroll
                   function(callback){ window.setTimeout(callback, 1000/60) };

      var lastPosition = -1;

      function animationLoop(){
          // Avoid calculations if not needed
          if (lastPosition == window.pageYOffset) {
              scroll(animationLoop);
              return false;
          } else lastPosition = window.pageYOffset;

          // Animation - Energy Arc
          if ( app.$el.animation.energy_arc.length > 0 && app.$el.animation.energy_arc.visible() ) {

            app.flag.animating = true;
            app.animations.energyArc()
          }
          
          scroll( animationLoop );
      }



      // init loop
      animationLoop();

  };



  /**
   * Storage
   */
  app.storage = {

    init : function() {

      if ( this.checkSupport() ) {
        App.data.supports.localStorage = true;
      } else {
        App.data.supports.localStorage = false;
      }

    },

    checkSupport : function() {
      try {
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    },


    set : function(key, value) {

      if ( typeof value === 'object' ) {
        value = JSON.stringify(value);

      }

      localStorage.setItem(key, value);
    },

    get : function(key) {
      var data;

      if ( !this.hasData(key) ) {
        return false;
      }

      data = localStorage[key];

      // if json, try to parse
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }

    },

    getAll : function() {

      var archive = {},
          keys    = Object.keys(localStorage);

      for (var i=0; i < keys.length; i++) {
         archive[ keys[i] ] = localStorage.getItem( keys[i] );
      }

      return archive;
    },

    hasData : function(key) {
      return !!localStorage[key] && !!localStorage[key].length;
    }

  }







  /**
   * Debug
   */
  app.debug = function(options) {

    // Append debugger
    $('body').append('<div id="toggle--debug" data-control-display="#debug" data-control-toggle-icons="fa-expand, fa-times"><i class="fa fa-expand"></i></div>')
    $('body').append('<div id="debug"></div>')

    /**
     * Options
     *
     * page_coords
     * click events
     * ajax calls
     */
    var options = options || {}

    // Page Coords
    if ( options.coords ) {

      $('#debug').append(' \
        <table> \
          <thead><tr><td>Page Coordinates</td><td></td></tr></thead> \
          <tr><td>innerHeight</td> <td><span class="color-number" id="debug__coords--innerHeight">0</span></td></tr> \
          <tr><td>innerHeight</td> <td><span class="color-number" id="debug__coords--innerWidth">0</span></td></tr> \
          <tr><td>pageYOffset</td> <td><span id="debug__coords--pageYOffset">0</span></td></tr> \
        </table> \
      ')

      $(window).on('resize scroll', function (event) {

        $('#debug__coords--pageYOffset').text(window.pageYOffset.toString())
        $('#debug__coords--innerHeight').text(window.innerHeight.toString())
        $('#debug__coords--innerWidth').text(window.innerWidth.toString())
        
      })
    
    }

    // In Viewport
    if ( options.viewport ) {

      $('#debug').append(' \
        <table> \
          <thead><tr><td>Top of Viewport</td><td></td></tr></thead> \
          <tbody id="debug__viewport"></tbody> \
        </table> \
      ')

      $(window).on('resize scroll', function (event) {

        $('#wrap > section').each( function (i, el) {

          var $this          = $(this),
              className      = $this[0].classList[0],
              elID           = '#'+$this[0].id,
              pageYOffset    = window.pageYOffset,
              elementYOffset = $this.offset().top;

          if ( pageYOffset >= elementYOffset ) {
            
            $('#debug__viewport').html('\
              <tr><td><span>'+ elID +'</span> '+ className + '</td><td>'+elementYOffset+'</td></tr> \
            ')
          }

        })
        
      })
    
    }

  }
 










  /**
   * DOCUMENT READY
   * -------------------------------------------------------------------
   *
   */
  $(document).ready(function(){
      
    app.init();

  });

 


  /**
   * WINDOW LOAD
   * -------------------------------------------------------------------
   *
   */
  $(window).load(function(){
      
    app.fullPageLoader()

  });

  /**
   * WINDOW SCROLL
   * -------------------------------------------------------------------
   *
   */
  $(window).on('scroll', function(){

      

      // Figure - CampStove
      // if ( app.$el.figure.campstove.length > 0 && app.$el.figure.campstove.visible() ) {
        
      //   app.flag.animating = true;
      //   app.animations.campStoveProgress()

      // }

  });


  /**
   * WINDOW RESIZE
   * -------------------------------------------------------------------
   *
   */
  $(window).resize(function(){   
      


  }).trigger('resize');



  /**
   * MATCH MEDIA
   * -------------------------------------------------------------------
   *
   */
  // var mq_widescreen = window.matchMedia('only screen and (min-width:'+app.config.media_queries.widescreen+'px)');

  // mq_widescreen.addListener(function (mql) {
      

  // });



  /**
   * ORIENTATION CHANGE (requires jQuery mobile)
   * -------------------------------------------------------------------
   *
   */
  window.addEventListener("orientationchange", function() {
      
      

  }, false);




  /**
   * SELF INVOKING ANONYMOUS FUNCTION
   * -------------------------------------------------------------------
   * 
   */
  (function(){ 

        

  })(); 












  /**
   * Private Method Example
   */
  function privateMethod() {
    // ...
  }



  /**
   * inViewport
   */
  function inViewport(el) {
    var top    = el.offsetTop,
        left   = el.offsetLeft,
        width  = el.offsetWidth,
        height = el.offsetHeight;

    while( el.offsetParent ) {
      el   = el.offsetParent
      top  += el.offsetTop
      left += el.offsetLeft
    }

    return (
      top >= window.pageYOffset &&
      left >= window.pageXOffset &&
      (top + height) <= (window.pageYOffset + window.innerHeight) &&
      (left + width) <= (window.pageXOffset + window.innerWidth)
    )
  }

  /**
   * scrollToElement
   */
  function scrollToElement(options){

      var duration  = options.duration || 250,
          easing    = options.easing || 'swing',
          offset    = options.offset || 0;

      var target    = options.target || false;

      if(target){
          if(/(iPhone|iPod)\sOS\s6/.test(navigator.userAgent)){
              $('html, body').animate({
                  scrollTop: $(target).offset().top
              }, duration, easing);
          } else {
              $('html, body').animate({
                  scrollTop: $(target).offset().top - (offset)
              }, duration, easing);
          }
      }
  }
  










  return app;
}());