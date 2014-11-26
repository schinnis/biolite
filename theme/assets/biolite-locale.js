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

	BioliteLocale.default_currency 							= 'USD';
	BioliteLocale.default_locale   							= 'US';
	
	BioliteLocale.current_locale    						= BioliteLocale.cookie.read() || BioliteLocale.default_locale;
	BioliteLocale.current_currency  						= Currency.cookie.read() || BioliteLocale.default_currency;

	BioliteLocale.location_box 		  						= $('#locations-box');
	BioliteLocale.location_switcher 						= $('select#locations');
	BioliteLocale.single_prod_price_container				= $("div[itemprop='price'], span[itemprop='price']");
	BioliteLocale.single_prod_variant_selector				= $("#productSelect");

	BioliteLocale.multiple_producsts_container				= $("#someProducts");

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
	// loop through all the locations and add each one to the location dropdown
	jQuery.each(BioliteLocale.locations, function(key, value) {   
		BioliteLocale.location_switcher.append($("<option></option>")
			.attr("value", key)
				.text( value + ' (' + BioliteLocale.location_currencies[key] + ')' ));
	});

	// listen for change action
	BioliteLocale.location_switcher.change(function() {
		BioliteLocale.set_new_location( $(this).val() );
	});

	// preselect the current locale
	BioliteLocale.location_switcher.find('option[value='+BioliteLocale.current_locale+']').attr('selected', 'selected');
	
	// show the entire location box
	BioliteLocale.location_box.show();
}


BioliteLocale.set_new_location = function(location)
{
	if( location == '' || location === undefined )
		location = BioliteLocale.default_locale;
	var currency = BioliteLocale.location_currencies[location];
	console.log('set new location & currency', location, currency);

	// save this to a locale cookie
	BioliteLocale.cookie.write(location);

	// this happens in the Currency.convertAll function, so we don't actually need it here...
	// Currency.cookie.write(currency);

	//clear the cart
	var clear = jQuery.post('/cart/clear.js');

	// change the prices to the location variant prices
	BioliteLocale.setLocationVariantPrices(currency, location);
}


BioliteLocale.setLocationVariantPrices = function(currency, location)
{
	console.log('setLocationVariantPrices', currency, BioliteLocale.current_product);

	// if we are on the single product page
	if( BioliteLocale.current_product )
	{
		// set the invisible product variant selector for this product
		BioliteLocale.single_prod_variant_selector.val([]);
		BioliteLocale.single_prod_variant_selector.find("option[data-locale='price-"+location.toUpperCase()+"']").attr('selected', 'selected');
		console.log('productSelect', BioliteLocale.single_prod_variant_selector.find("option[data-locale='price-"+location.toUpperCase()+"']") );

		// set the new price to the default product price first
		var location_price = BioliteLocale.current_product.price;
		
		// try to find a new price for this location by looking through the variants
		jQuery.each(BioliteLocale.current_variants, function(key, value)
		{  
			if( value.option1 == 'price-' + location.toUpperCase() )
			{
				location_price = value.price
			}
		});

		// change all the prices on the page
		BioliteLocale.changeAll(location_price);

		// add the USD equiv of the price (in parens)
		BioliteLocale.addAllEquivPrices(location_price, currency);

	}

	if( BioliteLocale.multiple_producsts_container )
	{

		// loop through each product and get the right variant
		//jQuery.get('/cart/clear.js');

	}

	

	// convert all the currencies on the page
	Currency.convertAll(shopCurrency, currency);
}




BioliteLocale.changeAll = function(newPrice, selector)
{
	BioliteLocale.single_prod_price_container.find(selector || 'span.money').each(function() {
		jQuery(this).html(newPrice);
	});
}

BioliteLocale.addAllEquivPrices = function(equivPrice, newCurrency, selector)
{
	BioliteLocale.single_prod_price_container.find('.price_equiv').remove();

	if( shopCurrency == newCurrency )
		return;

	var format 					= Currency.moneyFormats[shopCurrency][Currency.format]
	var FormattedAmount = Currency.formatMoney(equivPrice, format);
	
	BioliteLocale.single_prod_price_container.find(selector || 'span.money').each(function() {
		jQuery(this).after( $("<sup></sup>").attr("class", 'price_equiv').attr("style", 'font-weight:100;padding-left:10px').text('('+FormattedAmount+')') );
	});
}


jQuery(function() {
	BioliteLocale.init();
});
