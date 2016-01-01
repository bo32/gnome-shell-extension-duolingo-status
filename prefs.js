const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

let username_field;

DuolingoStatusSettingsWidget.prototype = {

	_init: function() {		
	
		this.vbox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 6});
		let stack = new Gtk.Stack({
            transition_type: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
            transition_duration: 500,
            margin_left: 10,
            margin_right: 10
        });
        let stack_switcher = new Gtk.StackSwitcher({
            margin_left: 5,
            margin_top: 5,
            margin_bottom: 5,
            margin_right: 5,
            halign: Gtk.Align.CENTER,
            stack: stack
        });
        
		this._grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4 });

		/* Username field */
		let username_label = new Gtk.Label({label: 'Username', halign: Gtk.Align.START});
		username_field = new Gtk.Entry({hexpand: true, halign: Gtk.Align.FILL});
		username_field.text = Settings.get_string('username');
		this._grid.attach(username_label, 0, 0, 1, 1);
		this._grid.attach(username_field, 1, 0, 3, 1);
		
		/* Hide icon when daily goal is reached */
		let hide_icon_label = new Gtk.Label({label: 'Hide icon when daily goal is reached', hexpand: true, halign: Gtk.Align.START});
		this._grid.attach(hide_icon_label, 0, 1, 3, 1);
		let hide_icon_switch = new Gtk.Switch({active: Settings.get_boolean('hide-when-daily-goal-reached'), halign: Gtk.Align.END});
		hide_icon_switch.connect('notify::active', function() {
			Settings.set_boolean('hide-when-daily-goal-reached', hide_icon_switch.active);
		});
		this._grid.attach(hide_icon_switch, 2, 1, 1, 1);
		
		/* Change icon color when daily goal is reached */
		let change_icon_color_label = new Gtk.Label({label: 'Icon color when daily goal is reached', hexpand: true, halign: Gtk.Align.START});
		this._grid.attach(change_icon_color_label, 0, 2, 2, 1);
		
		let initial_active = Settings.get_boolean('change-icon-color-when-daily-goal-reached');
		let enable_change_icon_color_label_switch = new Gtk.Switch({active: initial_active, halign: Gtk.Align.END});
		enable_change_icon_color_label_switch.connect('notify::active', function() {
			Settings.set_boolean('change-icon-color-when-daily-goal-reached', enable_change_icon_color_label_switch.active);
			color_picker_button.set_sensitive(enable_change_icon_color_label_switch.active);
		});
		this._grid.attach(enable_change_icon_color_label_switch, 2, 2, 1, 1);
		
		let color_picker_button = new Gtk.ColorButton({halign: Gtk.Align.CENTER});
		color_picker_button.set_use_alpha(false);
		let rgba = new Gdk.RGBA();
		rgba.parse(Settings.get_string('icon-color-when-daily-goal-reached'));
		color_picker_button.set_rgba(rgba);
		color_picker_button.connect('color-set', function() {
			Settings.set_string('icon-color-when-daily-goal-reached', color_picker_button.rgba.to_string());
		});
		color_picker_button.set_sensitive(initial_active);
		this._grid.attach(color_picker_button, 3, 2, 1, 1);
		
		/* Change icon color when daily goal is not reached */
		change_icon_color_label = new Gtk.Label({label: 'Icon color when daily goal is reached', hexpand: true, halign: Gtk.Align.START});
		this._grid.attach(change_icon_color_label, 0, 3, 2, 1);
		
		let color_picker_button_not_reached = new Gtk.ColorButton({halign: Gtk.Align.CENTER});
		color_picker_button_not_reached.set_use_alpha(false);
		let rgba = new Gdk.RGBA();
		rgba.parse(Settings.get_string('icon-color-when-daily-goal-not-reached'));
		color_picker_button_not_reached.set_rgba(rgba);
		color_picker_button_not_reached.connect('color-set', function() {
			Settings.set_string('icon-color-when-daily-goal-not-reached', color_picker_button_not_reached.rgba.to_string());
		});
		this._grid.attach(color_picker_button_not_reached, 3, 3, 1, 1);
		
		stack.add_titled(this._grid, "main", "Main");
		
		this._grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4 });
        /* Default browser switch */
        let default_browser_label = new Gtk.Label({label: 'Default browser', halign: Gtk.Align.START});
		_default_browser_switch = new Gtk.Switch({active: Settings.get_boolean('use-default-browser'), halign: Gtk.Align.END});
		this._grid.attach(default_browser_label, 0, 0, 1, 1);
		this._grid.attach(_default_browser_switch, 1, 0, 3, 1);

        /* Custom browser */
		let custom_browser_label = new Gtk.Label({
			label: 'Browser command', 
			halign: Gtk.Align.START,
			sensitive: !Settings.get_boolean('use-default-browser')});
		_custom_browser_field = new Gtk.Entry({
			hexpand: true, 
			halign: Gtk.Align.FILL,
			sensitive: !Settings.get_boolean('use-default-browser')});
		let app_chooser_button = new Gtk.AppChooserButton({
			content_type:"text/html",
			sensitive: !Settings.get_boolean('use-default-browser')});
		app_chooser_button.set_show_dialog_item(true)
		app_chooser_button.set_active(Settings.get_int('app-chooser-active-index'));
		this._grid.attach(custom_browser_label, 0, 1, 1, 1);
		this._grid.attach(_custom_browser_field, 1, 1, 2, 1);
		this._grid.attach(app_chooser_button, 3, 1, 1, 1);
		
		/* if the default browser is set, we initialize the command line field with the command of the app selected in the app chooser button.	Otherwise, we give it the stored value */
		if(!Settings.get_boolean('use-default-browser')) {
			_custom_browser_field.text = Settings.get_string('opening-browser-command');
		} else {
			_custom_browser_field.text = this._clean_up_commandline(app_chooser_button.get_app_info().get_commandline());
		}
		
		_default_browser_switch.connect('notify::active', function() {
			Settings.set_boolean('use-default-browser', _default_browser_switch.active);
			custom_browser_label.set_sensitive(!_default_browser_switch.active);
			_custom_browser_field.set_sensitive(!_default_browser_switch.active);
			app_chooser_button.set_sensitive(!_default_browser_switch.active);
		});
		
		app_chooser_button.connect('changed', function(app_chooser_button) {
			_custom_browser_field.text = DuolingoStatusSettingsWidget.prototype._clean_up_commandline(app_chooser_button.get_app_info().get_commandline());
			Settings.set_int('app-chooser-active-index', app_chooser_button.active);
		});
		
		stack.add_titled(this._grid, "browser", "Browser");
		this.vbox.pack_start(stack_switcher, false, true, 0);
		this.vbox.pack_start(stack, true, true, 0);
		
		return;
	},
	
	
	_completePrefsWidget: function() {
        let scrollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        scrollingWindow.add_with_viewport(this.vbox);
        scrollingWindow.width_request = 400;
        scrollingWindow.show_all();
		scrollingWindow.unparent();
		scrollingWindow.connect('destroy', function() {
			Settings.set_string('username', username_field.text);
			if(!_default_browser_switch.active && _custom_browser_field.text != '') {
				Settings.set_string('opening-browser-command', _custom_browser_field.text);
			} else {
				Settings.set_string('opening-browser-command', 'xdg-open');
				Settings.set_boolean('use-default-browser', true);
			}
		});
        return scrollingWindow;
    },
    
    _clean_up_commandline: function(commandline) {
    	return commandline
    			.replace("%U", "")
    			.replace("%u", "")
    			.trim();
    },

};

function init() {
}

function DuolingoStatusSettingsWidget() {
    this._init();
}

function buildPrefsWidget() {
    let widget = new DuolingoStatusSettingsWidget();
	return widget._completePrefsWidget();
}

