(function($) {

	console.log( "debug loaded" )

	$( "#debug-div-toggle" ).click(function(e)
	{
		console.log( "click debug-div", e )
		e.preventdefault();
		
		$( "#debug-div" ).toggle( "slow", function() {
			console.log( "show debug-div" )
		});
	});

}(jQuery));