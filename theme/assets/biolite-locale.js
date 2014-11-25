if ((typeof BioliteLocale) === 'undefined') { BioliteLocale = {}; }

BioliteLocale.init = function()
{
	BioliteLocale.iplookup_result  = {};
	BioliteLocale.iplookup_promise = null;
	
	BioliteLocale.locations = {
		'US' : 'United States',
		'AU' : 'Australia',
		'CA' : 'Canada', 		
		'EU' : 'Euro Zone',
		'JP' : 'Japan',
		'SE' : 'Sweden',
		'UK' : 'United Kingdom',
	}	
	BioliteLocale.location_currencies = {
		'US' : 'USD',
		'AU' : 'AUD',
		'CA' : 'CAD', 
		'EU' : 'EUR',
		'JP' : 'JPY',
		'SE' : 'SEK',
		'UK' : 'GBP',
	}
	BioliteLocale.currency_from_location_code = {
		'CAD' : ['CA'], 
		'USD' : ['US'],
		'EUR' : ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'EU'],
		'AUD' : ['AU'],
		'GBP' :	['UK'],
		'SEK' :	['SE'],
		'JPY' :	['JP'],
	}

	BioliteLocale.default_currency 	= 'USD';
	BioliteLocale.default_locale   	= 'US';
	
	BioliteLocale.current_locale    = BioliteLocale.cookie.read() || BioliteLocale.default_locale;
	BioliteLocale.current_currency  = Currency.cookie.read() || BioliteLocale.default_currency;

	BioliteLocale.location_box 		  = $('#locations-box');
	BioliteLocale.location_switcher = $('select#locations');
	BioliteLocale.product_div 			= $('#ProductPrice');

	BioliteLocale.add_location_choices();

	BioliteLocale.loaded = true;
}


BioliteLocale.cookie = {
	configuration : { 
		expires : 365,
		path		: "/",
		domain	: window.location.hostname
	},
	name			: "locale",
	write			: function(a){
		jQuery.cookie(this.name,a,this.configuration)
	},
	read			: function(){
		return jQuery.cookie(this.name)
	},
	destroy		: function(){
		jQuery.cookie( this.name, null, this.configuration )
	}
};


BioliteLocale.add_location_choices = function()
{
	console.log('add_location_choices', BioliteLocale.location_switcher)
	jQuery.each(BioliteLocale.locations, function(key, value) {   
		BioliteLocale.location_switcher.append($("<option></option>")
			.attr("value", key)
				.text( value + ' (' + BioliteLocale.location_currencies[key] + ')' ));
	});
	BioliteLocale.location_switcher.change(function() {
		BioliteLocale.set_new_location( $(this).val() );
	});
	BioliteLocale.location_box.show();
}


BioliteLocale.set_new_location = function(location)
{
	if( location == '' || location === undefined )
		location = BioliteLocale.default_locale;
	var currency = BioliteLocale.location_currencies[location];
	console.log('set_new_location', location, currency);

	BioliteLocale.cookie.write(location);
	console.log('BioliteLocale.cookie', BioliteLocale.cookie);

	// this happens in the Currency.convertAll function
	// Currency.cookie.write(currency);

	jQuery('#productSelect option[value='+location+']').attr('selected', 'selected');
	console.log('productSelect', $('#productSelect').val() );

	var location_price = BioliteGlobal.current_product.price;
	jQuery.each(BioliteGlobal.current_variants, function(key, value)
	{  
		if( value.option1 == 'price-' + location.toUpperCase() )
		{
			location_price = value.price
		}
	});

	//
	// BioliteLocale.product_div.find('span').html( location_price );

	// change all the prices on the page
	BioliteLocale.changeAll(location_price);

	// add the USD equiv of the price (in parens)
	BioliteLocale.addAllEquivPrices(location_price, currency);

	// convert all the currencies on the page
	Currency.convertAll(shopCurrency, currency);


}

BioliteLocale.changeAll = function(newPrice, selector)
{
	jQuery(selector || 'span.money').each(function() {
		jQuery(this).html(newPrice);
	});
}

BioliteLocale.addAllEquivPrices = function(equivPrice, newCurrency, selector)
{
	jQuery(BioliteLocale.product_div).find('.price_equiv').remove();

	if( shopCurrency == newCurrency)
		return;

	var format 					= Currency.moneyFormats[shopCurrency][Currency.format]
	var FormattedAmount = Currency.formatMoney(equivPrice, format);
	
	jQuery(selector || 'span.money').each(function() {
		jQuery(this).after( $("<sup></sup>").attr("class", 'price_equiv').attr("style", 'font-weight:100;padding-left:10px').text('('+FormattedAmount+')') );
	});
}





// BioliteLocale.biolite_set_locale_cookie = function(countryCode)
// {
// 	$.cookie("locale", countryCode, { path: '/', expires: 30 });
// 	BioliteLocale.current = countryCode;
// 	console.log('set_locale_cookie:', countryCode);
// }


// BioliteLocale.biolite_get_locale = function()
// {
// 	if( ! BioliteLocale.iplookup_promise )
// 	{
// 		BioliteLocale.iplookup_promise = $.getJSON("http://ip-api.com/json/?callback=?", function(data){
// 			BioliteLocale.iplookup_result = data;
// 			console.log('iplookup_result:', BioliteLocale.iplookup_result);
// 		});
// 		$.when( BioliteLocale.iplookup_promise ).done(function( x ){
// 			if( BioliteLocale.iplookup_result['countryCode'] != '' )
// 			{
// 				console.log('biolite_set_locale_cookie FROM biolite_get_locale', BioliteLocale.iplookup_result);
// 				BioliteLocale.biolite_set_locale_cookie( BioliteLocale.iplookup_result['countryCode'] );
// 			}
// 		});
// 	}
// }

// BioliteLocale.show_locale_switcher = function()
// {
// 	var counter = 0;
// 	var timer = setInterval(function()
// 	{
// 		var locale = $.cookie("locale") || BioliteLocale.biolite_get_locale();
// 		if( locale ) {
// 		    clearInterval(timer);
// 		    var currency = BioliteLocale.get_currency(locale);
// 		    BioliteLocale.toggle_locale_chooser( currency, locale );
// 		}
// 		counter++;
// 		if(counter >= 20) {
// 		    clearInterval(timer);
// 		}
// 	}, 
// 	300);
// }

// get the currency from the perceived locale
// BioliteLocale.get_currency = function(locale)
// {
// 	var currency = BioliteLocale.default_currency;
// 	for (var value in BioliteLocale.country_codes)
// 	{
//     	if( BioliteLocale.country_codes[value].indexOf(locale) >= 0 )
//     	{
//     		currency = value;
//     	}
// 	}
// 	return currency;
// }

// get the locale from the currency chosen
// BioliteLocale.get_locale = function(currency)
// {
// 	var locale = BioliteLocale.default_locale;
// 	for (var value in BioliteLocale.country_codes)
// 	{
//     	if( value == currency )
//     	{
//     		locale = BioliteLocale.country_codes[value][0];
//     	}
// 	}
// 	return locale;
// }

// BioliteLocale.toggle_locale_chooser = function(currency, locale)
// {
// 	console.log('toggle_locale_chooser locale: ', locale, ' & currency: ', currency);
// 	if( currency )
// 	{
// 		// set the correct currency in the select
// 		$('#currencies_chooser #currencies').val( currency );
		
// 		// if the currency cookie is not already set, submit the form
// 		if( $.cookie("currency") != currency )
// 		{
// 			console.log('submit FROM toggle_locale_chooser', currency, locale);
// 			$('#currencies_chooser #currencies').submit();
// 		}
		
// 		// hide the chooser form
// 		$('#currencies_chooser #currencies').hide();
// 		// show the currency choice link
// 		$('#currencies_chooser #currencies_choice').show();

// 		// set the locale label
// 		locale = BioliteLocale.get_locale( currency );
// 		$('#currencies_chooser label[for="currencies"]').html('Your Locale: ' + locale);

// 		// if the locale cookie is not already set, set it
// 		if( $.cookie("locale") != locale )
// 		{
// 			console.log('biolite_set_locale_cookie FROM toggle_locale_chooser', currency, locale);
// 			BioliteLocale.biolite_set_locale_cookie( locale );
// 		}
// 	}
// 	else
// 	{
// 		// set the chooser label
// 		$('#currencies_chooser label[for="currencies"]').html('Pick a currency ');

// 		// hide the currency choice link
// 		$('#currencies_chooser #currencies_choice').hide();

// 		// show the chooser form
// 		$('.currencies-box #currencies_chooser #currencies').show();

// 		// toggle the locale on form submit
// 		$('.currencies-box #currencies_chooser #currencies').on('change', function() {
// 		  BioliteLocale.toggle_locale_chooser( this.value, locale );
// 		});
// 	}
// 	// show the chooser section
// 	$('.currencies-box #currencies_chooser').show();
// }



jQuery(function() {
	BioliteLocale.init();
});
