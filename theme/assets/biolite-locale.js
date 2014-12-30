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
		'KR' : 'South Korea',
	}	
	BioliteLocale.location_currencies = {
		'US' : 'USD',
		'AU' : 'AUD',
		'CA' : 'CAD', 
		'EU' : 'EUR',
		'JP' : 'JPY',
		'SE' : 'SEK',
		'UK' : 'GBP',
		'KR' : 'KRW',
	}
	BioliteLocale.currency_from_location_code = {
		'CAD' : ['CA'], 
		'USD' : ['US'],
		'EUR' : ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'EU'],
		'AUD' : ['AU'],
		'GBP' :	['UK'],
		'SEK' :	['SE'],
		'JPY' :	['JP'],
		'KRW' :	['KR'],
	}

	BioliteLocale.default_currency 							= 'USD';
	BioliteLocale.default_locale   							= 'US';
	
	BioliteLocale.current_locale    						= BioliteLocale.cookie.read() || BioliteLocale.default_locale;
	BioliteLocale.current_currency  						= Currency.cookie.read() || BioliteLocale.default_currency;

	BioliteLocale.location_box 		  						= $('#locations-box');
	BioliteLocale.location_switcher 						= $('select#locations');

	BioliteLocale.variant_prefix 							= 'pricing-'; // for example, as in: 'price-UK'
	
	BioliteLocale.currency_container 						= $("meta[itemprop='priceCurrency']");
	BioliteLocale.variant_price 						    = $("meta[itemprop='variantPrice']");
	BioliteLocale.variant_price_default						= $("meta[itemprop='variantPrice'][location='Default']");

	BioliteLocale.single_product_container					= $("div[itemtype='http://schema.org/Product']");
	BioliteLocale.single_prod_price_container				= $("div[itemprop='price'], span[itemprop='price']");
	BioliteLocale.single_prod_price_class 					= $("span.money");
	BioliteLocale.single_prod_variant_selector				= $("#productSelect");

	BioliteLocale.multiple_products_container				= $("div[itemtype='http://schema.org/SomeProducts']");

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

	// set all the product currency meta to the correct currency
	BioliteLocale.currency_container.attr('content', currency);	

	// if we are on the single product page
	if( BioliteLocale.current_product )
	{
		// set the invisible product variant selector for this product
		BioliteLocale.single_prod_variant_selector.val([]);
		BioliteLocale.single_prod_variant_selector.find("option[data-locale='" + BioliteLocale.variant_prefix + currency.toUpperCase() + "']").attr('selected', 'selected');
		console.log('productSelectOption', 'data-locale="' + BioliteLocale.variant_prefix + currency.toUpperCase() + '"', BioliteLocale.single_prod_variant_selector.find("option[data-locale='" + BioliteLocale.variant_prefix + currency.toUpperCase() + "']") );

		// set the new price to the default product price first
		var location_price = null;
		var default_price = BioliteLocale.current_product.price;
		
		// try to find a new price for this location by looking through the variants
		jQuery.each(BioliteLocale.current_variants, function(key, value)
		{  
			if( value.option1 == BioliteLocale.variant_prefix + currency.toUpperCase() )
			{
				location_price = value.price
			}
			else if( value.option1.toLowerCase() == 'default' )
			{
				default_price = value.price
			}
		});

		console.log(BioliteLocale.variant_prefix + currency.toUpperCase(), 'location_price', location_price, 'default_price', default_price);

		location_price = location_price || default_price;

		// change the price
		BioliteLocale.single_prod_price_container.find(BioliteLocale.single_prod_price_class).html(location_price);

		// add the USD equiv of the price (in parens)
		BioliteLocale.addEquivPrices(BioliteLocale.single_prod_price_container, location_price, currency);

	}

	// if we are on a multiple product page
	if( BioliteLocale.multiple_products_container )
	{
		var products = BioliteLocale.multiple_products_container.find(BioliteLocale.single_product_container);
		jQuery.each( products, function(key, value)
		{  
			// set the new price to the default product price first
			var location_price = jQuery(value).find(BioliteLocale.variant_price_default).attr('content');

			console.log( jQuery(value).find('a[itemprop="name"]').html(), location_price );

			jQuery.each( jQuery(value).find(BioliteLocale.variant_price), function(key, value)
			{  
				if( jQuery(value).attr('location') == BioliteLocale.variant_prefix + currency.toUpperCase() )
				{
					location_price = jQuery(value).attr('content')
				}
			});

			// change the price
			jQuery(value).find(BioliteLocale.single_prod_price_container).find(BioliteLocale.single_prod_price_class).html(location_price);

			// add the USD equiv of the price (in parens)
			BioliteLocale.addEquivPrices(jQuery(value).find(BioliteLocale.single_prod_price_container), location_price, currency);
		});

	}

	
	// convert all the currencies on the page
	Currency.convertAll(shopCurrency, currency);
}


BioliteLocale.addEquivPrices = function(container, equivPrice, newCurrency, selector)
{
	container.find('.price_equiv').remove();

	if( shopCurrency == newCurrency )
		return;

	var format 			= Currency.moneyFormats[shopCurrency][Currency.format]
	var FormattedAmount = Currency.formatMoney(equivPrice, format);
	
	container.find(selector || BioliteLocale.single_prod_price_class).each(function() {
		jQuery(this).after( $("<sup></sup>").attr("class", 'price_equiv').attr("style", 'font-weight:100;padding-left:10px').text('('+FormattedAmount+')') );
	});
}


jQuery(function() {
	BioliteLocale.init();
});
