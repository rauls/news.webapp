<html>
<head>
    <meta charset="UTF-8">
	<link rel="stylesheet" href="ticker.css" type="text/css" media="screen">
    <title>Multi News 4 U</title>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="jquery.webticker.js"></script>
	
<script>
var images =  [ 0,
	"http://www.abc.net.au/res/abc/logos/nav_logo.png",
	"http://www.abc.net.au/res/abc/logos/nav_logo.png",
	"http://www.abc.net.au/res/abc/logos/nav_logo.png",
	"http://en.wikipedia.org/wiki/File:Ars_Technica_logo.png",
	"http://static.bbci.co.uk/frameworks/barlesque/2.60.1/desktop/3.5/img/blq-blocks_grey_alpha.png",
	"http://global.fncstatic.com/static/v/all/img/head/logo-foxnews-update.png",
	0,
	0,
];
var newsfeeds = [	""   ];
var newsfeeds_default = [	"",
	"http://feeds.bbci.co.uk/news/rss.xml",
	"http://feeds.foxnews.com/foxnews/latest?format=xml",
	"http://www.engadget.com/rss.xml",
	"http://www.cnet.com/rss/news/",
	"http://feeds.ign.com/ign/news",
	"http://www.digitaltrends.com/feed/"
];
var newsfeeds_au = [	"",
	"http://www.abc.net.au/news/feed/51120/rss.xml",
	"http://www.abc.net.au/news/feed/45910/rss.xml",
	"http://www.abc.net.au/news/feed/46182/rss.xml"
];


function LS_SET( key, value )
{
    if(typeof(Storage)!=="undefined")
    {
        localStorage[ key ] = value;
    }
}

function LS_GET( key )
{
    if(typeof(Storage)!=="undefined")
    {
        return localStorage[ key ];
    }
}

function Save_RSS()
{
	for( var i = 1; i< newsfeeds.length; i++ ) {
		if( newsfeeds[i]  != undefined ) {
			LS_SET( "rss_"+i , newsfeeds[i] );
		}
	}
}

function Load_RSS()
{
	if( LS_GET("rss_1") == undefined )
	{
		for( var i = 1; i<newsfeeds_default.length; i++ ) {
			LS_SET( "rss_"+i , newsfeeds_default[i] );
			newsfeeds.push( newsfeeds_default[i] );
		}
	} else {
		for( var i = 1; i<25; i++ ) {
			var link = LS_GET( "rss_"+i );
			if( link != undefined && link != 'undefined' ) {
				newsfeeds.push( link );
			}
		}
	}
}

var last_pps;

$(document).ready( function ()
{
	Load_RSS();
	var maxn = newsfeeds.length;
	
	//RunTicker( "news1" , 32, false);

	for( var i=1;i<maxn;i++ ) {
		var ul = document.createElement( 'ul' );
		ul.id = "tick"+i;
		$(ul).attr( "class", "newsticker" );
		
		$("#tickers").append( ul );
		//$("#tickers").append( "<BR> News: " );
		log("Created and added ticker #"+i);
	}

	var logo;
	var pps = 20;
	for( var i=1;i<maxn;i++ ) {
		var inews = i < maxn ? i : i % maxn;
		//logo = images[ inews ] || 0;
		//logo = undefifed
		RunTicker( "#tick"+i , pps, "geturl.php?url="+newsfeeds[ inews ], logo );
		pps+=5.0;
	}
	
	last_pps = pps;

});

</script>

<style>
.up { color: #00FF00 }
.down { color: #FF0033 }

inputurl {
	display: hidden;
}
</style>
	
</head>
<body bgcolor="#000" text="white">

<DIV id="tickers">


</DIV>            

<H1 class="add" > + 
</H1>
<DIV id="inputurl" style="display:none"> <INPUT type="text" id="url" value="rss://.com"> </INPUT> <BUTTON id="add">Add RSS</BUTTON>
</DIV>


<script>

$(".add").click( function(e) {
	$("#inputurl").show();
} );

$("#add").click( function(e) {
	var link = $("#url").val();
	if( link != undefined )
	{
		newsfeeds.push( link );

		var i = newsfeeds.length;
		
		var ul = document.createElement( 'ul' );
		ul.id = "tick"+i;
		$(ul).attr( "class", "newsticker" );
		$("#tickers").append( ul );

		RunTicker( "#tick"+i , last_pps, "geturl.php?url="+link );
		last_pps =last_pps+5;
	}
	$("#inputurl").hide();
} );


function log () {
  if (typeof console == 'undefined') {
      return;
  }
  try {
    var hms = "> ";
    arguments[0] = hms + arguments[0];

    if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        console.log(arguments[0]);
    } else {
        console.log.apply(console, arguments);
    }
  } catch(e) { console.log(e); };
}


function RunTicker(id,pps,url,logo)
{
  log("runticker url="+url);
  $(id).webTicker({
	id: id,
    speed: pps || 50, //pixels per second
    direction: "left", //if to move left or right
    moving: true, //weather to start the ticker in a moving or static position
    startEmpty: true, //weather to start with an empty or pre-filled ticker
    duplicate: false, //if there is less items then visible on the ticker you can duplicate the items to make it continuous
    rssurl: url || false, //only set if you want to get data from rss
    rssfrequency: 20, //the frequency of updates in minutes. 0 means do not refresh
    updatetype: "reset", //how the update would occur options are "reset" or "swap",
	hoverpause: false,
	logo: logo
  }); 
}

function SetupTicker(id,pps,news)
{
	log("Setup Ticker...");
	if( news && news.indexOf( ".xml" ) ) {
		type = 'xml';
	} else {
		type = 'json';
	}
	
	$.ajax( {   url : news, type: "GET", 'dataType': type,
		success: function(data)
		{
			if( data.channel ) {
				for( var i in data.channel.item ) {
					var item = data.channel.item[i];
					var title = item.title;
					var li = $(id).createElement( "UL" );
					li.innerText = title;
				}
			}
			RunTicker(id,pps);
		},
		error: function(err)
		{
			console.log("error: "+err);
		}
	} );
}




</script>


</body>

</html>


