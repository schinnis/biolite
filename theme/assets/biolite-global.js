if ((typeof BioliteGlobal) === 'undefined') { BioliteGlobal = {}; }



BioliteGlobal.biolite_set_product_price = function(product)
{

	var locale = BioliteLocale.current,
		addToCart = $('#addToCart'),
      	productPrice = $('#productPrice');

	console.info('biolite_set_product_price', locale, BioliteLocale.default_locale, Shopify.formatMoney);

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
			productPrice.html( Shopify.formatMoney(price, this.money_format) );
			addToCart.removeClass('disabled').prop('disabled', false).val('Add to Cart');
		}
		else if( split[1] == locale && !avail )
		{
			addToCart.val('Sold Out').addClass('disabled').prop('disabled', true);
		}

	}

}


// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
BioliteGlobal.money_format = "${{amount}}";
BioliteGlobal.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

BioliteGlobal.loaded = true;