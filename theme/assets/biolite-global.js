if ((typeof BioliteGlobal) === 'undefined') { BioliteGlobal = {}; }



BioliteGlobal.biolite_set_product_price = function(product)
{
	var locale = BioliteLocale.current,
			addToCart = $('#addToCart'),
      productPrice = $('#productPrice');

	console.info('biolite_set_product_price', locale, BioliteLocale.default_locale);

	if(BioliteLocale.default_locale == locale)
		return;

	for( id in product.variants )
	{
		console.info('variant', product.variants[id], product.variants[id].title)

		var title = product.variants[id].title;
		var price = product.variants[id].price;
		var avail = product.variants[id].available;
		var split = title.split('-');

		if( split[1] == locale && avail )
		{
			console.info('price', product.variants[id].price)
			productPrice.html( BioliteGlobal.formatMoney(price, this.money_format) + ' [' + price + ']' );
			addToCart.removeClass('disabled').prop('disabled', false).val('Add to Cart');
		}
		else if( split[1] == locale && !avail )
		{
			addToCart.val('Sold Out').addClass('disabled').prop('disabled', true);
		}

	}

}


BioliteGlobal.formatMoney = function(cents, format) {

  if (typeof cents == 'string') cents = cents.replace('.','');
  var value = '';
  var patt = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || 'USD');

  function addCommas(moneyString) {
    return moneyString.replace(/(\d+)(\d{3}[\.,]?)/,'$1,$2');
  }

  switch(formatString.match(patt)[1]) {
    case 'amount':
      value = addCommas(floatToString(cents/100.0, 2));
      break;
    case 'amount_no_decimals':
      value = addCommas(floatToString(cents/100.0, 0));
      break;
    case 'amount_with_comma_separator':
      value = floatToString(cents/100.0, 2).replace(/\./, ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = addCommas(floatToString(cents/100.0, 0)).replace(/\./, ',');
      break;
  }
  return formatString.replace(patt, value);
};

BioliteGlobal.loaded = true;