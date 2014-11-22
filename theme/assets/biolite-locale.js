if ((typeof BioliteLocale) === 'undefined') { BioliteLocale = {}; }

BioliteLocale.init = function()
{
	BioliteLocale.iplookup_result  = {};
	BioliteLocale.iplookup_promise = null;
	BioliteLocale.country_codes = {
		'CAD' : ['CA'], 
		'USD' : ['US'],
		'EUR' : ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE'],
		'AUD' : ['AU'],
		'GBP' :	['UK']
	}
	BioliteLocale.default_currency = 'CAD';
	BioliteLocale.default_locale   = 'CA';
	
	BioliteLocale.current          = $.cookie("locale") || BioliteLocale.default_locale;

	BioliteLocale.loaded = true;
}


BioliteLocale.biolite_set_locale_cookie = function(countryCode)
{
	$.cookie("locale", countryCode, { path: '/', expires: 30 });
	BioliteLocale.current = countryCode;
	console.log('set_locale_cookie:', countryCode);
}


BioliteLocale.biolite_get_locale = function()
{
	if( ! BioliteLocale.iplookup_promise )
	{
		BioliteLocale.iplookup_promise = $.getJSON("http://ip-api.com/json/?callback=?", function(data){
			BioliteLocale.iplookup_result = data;
			console.log('iplookup_result:', BioliteLocale.iplookup_result);
		});
		$.when( BioliteLocale.iplookup_promise ).done(function( x ){
			if( BioliteLocale.iplookup_result['countryCode'] != '' )
			{
				console.log('biolite_set_locale_cookie FROM biolite_get_locale', BioliteLocale.iplookup_result);
				BioliteLocale.biolite_set_locale_cookie( BioliteLocale.iplookup_result['countryCode'] );
			}
		});
	}
}

BioliteLocale.show_locale_switcher = function()
{
	var counter = 0;
	var timer = setInterval(function()
	{
		var locale = $.cookie("locale") || BioliteLocale.biolite_get_locale();
		if( locale ) {
		    clearInterval(timer);
		    var currency = BioliteLocale.get_currency(locale);
		    BioliteLocale.toggle_locale_chooser( currency, locale );
		}
		counter++;
		if(counter >= 20) {
		    clearInterval(timer);
		}
	}, 
	300);
}

// get the currency from the perceived locale
BioliteLocale.get_currency = function(locale)
{
	var currency = BioliteLocale.default_currency;
	for (var value in BioliteLocale.country_codes)
	{
    	if( BioliteLocale.country_codes[value].indexOf(locale) >= 0 )
    	{
    		currency = value;
    	}
	}
	return currency;
}

// get the locale from the currency chosen
BioliteLocale.get_locale = function(currency)
{
	var locale = BioliteLocale.default_locale;
	for (var value in BioliteLocale.country_codes)
	{
    	if( value == currency )
    	{
    		locale = BioliteLocale.country_codes[value][0];
    	}
	}
	return locale;
}

BioliteLocale.toggle_locale_chooser = function(currency, locale)
{
	console.log('toggle_locale_chooser locale: ', locale, ' & currency: ', currency);
	if( currency )
	{
		// set the correct currency in the select
		$('#currencies_chooser #currencies').val( currency );
		
		// if the currency cookie is not already set, submit the form
		if( $.cookie("currency") != currency )
		{
			console.log('submit FROM toggle_locale_chooser', currency, locale);
			$('#currencies_chooser #currencies').submit();
		}
		
		// hide the chooser form
		$('#currencies_chooser #currencies').hide();
		// show the currency choice link
		$('#currencies_chooser #currencies_choice').show();

		// set the locale label
		locale = BioliteLocale.get_locale( currency );
		$('#currencies_chooser label[for="currencies"]').html('Your Locale: ' + locale);

		// if the locale cookie is not already set, set it
		if( $.cookie("locale") != locale )
		{
			console.log('biolite_set_locale_cookie FROM toggle_locale_chooser', currency, locale);
			BioliteLocale.biolite_set_locale_cookie( locale );
		}
	}
	else
	{
		// set the chooser label
		$('#currencies_chooser label[for="currencies"]').html('Pick a currency ');

		// hide the currency choice link
		$('#currencies_chooser #currencies_choice').hide();

		// show the chooser form
		$('.currencies-box #currencies_chooser #currencies').show();

		// toggle the locale on form submit
		$('.currencies-box #currencies_chooser #currencies').on('change', function() {
		  BioliteLocale.toggle_locale_chooser( this.value, locale );
		});
	}
	// show the chooser section
	$('.currencies-box #currencies_chooser').show();
}

BioliteLocale.init();
