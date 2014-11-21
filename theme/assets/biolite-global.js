if ((typeof BioliteGlobal) === 'undefined') { BioliteGlobal = {}; }



BioliteGlobal.biolite_set_product_price= function(countryCode)
{
	$.cookie("locale", countryCode, { path: '/', expires: 30 });
	console.log('set_locale_cookie:', countryCode);
}

BioliteGlobal.loaded = true;