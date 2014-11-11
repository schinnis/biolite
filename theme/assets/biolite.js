if ((typeof Biolite) === 'undefined') { Biolite = {}; }

Biolite.iplookup_result  = {};
Biolite.iplookup_promise = null;
Biolite.country_codes = {
	'CAD' : ['CA'], 
	'USD' : ['US'],
	'EUR' : ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE'],
	'AUD' : ['AU'],
	'GBP' :	['UK']
}
Biolite.default_currency = 'CAD';



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
		    var currency = Biolite.get_currency(locale);
		    console.log('your locale & currency seem to be:', locale, currency);
		    Biolite.toggle_locale_chooser( currency );
		}
		counter++;
		if(counter >= 20) {
		    clearInterval(timer);
		}
	}, 
	300);
}

Biolite.get_currency = function(locale)
{
	var currency = Biolite.default_currency;
	for (var value in Biolite.country_codes)
	{
    	if( Biolite.country_codes[value].indexOf(locale) >= 0 )
    	{
    		currency = value;
    	}
	}
	return currency;
}

Biolite.toggle_locale_chooser = function(currency){
	console.log( 'toggle_locale_chooser',  currency)
	if( currency ){
		$('.currencies-box #currencies').val( currency );
		$('.currencies-box #currencies').submit();
		$('.currencies-box #currencies_chooser').hide();
		$('.currencies-box #currencies_choice').show();
		$('label[for="currencies"]').html('Your Currency: ' + currency);
	}
	else{
		$('.currencies-box #currencies_choice').hide();
		$('.currencies-box #currencies_chooser').show();
	}
	$('.currencies-box #currencies_chooser #currencies').on('change', function() {
	  Biolite.toggle_locale_chooser(this.value);
	});
}


