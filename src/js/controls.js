//controls.js
//
// Specifies the user interactions with the content display pages, specifically, keyboard shortcuts
//

$(document).on('keydown', function(e) {
    var code = e.keyCode;
    if (!lds.ko.keyboard_shortcuts_enabled())
        console.debug(code);
    else if (code == lds.ko.keyboard_shortcut_up())
        $('#uplevel').trigger('click');
    else if (code == lds.ko.keyboard_shortcut_previous())
        $('#previous').trigger('click');
    else if (code == lds.ko.keyboard_shortcut_next())
        $('#next').trigger('click');
    else if (code == lds.ko.keyboard_shortcut_verse_previous())
        ; //TODO: Scroll to next verse
    else if (code == lds.ko.keyboard_shortcut_verse_next())
        ; //TODO: Scroll to next verse
    else if (code == lds.ko.keyboard_shortcut_search())
        ; // TODO: Activate Searchbox
    else if (code == lds.ko.keyboard_shortcut_autoscroll())
        ; //TODO: toggle autoscroll
    else if (code == lds.ko.keyboard_shortcut_bookmark())
        $('#bookmark').trigger('click');
    else if (code == lds.ko.keyboard_shortcut_lds_org())
        $('#ldsorg').trigger('click');
    
    if (code == 27)
        $('#ref-close').trigger('click');
});