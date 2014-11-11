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
Biolite.default_locale   = 'CA';


Biolite.biolite_set_locale_cookie = function(countryCode)
{
	$.cookie("biolite-locale", countryCode, { path: '/', expires: 30 });
	console.log('set_locale_cookie:', countryCode);
}


Biolite.biolite_get_locale = function()
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
				console.log('biolite_set_locale_cookie FROM biolite_get_locale', Biolite.iplookup_result);
				Biolite.biolite_set_locale_cookie( Biolite.iplookup_result['countryCode'] );
			}
		});
	}
}

Biolite.show_locale_switcher = function()
{
	var counter = 0;
	var timer = setInterval(function()
	{
		var locale = $.cookie("biolite-locale") || Biolite.biolite_get_locale();
		console.log('get locale:', counter, locale);
		if( locale ) {
		    clearInterval(timer);
		    var currency = Biolite.get_currency(locale);
		    console.log('your locale ', locale, ' & currency: ', currency);
		    Biolite.toggle_locale_chooser( currency, locale );
		}
		counter++;
		if(counter >= 20) {
		    clearInterval(timer);
		}
	}, 
	300);
}

// get the currency from the perceived locale
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

// get the locale from the currency chosen
Biolite.get_locale = function(currency)
{
	var locale = Biolite.default_locale;
	for (var value in Biolite.country_codes)
	{
    	if( value == currency )
    	{
    		locale = Biolite.country_codes[value][0];
    	}
	}
	return locale;
}

Biolite.toggle_locale_chooser = function(currency, locale){
	console.log( 'toggle_locale_chooser', currency, locale)
	if( currency ){
		$('.currencies-box #currencies').val( currency );
		$('.currencies-box #currencies').submit();
		$('.currencies-box #currencies_chooser').hide();
		$('.currencies-box #currencies_choice').show();
		locale = Biolite.get_locale( currency );
		$('#currencies_choice label[for="currencies"]').html('Your Locale: ' + locale);
		console.log('biolite_set_locale_cookie FROM toggle_locale_chooser', currency, locale);
		Biolite.biolite_set_locale_cookie( locale );
	}
	else{
		$('.currencies-box #currencies_choice').hide();
		$('.currencies-box #currencies_chooser').show();
		$('.currencies-box #currencies_chooser #currencies').on('change', function() {
		  Biolite.toggle_locale_chooser( this.value, locale );
		});
	}
}
