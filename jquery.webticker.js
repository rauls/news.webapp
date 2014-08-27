/*!
 * webTicker 2.1.1
 * Examples and documentation at: 
 * http://jonmifsud.com/open-source/jquery/jquery-webticker/
 * 2011 Jonathan Mifsud
 * Version: 2.1.1 (23-MAY-2013)
 * Dual licensed under the Creative Commons and DonationWare licenses:
 * http://creativecommons.org/licenses/by-nc/3.0/
 * https://github.com/jonmifsud/Web-Ticker/blob/master/licence.md
 * Requires:
 * jQuery v1.4.2 or later
 * 
 */

(function( $ ){

	var cssTransitionsSupported = (function() {
	    var s = document.createElement('p').style, 
	        v = ['ms','O','Moz','Webkit']; 
	        

	    if( s['transition'] == '' ) return true; 
	    while( v.length ) {
	        if( v.pop() + 'Transition' in s )
	            return true;
        }

	    console.dir("cssTransitionsSupported() ", s);
	    return false;
	})();

	function scrollitems($strip,moveFirst){
		var settings = $strip.data('settings');
		if (typeof moveFirst === 'undefined')
			moveFirst = false;
		if (moveFirst){
			moveFirstElement($strip);
		}
		
		$.log("scrollitems()");
		
		var options = animationSettings($strip);
		$strip.animate(options.css, options.time, "linear", function(){
			$strip.css(settings.direction, '0');
			scrollitems($strip,true);
		});
	}

	function animationSettings($strip){
		var settings = $strip.data('settings');
		var first = $strip.children().first();
		var distance =  Math.abs(-$strip.css(settings.direction).replace('px','').replace('auto','0') - first.outerWidth(true));
		var settings = $strip.data('settings');
		var timeToComplete = distance * 1000 / settings.speed;
		var animationSettings = {};
		
		$.log("animationSettings() time="+timeToComplete);
		animationSettings[settings.direction] = $strip.css(settings.direction).replace('px','').replace('auto','0') - distance;
		return {'css':animationSettings,'time':timeToComplete, 'distance': distance };
	}

	function moveFirstElement($strip){
		var settings = $strip.data('settings');
		$strip.css('transition-duration','0s').css(settings.direction, '0');
		
		$.log("moveFirstElement()");
		var $first = $strip.children().first();
		if ($first.hasClass('webticker-init'))
			$first.remove();
		else 
			$strip.children().last().after($first);
	}

	function css3Scroll($strip,moveFirst){
		if (typeof moveFirst === 'undefined')
			moveFirst = false;
		if (moveFirst){
			moveFirstElement($strip);
		}
		var settings = $strip.data('settings');
		var options = animationSettings($strip);
		var time = options.time/1000;
		time += 's'; 
		$.log( settings.id + "> css3Scroll() transition-duration = "+time + " speed="+settings.speed + ", distance="+options.distance );
		$strip.css(options.css).css('transition-duration',time);
	}

	function updaterss(rssurl,type,$strip,logo){
		var list = '';
		$.log("upatersss()  get XL from " + rssurl );
		$.get(rssurl, function(data) {
		    var $xml = $(data);
		    
			if( ! logo ) {
				var url = $xml.find("url");
				if( url ) {
					logo = url.text();
				}
				$xml.find("image").each(function() {
					var $this = $(this);
					var url = $this.find("url");
					if( url ) {
						logo = url.text();
					}
				});
			}
			
		    $xml.find("item").each(function(ret) {
		        var $this = $(this),
		            item = {
		                title: $this.find("title").text(),
		                link: $this.find("link").text()
		        }
				
				if( ! item.link || item.link == "" ) {
					var link = $this.find("link");
					var ns = link.nextSibling;
					//var c = $this.children[1].nextSibling.data;
					item.link = $this.find("guid").text()
				}
				
				if( ! item.link || item.link == "" ) {
					var desc = $this.find("description").html()
					var http_pos = desc.indexOf("http://");
					if( http_pos > 0 ) {
						var link = desc.substring( http_pos, desc.length );
						item.link = link.substring(0, link.indexOf('"') );
					}
				}
				
		        listItem = "<li>";
				if( logo )  {
					listItem += "<img class='logo' src='"+logo+"' height='22' border='0'>";
				}
				if( item.title.indexOf("CDATA") >0 ) {
				    item.title = item.title.substring(9, item.title.length - 3 );
				}
		        listItem += "<a href='"+item.link+"'>"+item.title+"</a></li>";
		        list += listItem;
				
				log("Added text >"+ item.title + " and LINK to " + item.link );
		        //Do something with item here...
		    });
			$strip.webTicker('update', list, type);
		});
	}

	function initalize($strip){
		var settings = $strip.data('settings');
		
		$strip.width('auto');
		
		//Find the real width of all li elements
		var stripWidth = 0;
		$strip.children('li').each(function(){
			stripWidth += $(this).outerWidth( true );
			$.log("text="+ $(this).text() );
		}); 
		
		$.log("initalize() stripWidth="+stripWidth);
		
		if(stripWidth < $strip.parent().width() || $strip.children().length == 1){
			//if duplicate items
			if (settings.duplicate){
				//Check how many times to duplicate depending on width.
				itemWidth = Math.max.apply(Math, $strip.children().map(function(){ return $(this).width(); }).get());
				while (stripWidth - itemWidth < $strip.parent().width() || $strip.children().length == 1){
					var listItems = $strip.children().clone();
					$strip.append(listItems);
					stripWidth = 0;
					$strip.children('li').each(function(){
						stripWidth += $(this).outerWidth( true );
					});
					itemWidth = Math.max.apply(Math, $strip.children().map(function(){ return $(this).width(); }).get());
				}
			}else {
				//if fill with empty padding
				var emptySpace = $strip.parent().width() - stripWidth;
				emptySpace += $strip.find("li:first").width();
				var height = $strip.find("li:first").height();

				$strip.append('<li class="ticker-spacer" style="width:'+emptySpace+'px;height:'+height+'px;"></li>');
			}
		}
		if (settings.startEmpty){
			var height = $strip.find("li:first").height();
			$strip.prepend('<li class="webticker-init" style="width:'+$strip.parent().width()+'px;height:'+height+'px;"></li>');
		}
		//extra width to be able to move items without any jumps	$strip.find("li:first").width()	

		stripWidth = 0;
		$strip.children('li').each(function(){
			stripWidth += $(this).outerWidth( true );
		});	
		$strip.width(stripWidth+200);
		widthCompare = 0;
		$strip.children('li').each(function(){
			widthCompare += $(this).outerWidth( true );
		});	
		//loop to find weather the items inside the list are actually bigger then the size of the whole list. Increments in 200px.
		//only required when a single item is bigger then the whole list
		while (widthCompare >= $strip.width()){
			$strip.width($strip.width()+200);
			widthCompare = 0;
			$strip.children('li').each(function(){
				widthCompare += $(this).outerWidth( true );
			});	
		}
		$.log("initalize() widthCompare = " + widthCompare );
	}

  var methods = {
    init : function( settings ) { // THIS 
		settings = jQuery.extend({
			speed: 50, //pixels per second
			direction: "left",
			moving: true,
			startEmpty: true,
			duplicate: false,
			rssurl: false,
			hoverpause: true,
			rssfrequency: 0,
			updatetype: "reset"
		}, settings);
		//set data-ticker a unique ticker identifier if it does not exist
		return this.each(function(){
			jQuery(this).data('settings',settings);
			
			    console.log("init()");

				var $strip = jQuery(this);
				$strip.addClass("newsticker");
				var $mask = $strip.wrap("<div class='mask'></div>");
				$mask.after("<span class='tickeroverlay-left'>&nbsp;</span><span class='tickeroverlay-right'>&nbsp;</span>")
				var $tickercontainer = $strip.parent().wrap("<div class='tickercontainer'></div>");	
				
				initalize($strip);
				
				if (settings.rssurl){
					updaterss(settings.rssurl,settings.type,$strip,settings.logo);
					if (settings.rssfrequency>0){
						window.setInterval(function(){updaterss(settings.rssurl,settings.type,$strip,settings.logo);},settings.rssfrequency*1000*60);
					}
				}

				if (cssTransitionsSupported){
					//fix for firefox not animating default transitions
					$strip.css('transition-duration','0s').css(settings.direction, '0');
					css3Scroll($strip,false);
					$strip.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function(event) {
						if (!$strip.is(event.target)) {
							return false;
						}
						css3Scroll($(this),true);
					});
				} else {
					scrollitems($(this));
				}

				if (settings.hoverpause){
					$strip.hover(function(){
						if (cssTransitionsSupported){
							var currentPosition = $(this).css(settings.direction);
							$(this).css('transition-duration','0s').css(settings.direction,currentPosition);
						} else 
							jQuery(this).stop();
					},
					function(){
						if (jQuery(this).data('settings').moving){
							if (cssTransitionsSupported){
								css3Scroll($(this),false);
								// $(this).css("-webkit-animation-play-state", "running");
							} else {
								//usual continue stuff
								scrollitems($strip)
							}
						}
					});	
				}
		});
	},
    stop : function( ) { 
        console.log("stop()");
    	var settings = $(this).data('settings');
		if (settings.moving){
			settings.moving = false;
			return this.each(function(){
				if (cssTransitionsSupported){
					var currentPosition = $(this).css(settings.direction);
					$(this).css('transition-duration','0s').css(settings.direction,currentPosition);
				} else 
					$(this).stop();
			});
		}
	},
    cont : function( ) {
        console.log("cont()");
    	var settings = $(this).data('settings')
		if (!settings.moving){
			settings.moving = true;
			return this.each(function(){
				if (cssTransitionsSupported){
					css3Scroll($(this),false);
				} else {
					scrollitems($(this));
				}
			});	
		}
	},
	update : function( list, type, insert, remove) { 
	    console.log("update() type="+type);
	    
		type = type || "reset";
		if (typeof insert === 'undefined') {
			insert = true;
			console.log("list="+list);
		}
		if (typeof remove === 'undefined') {
			remove = false;
		}
		if( typeof list === 'string' ) {
		    list = $(list);
		}
		var $strip = $(this);
		$strip.webTicker('stop');
		var settings = $(this).data('settings');
		if (type == 'reset'){
			$.log("Do reset()");
			//this does a 'restart of the ticker'
			$strip.html(list);
			$strip.css(settings.direction, '0');
			initalize($strip);
		} else if (type == 'swap'){
			$.log("Do swap()");
			// should the update be a 'hot-swap' or use replacement for IDs (in which case remove new ones)
			$strip.children('li').addClass('old');
			for (var i = 0; i < list.length; i++) {
				id = $(list[i]).data('update');
				match = $strip.find('[data-update="'+id+'"]');//should try find the id or data-attribute.
				if (match.length < 1){
					if (insert){
						//we need to move this item into the dom
						if ($strip.find('.ticker-spacer:first-child').length == 0 && $strip.find('.ticker-spacer').length > 0){
							$strip.children('li.ticker-spacer').before(list[i]);
						}
						else {
							$strip.append(list[i]);
						}
					}
				} else $strip.find('[data-update="'+id+'"]').replaceWith(list[i]);;
			};
			$strip.children('li.webticker-init, li.ticker-spacer').removeClass('old');
			if (remove)
				$strip.children('li').remove('.old');
			stripWidth = 0;
			$strip.children('li').each(function(){
				stripWidth += $(this).outerWidth( true );
			});	
			$strip.width(stripWidth+200);
		}
		
		$strip.webTicker('cont');
	}
  };

  $.fn.webTicker = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.webTicker' );
    }    
  
  };

})( jQuery );



function log () {
  if (typeof console == 'undefined') {
	  return;
  }
  try {
	var now = Date.now();
    var hms = new Date(now).toISOString().substring(11,22) + ">  ";
	arguments[0] = hms + arguments[0];

	if (/MSIE/.test(navigator.userAgent) && !window.opera) {
		console.log(  arguments[0]);
	} else {
		console.log.apply(console,  arguments);
	}
  } catch(e) { console.log(e); };
}

$.log = log;
