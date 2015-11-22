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
		this._grid.attach(change_icon_color_label, 0, 3, 2, 1);
		
		let initial_active = Settings.get_boolean('change-icon-color-when-daily-goal-reached');
		let enable_change_icon_color_label_switch = new Gtk.Switch({active: initial_active, halign: Gtk.Align.END});
		enable_change_icon_color_label_switch.connect('notify::active', function() {
			Settings.set_boolean('change-icon-color-when-daily-goal-reached', enable_change_icon_color_label_switch.active);
			color_picker_button.set_sensitive(enable_change_icon_color_label_switch.active);
		});
		this._grid.attach(enable_change_icon_color_label_switch, 2, 3, 1, 1);
		
		let color_picker_button = new Gtk.ColorButton({halign: Gtk.Align.CENTER});
		color_picker_button.set_use_alpha(false);
		let rgba = new Gdk.RGBA();
		rgba.parse(Settings.get_string('icon-color-when-daily-goal-reached'));
		color_picker_button.set_rgba(rgba);
		color_picker_button.connect('color-set', function() {
			Settings.set_string('icon-color-when-daily-goal-reached', color_picker_button.rgba.to_string());
		});
		color_picker_button.set_sensitive(initial_active);
		this._grid.attach(color_picker_button, 3, 3, 1, 1);
		
		return;
	},
	
	
	_completePrefsWidget: function() {
        let scrollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        scrollingWindow.add_with_viewport(this._grid);
        scrollingWindow.width_request = 400;
        scrollingWindow.show_all();
		scrollingWindow.unparent();
		scrollingWindow.connect('destroy', function() {
			Settings.set_string('username', username_field.text);
		});
        return scrollingWindow;
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

