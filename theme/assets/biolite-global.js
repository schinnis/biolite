if ((typeof BioliteGlobal) === 'undefined') { BioliteGlobal = {}; }

BioliteGlobal.init = function()
{
	BioliteGlobal.loaded = true;
}

BioliteGlobal.get_product = function(id)
{
	jQuery.getJSON('/products/' + id + '.js', function(product) {
		console.log(product)
	}
}


$(function() {
	BioliteGlobal.init();
});
