
$.getJSON("http://ip-api.com/json/?callback=?", function(data) {
	var result = {};
	$.each(data, function(k, v) {
    	if( k == 'countryCode' )
    	{
    		result['countryCode'] = v;
    	}
	});
	console.log('iplookup', result)
});