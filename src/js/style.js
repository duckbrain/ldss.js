// Dependancies: options_model.js, jQuery

function applyStyle() {
	var m = lds.dm.koModel;
	
	var css = '';
	
	css += 'body { ';
	if (m.font_color_enable())
		css += '  color: ' + m.font_color() + ';';
	if (m.background_color_enable())
		css += '  background-color: ' + m.background_color() + ';';
	if (m.font_size_enable())
		css += '  font-size: ' + Math.round(120 * Math.pow(10, m.font_size())) / 10 + 'pt;';
	css += '}';
	
	$('#style-options').html(css);
}

function applyCustomCSS() {
	if (lds.dm.koModel.custom_css_enable())
		$('#custom-css').html(lds.dm.koModel.custom_css());
	else $('#custom-css').html('');
}

function applyTheme() {
	$('#theme').attr('href', 'css/' + lds.dm.koModel.theme() + '.css');
}

// This function is called by index.js
function applyOnNodeLoad() {
	(lds.dm.koModel.show_footnote_letters() ?  $('sup').show : $('sup').hide)();
}

lds.dm.load(undefined, function() {
	applyStyle();
	applyCustomCSS();
	applyTheme();
});
lds.dm.startListening();

lds.dm.koModel.background_color.subscribe(applyStyle);
lds.dm.koModel.font_color.subscribe(applyStyle);
lds.dm.koModel.font_size.subscribe(applyStyle);
lds.dm.koModel.background_color_enable.subscribe(applyStyle);
lds.dm.koModel.font_color_enable.subscribe(applyStyle);
lds.dm.koModel.font_size_enable.subscribe(applyStyle);

lds.dm.koModel.custom_css_enable.subscribe(applyCustomCSS);
lds.dm.koModel.custom_css.subscribe(applyCustomCSS);

lds.dm.koModel.theme.subscribe(applyTheme);
lds.dm.koModel.show_footnote_letters.subscribe(function() {
	
});