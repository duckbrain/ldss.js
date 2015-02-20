if (typeof(lds) != 'object') var lds = {};

lds.options_model = {
	first_use: { defaultValue: true },
	developer_mode: { defaultValue: true },
	
	//
	// Read Tracking
	//
	
	read_tracking_enabled: { defaultValue: false },
	read_streak_started: { defaultValue: new Date() },
	read_streak_confirmed_to: { defaultValue: new Date() },
	read_streak_pending_days: { defaultValue: [] },
	
	//
	// Rendering Options
	//
	show_footnote_letters: { defaultValue: true },
	
	//
	// Style options
	//
	
	font_typeset: { defaultValue: '' },
	
	font_size_enable: { defaultValue: false },
	font_size: { defaultValue: 0, saveDelay: 1000, enableTrigger: 'font_size_enable'},
	margin_size: { defaultValue: 0, saveDelay: 1000 },
	subtitle_size_enable: { defaultValue: false },
	subtitle_size: { defaultValue: 0, saveDelay: 1000, enableTrigger: 'subtitle_size_enable' },
	title_size_enable: { defaultValue: false },
	title_size: { defaultValue: 0, saveDelay: 1000, enableTrigger: 'title_size_enable' },
	font_color_enable: { defaultValue: false },
	font_color: { defaultValue: '#000000', saveDelay: 1000, enableTriggers: 'font_color_enable' },
	link_color_enable: { defaultValue: false },
	link_color: { defaultValue: '#0000ff', saveDelay: 1000, enableTrigger: 'link_color_enable' },
	font_family_enable: { defaultValue: false }, 
	font_family: { defaultValue: "", enableTrigger: 'font_family_enable' }, 
	background_color_enable: { defaultValue: false },
	background_color: { defaultValue: '#ffffff', saveDelay: 1000, enableTrigger: 'background_color_enable' },
	
	toolbar_size_enable: { defaultValue: false },
	toolbar_size: { defaultValue: 0, saveDelay: 1000, enableTrigger: 'toolbar_size_enable' },
	toolbar_font_color_enable: { defaultValue: false },
	toolbar_font_color: { defaultValue: '#000000', saveDelay: 1000, enableTrigger: 'toolbar_font_color_enable' },
	toolbar_color_enable: { defaultValue: false },
	toolbar_color: { defaultValue: '#ffffff', saveDelay: 1000, enableTrigger: 'toolbar_color_enable' },
	toolbar_image: { defaultValue: '' },
	
	custom_css_enable: { defaultValue: false },
	custom_css: { defaultValue: '', saveDelay: 3000, enableTrigger: 'custom_css_enable' },
	custom_javascript_enable: { defaultValue: false },
	custom_javascript: { defaultValue: '', saveDelay: 3000, enableTrigger: 'custom_javascript_enable' },
	theme: { defaultValue: 'default', saveDelay: 0 },
	
	//
	// Keyboard Shortcuts
	//
	keyboard_shortcuts_enabled: { defaultValue: true },
	keyboard_shortcut_up: { defaultValue: 81, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_previous: { defaultValue: 65, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_next: { defaultValue: 90, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_verse_previous: { defaultValue: 66, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_verse_next: { defaultValue: 78, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_search: { defaultValue: 83, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_autoscroll: { defaultValue: 88, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_bookmark: { defaultValue: 85, enableTrigger: 'keyboard_shortcuts_enabled' },
	keyboard_shortcut_lds_org: { defaultValue: 76, enableTrigger: 'keyboard_shortcuts_enabled' },
	
	//
	// Catalog Helpers
	//
	
	languages: { defaultValue: [], dontSave: true },
	language_current: { defaultValue: 1, dontSave: true }
};

lds.dm = new lds.DataModel(lds.options_model);
