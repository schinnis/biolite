if ((typeof Biolite) === 'undefined') { Biolite = {}; }

Biolite.iplookup_result  = {};
Biolite.iplookup_promise = null;


Biolite.biolite_set_locale = function()
{
	if( ! Biolite.iplookup_promise )
	{
		Biolite.iplookup_promise = $.getJSON("http://ip-api.com/json/?callback=?", function(data){
			Biolite.iplookup_result = data;
			console.log('iplookup_result:', Biolite.iplookup_result);
		});
		$.when( Biolite.iplookup_promise ).done(function( x ){
			if( Biolite.iplookup_result['countryCode'] != '' )
			{
				$.cookie("biolite-locale", Biolite.iplookup_result['countryCode']);
			}
		});
	}
}

Biolite.show_locale_switcher = function()
{
	var counter = 0;
	var timer = setInterval(function()
	{
		var locale = $.cookie("biolite-locale") || Biolite.biolite_set_locale();
		console.log('get locale:', counter, locale);
		if( locale ) {
		    clearInterval(timer);
		    $('#locale').html('your locale seems to be: ' + locale);
		    $('#currencies-box').show();
		}
		counter++;
		if(counter >= 20) {
		    clearInterval(timer);
		}
	}, 
	300);
}