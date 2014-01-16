if (typeof(lds) != 'object') var lds = {};

lds.options_model = {
	first_use: { default: true },
	developer_mode: { default: true },
	
	//
	// Read Tracking
	//
	
	read_tracking_enabled: { default: false },
	read_streak_started: { default: new Date() },
	read_streak_confirmed_to: { default: new Date() },
	read_streak_pending_days: { default: [] },
	
	//
	// Rendering Options
	//
	show_footnote_letters: { default: true },
	
	//
	// Style options
	//
	
	font_typeset: { default: '' },
	
	font_size_enable: { default: false },
	font_size: { default: 0, saveDelay: 1000 },
	subtitle_size_enable: { default: false },
	subtitle_size: { default: 0, saveDelay: 1000 },
	title_size_enable: { default: false },
	title_size: { default: 0, saveDelay: 1000 },
	font_color_enable: { default: false },
	font_color: { default: '#000000', saveDelay: 1000 },
	font_family: { default: "" }, 
	background_color_enable: { default: false },
	background_color: { default: '#ffffff', saveDelay: 1000 },
	
	toolbar_size_enable: { default: false },
	toolbar_size: { default: 0, saveDelay: 1000 },
	toolbar_font_color_enable: { default: false },
	toolbar_font_color: { default: '#000000', saveDelay: 1000 },
	toolbar_color_enable: { default: false },
	toolbar_color: { default: '#ffffff', saveDelay: 1000 },
	toolbar_image: { default: '' },
	
	custom_css_enable: { default: false },
	custom_css: { default: '', saveDelay: 3000 },
	custom_javascript_enable: { default: false },
	custom_javascript: { default: '', saveDelay: 3000 },
	theme: { default: 'default', saveDelay: 0 },
	
	//
	// Keyboard Shortcuts
	//
	keyboard_shortcuts_enabled: { default: true },
	keyboard_shortcut_up: { default: 'q' },
	keyboard_shortcut_previous: { default: 'a' },
	keyboard_shortcut_next: { default: 'z' },
	keyboard_shortcut_verse_previous: { default: 'b' },
	keyboard_shortcut_verse_next: { default: 'n' },
	keyboard_shortcut_search: { default: 's' },
	keyboard_shortcut_autoscoll: { default: 'x' },
	keyboard_shortcut_bookmark: { default: 'u' },
	keyboard_shortcut_lds_org: { default: 'l' },
	keyboard_shortcut_: { default: 'a' },
	
	//
	// Catalog Helpers
	//
	
	languages: { default: [], dontSave: true },
	language_current: { default: 1, dontSave: true }
};

lds.dm = new lds.DataModel(lds.options_model);
