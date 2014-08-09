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
	font_size: { default: 0, saveDelay: 1000, enableTrigger: 'font_size_enable'},
	margin_size: { default: 0, saveDelay: 1000 },
	subtitle_size_enable: { default: false },
	subtitle_size: { default: 0, saveDelay: 1000, enableTrigger: 'subtitle_size_enable' },
	title_size_enable: { default: false },
	title_size: { default: 0, saveDelay: 1000, enableTrigger: 'title_size_enable' },
	font_color_enable: { default: false },
	font_color: { default: '#000000', saveDelay: 1000, enableTriggers: 'font_color_enable' },
	link_color_enable: { default: false },
	link_color: { default: '#0000ff', saveDelay: 1000, enableTrigger: 'link_color_enable' },
	font_family_enable: { default: false }, 
	font_family: { default: "", enableTrigger: 'font_family_enable' }, 
	background_color_enable: { default: false },
	background_color: { default: '#ffffff', saveDelay: 1000, enableTrigger: 'background_color_enable' },
	
	toolbar_size_enable: { default: false },
	toolbar_size: { default: 0, saveDelay: 1000, enableTrigger: 'toolbar_size_enable' },
	toolbar_font_color_enable: { default: false },
	toolbar_font_color: { default: '#000000', saveDelay: 1000, enableTrigger: 'toolbar_font_color_enable' },
	toolbar_color_enable: { default: false },
	toolbar_color: { default: '#ffffff', saveDelay: 1000, enableTrigger: 'toolbar_color_enable' },
	toolbar_image: { default: '' },
	
	custom_css_enable: { default: false },
	custom_css: { default: '', saveDelay: 3000, enableTrigger: 'custom_css_enable' },
	custom_javascript_enable: { default: false },
	custom_javascript: { default: '', saveDelay: 3000, enableTrigger: 'custom_javascript_enable' },
	theme: { default: 'default', saveDelay: 0 },
	
	//
	// Keyboard Shortcuts
	//
	keyboard_shortcuts_enabled: { default: true },
	keyboard_shortcut_up: { default: 81, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_previous: { default: 65, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_next: { default: 90, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_verse_previous: { default: 66, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_verse_next: { default: 78, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_search: { default: 83, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_autoscroll: { default: 88, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_bookmark: { default: 85, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_lds_org: { default: 76, enableTrigger: 'keyboard_shortcuts_enabled' },
	
	//
	// Catalog Helpers
	//
	
	languages: { default: [], dontSave: true },
	language_current: { default: 1, dontSave: true }
};

lds.dm = new lds.DataModel(lds.options_model);
