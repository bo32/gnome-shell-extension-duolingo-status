const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const Constants = Me.imports.constants;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const RESTART_REASON_REMINDER = 'reminder';

DuolingoStatusSettingsWidget.prototype = {

	_init: function() {
		Gettext.textdomain(Me.uuid);
	    Gettext.bindtextdomain(Me.uuid, Me.dir.get_child('locale').get_path());

		this.vbox = new Gtk.Box({
			orientation: Gtk.Orientation.VERTICAL,
			spacing: 6
		});
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

        /***************************************
			Connection section
		***************************************/

		this._grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

		/* Username field */
		let username_label = new Gtk.Label({
			label: _('Username'),
			halign: Gtk.Align.START
		});
		this.username_field = new Gtk.Entry({
			hexpand: true,
			halign: Gtk.Align.FILL
		});
		this.username_field.text = Settings.get_string(Constants.SETTING_USERNAME);
		this._grid.attach(username_label, 0, 0, 1, 1);
		this._grid.attach(this.username_field, 1, 0, 3, 1);

		let www_label = new Gtk.Label({
			label: _('Use \'www\' in the url'),
			hexpand: true,
			halign: Gtk.Align.START
		});
		this._grid.attach(www_label, 0, 4, 3, 1);
		let www_switch = new Gtk.Switch({
			halign: Gtk.Align.END,
			active: Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)
		});
		this._grid.attach(www_switch, 3, 4, 1, 1);
		www_switch.connect('notify::active', function() {
			Settings.set_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY, www_switch.active);
		});

		stack.add_titled(this._grid, "connection", _("Connection"));


		/***************************************
			Content section
		***************************************/

		this._grid = new Gtk.Grid({
			orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

        /* Display lingots switch */
        let display_lingots_label = new Gtk.Label({
        	label: _('Force display of lingots when double or nothing is already displayed'),
			hexpand: true,
        	halign: Gtk.Align.START
        });
		let display_lingots_switch = new Gtk.Switch({
			active: Settings.get_boolean(Constants.SETTING_SHOW_LINGOTS),
			halign: Gtk.Align.END
		});
		display_lingots_switch.connect('notify::active', function() {
			Settings.set_boolean(Constants.SETTING_SHOW_LINGOTS, display_lingots_switch.active);
		});
		this._grid.attach(display_lingots_label, 0, 0, 1, 1);
		this._grid.attach(display_lingots_switch, 1, 0, 1, 1);

		stack.add_titled(this._grid, "content", _("Content"));

		/***************************************
			Icon section
		***************************************/

		this._grid = new Gtk.Grid({
			orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

		/* Corner icon position combobox */
		let position_label = new Gtk.Label({
			label: _('Corner icon position'),
			hexpand: true,
			halign: Gtk.Align.START
		});

		let position_combo = new Gtk.ComboBoxText({
			halign: Gtk.Align.END
		});
		position_combo.append('left', _('Left'));
		position_combo.append('center', _('Center'));
		position_combo.append('right', _('Right'));
		position_combo.set_active_id(Settings.get_string(Constants.SETTING_ICON_POSITION));

		position_combo.connect('changed', function(position_combo) {
			Settings.set_string(Constants.SETTING_ICON_POSITION, position_combo.get_active_id());
		});

		this._grid.attach(position_label, 0, 0, 3, 1);
		this._grid.attach(position_combo, 3, 0, 1, 1);

		/* Index icon position combobox */
		let index_label = new Gtk.Label({
			label: _('Index icon position'),
			hexpand: true,
			halign: Gtk.Align.START
		});

		let index_combo = new Gtk.ComboBoxText({
			halign: Gtk.Align.END
		});
		index_combo.append('0', _('Left'));
		index_combo.append('2', _('Middle'));
		index_combo.append('-1', _('Right'));
		index_combo.set_active_id(Settings.get_string(Constants.SETTING_ICON_INDEX));

		index_combo.connect('changed', function(index_combo) {
			Settings.set_string(Constants.SETTING_ICON_INDEX, index_combo.get_active_id());
		});

		this._grid.attach(index_label, 0, 1, 3, 1);
		this._grid.attach(index_combo, 3, 1, 1, 1);

		/* Hide icon when daily goal is reached */
		let hide_icon_label = new Gtk.Label({
			label: _('Hide icon when daily goal is reached'),
			hexpand: true,
			halign: Gtk.Align.START
		});
		this._grid.attach(hide_icon_label, 0, 2, 3, 1);

		let hide_icon_switch = new Gtk.Switch({
			active: Settings.get_boolean(Constants.SETTING_HIDE_WHEN_DAILY_GOAL_REACHED),
			halign: Gtk.Align.END
		});
		hide_icon_switch.connect('notify::active', function() {
			Settings.set_boolean(Constants.SETTING_HIDE_WHEN_DAILY_GOAL_REACHED, hide_icon_switch.active);
		});
		this._grid.attach(hide_icon_switch, 3, 2, 1, 1);

		/* Change icon color when daily goal is reached */
		let change_icon_color_label = new Gtk.Label({
			label: _('Change icon color when daily goal is reached'),
			hexpand: true,
			halign: Gtk.Align.START
		});
		this._grid.attach(change_icon_color_label, 0, 3, 2, 1);

		let enable_change_icon_color_label_switch = new Gtk.Switch({
			active: Settings.get_boolean(Constants.SETTING_CHANGE_ICON_COLOR_WHEN_DAILY_GOAL_REACHED),
			halign: Gtk.Align.END
		});
		enable_change_icon_color_label_switch.connect('notify::active', function() {
			Settings.set_boolean(Constants.SETTING_CHANGE_ICON_COLOR_WHEN_DAILY_GOAL_REACHED, enable_change_icon_color_label_switch.active);
			color_picker_button.set_sensitive(enable_change_icon_color_label_switch.active);
		});
		this._grid.attach(enable_change_icon_color_label_switch, 2, 3, 1, 1);

		let color_picker_button = new Gtk.ColorButton({
			halign: Gtk.Align.CENTER
		});
		color_picker_button.set_use_alpha(false);
		let rgba = new Gdk.RGBA();
		rgba.parse(Settings.get_string(Constants.SETTING_ICON_COLOR_WHEN_DAILY_GOAL_REACHED));
		color_picker_button.set_rgba(rgba);
		color_picker_button.connect('color-set', function() {
			Settings.set_string(Constants.SETTING_ICON_COLOR_WHEN_DAILY_GOAL_REACHED, color_picker_button.rgba.to_string());
		});
		color_picker_button.set_sensitive(Settings.get_boolean(Constants.SETTING_CHANGE_ICON_COLOR_WHEN_DAILY_GOAL_REACHED));
		this._grid.attach(color_picker_button, 3, 3, 1, 1);

		/* Change icon color when daily goal is not reached */
		change_icon_color_label = new Gtk.Label({
			label: _('Change icon color when daily goal is not reached'),
			hexpand: true,
			halign: Gtk.Align.START
		});
		this._grid.attach(change_icon_color_label, 0, 4, 2, 1);

		let color_picker_button_not_reached = new Gtk.ColorButton({
			halign: Gtk.Align.CENTER
		});
		color_picker_button_not_reached.set_use_alpha(false);

		rgba = new Gdk.RGBA();
		rgba.parse(Settings.get_string(Constants.SETTING_ICON_COLOR_WHEN_DAILY_GOAL_NOT_REACHED));
		color_picker_button_not_reached.set_rgba(rgba);
		color_picker_button_not_reached.connect('color-set', function() {
			Settings.set_string(Constants.SETTING_ICON_COLOR_WHEN_DAILY_GOAL_NOT_REACHED, color_picker_button_not_reached.rgba.to_string());
		});
		this._grid.attach(color_picker_button_not_reached, 3, 4, 1, 1);

		stack.add_titled(this._grid, "icon", _("Icon"));

		/***************************************
			Browser section
		***************************************/

		this._grid = new Gtk.Grid({
			orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

        /* Default browser switch */
        let default_browser_label = new Gtk.Label({
        	label: _('Default browser'),
        	halign: Gtk.Align.START
        });
		this._default_browser_switch = new Gtk.Switch({
			active: Settings.get_boolean(Constants.SETTING_USE_DEFAULT_BROWSER),
			halign: Gtk.Align.END
		});
		this._grid.attach(default_browser_label, 0, 0, 1, 1);
		this._grid.attach(this._default_browser_switch, 1, 0, 3, 1);

        /* Custom browser */
		let custom_browser_label = new Gtk.Label({
			label: _('Browser command'),
			halign: Gtk.Align.START,
			sensitive: !Settings.get_boolean(Constants.SETTING_USE_DEFAULT_BROWSER)
		});
		this._custom_browser_field = new Gtk.Entry({
			hexpand: true,
			halign: Gtk.Align.FILL,
			sensitive: !Settings.get_boolean(Constants.SETTING_USE_DEFAULT_BROWSER)
		});
		this.app_chooser_button = new Gtk.AppChooserButton({
			content_type:"text/html",
			sensitive: !Settings.get_boolean(Constants.SETTING_USE_DEFAULT_BROWSER)
		});
		this.app_chooser_button.set_show_dialog_item(true);
		this.app_chooser_button.set_active(Settings.get_int(Constants.SETTING_APP_CHOOSER_ACTIVE_INDEX));
		this._grid.attach(custom_browser_label, 0, 1, 1, 1);
		this._grid.attach(this._custom_browser_field, 1, 1, 2, 1);
		this._grid.attach(this.app_chooser_button, 3, 1, 1, 1);

		/* if the default browser is set, we initialize the command line field with the command of the app selected in the app chooser button.	Otherwise, we give it the stored value */
		if(!Settings.get_boolean(Constants.SETTING_USE_DEFAULT_BROWSER)) {
			this._custom_browser_field.text = Settings.get_string(Constants.SETTING_OPENING_BROWSER_COMMAND);
		} else {
			this._custom_browser_field.text = this._clean_up_commandline(this.app_chooser_button.get_app_info().get_commandline());
		}

		this._default_browser_switch.connect('notify::active', Lang.bind(this, function() {
			Settings.set_boolean(Constants.SETTING_USE_DEFAULT_BROWSER, this._default_browser_switch.active);
			custom_browser_label.set_sensitive(!this._default_browser_switch.active);
			this._custom_browser_field.set_sensitive(!this._default_browser_switch.active);
			this.app_chooser_button.set_sensitive(!this._default_browser_switch.active);
		}));

		this.app_chooser_button.connect('changed', Lang.bind(this, function() {
			this._custom_browser_field.text = DuolingoStatusSettingsWidget.prototype._clean_up_commandline(this.app_chooser_button.get_app_info().get_commandline());
			Settings.set_int(Constants.SETTING_APP_CHOOSER_ACTIVE_INDEX, this.app_chooser_button.active);
		}));

		stack.add_titled(this._grid, "browser", _("Browser"));


		/***************************************
			Reminder section
		***************************************/

		this.is_reminder_info_displayed = false;

		this._grid = new Gtk.Grid({
			orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

        let activate_alarm_label = new Gtk.Label({
        	label: _('Enable notification')
        });
   		this._grid.attach(activate_alarm_label, 0, 0, 1, 1);

   		let activate_alarm_switch = new Gtk.Switch({
        	active: Settings.get_boolean(Constants.SETTING_IS_REMINDER)
        });
		activate_alarm_switch.connect('notify::active', Lang.bind(this, function() {
			Settings.set_boolean(Constants.SETTING_IS_REMINDER, activate_alarm_switch.active);
			this.notification_time_hour_field.set_sensitive(activate_alarm_switch.active);
			this.notification_time_minute_field.set_sensitive(activate_alarm_switch.active);
			this.inform_to_restart_gnome_shell(RESTART_REASON_REMINDER);
		}));
   		this._grid.attach(activate_alarm_switch, 1, 0, 1, 1);

		let adjustment_hours = new Gtk.Adjustment({
			value: this.get_hour_of_notification_time(),
			upper: 23,
			lower: 0,
			step_increment: 1
		});

		this.notification_time_hour_field = new Gtk.SpinButton({
			max_length: 2,
			numeric: true,
			sensitive: activate_alarm_switch.active
		});
		this.notification_time_hour_field.adjustment = adjustment_hours;
		this.notification_time_hour_field.connect('value_changed', Lang.bind(this, function() {
			Settings.set_string(Constants.SETTING_NOTIFICATION_TIME, this.get_notification_time());
			this.inform_to_restart_gnome_shell(RESTART_REASON_REMINDER);
		}));

		let adjustment_mintues = new Gtk.Adjustment({
			value: this.get_minute_of_notification_time(),
			upper: 59,
			lower: 0,
			step_increment: 1
		});
		this.notification_time_minute_field = new Gtk.SpinButton({
			max_length: 2,
			numeric: true,
			sensitive: activate_alarm_switch.active
		});
		this.notification_time_minute_field.set_value(this.get_minute_of_notification_time());
		this.notification_time_minute_field.adjustment = adjustment_mintues;
		this.notification_time_minute_field.connect('value_changed', Lang.bind(this, function() {
			Settings.set_string(Constants.SETTING_NOTIFICATION_TIME, this.get_notification_time());
			this.inform_to_restart_gnome_shell(RESTART_REASON_REMINDER);
		}));

		this._grid.attach(this.notification_time_hour_field, 2, 0, 1, 1);
		this._grid.attach(new Gtk.Label({label: ':'}), 3, 0, 1, 1);
		this._grid.attach(this.notification_time_minute_field, 4, 0, 1, 1);

		this.info_reminder = new Gtk.Label({
			label: ''
		});
		this._grid.attach(this.info_reminder, 0, 2, 5, 1);

		stack.add_titled(this._grid, "reminder", _("Reminder"));

		this.vbox.pack_start(stack_switcher, false, true, 0);
		this.vbox.pack_start(stack, true, true, 0);

		return;
	},

	get_notification_time: function() {
		return this.notification_time_hour_field.value + ':' + this.notification_time_minute_field.value;
	},

	get_hour_of_notification_time: function() {
		return Settings.get_string(Constants.SETTING_NOTIFICATION_TIME).split(':')[0];
	},

	get_minute_of_notification_time: function() {
		return Settings.get_string(Constants.SETTING_NOTIFICATION_TIME).split(':')[1];
	},

	inform_to_restart_gnome_shell: function(stack_label) {
		switch (stack_label) {
			case RESTART_REASON_REMINDER:
				if (this.info_reminder.label == '') {
					this.info_reminder.label = _('Restart gnome-shell (Alt + F2, then enter \'r\') to apply the reminder changes.');
				}
				break;
			default:
		}
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
		scrollingWindow.connect('destroy', Lang.bind(this, function() {
			if (this.username_field.text != Settings.get_string(Constants.SETTING_USERNAME)) {
				Settings.set_string(Constants.SETTING_USERNAME, this.username_field.text);
			}
			if(!this._default_browser_switch.active && this._custom_browser_field.text != '') {
				if (Settings.get_string(Constants.SETTING_OPENING_BROWSER_COMMAND) != this._custom_browser_field.text) {
					Settings.set_string(Constants.SETTING_OPENING_BROWSER_COMMAND, this._custom_browser_field.text);
				}
			} else {
				if (Settings.get_string(Constants.SETTING_OPENING_BROWSER_COMMAND) != 'xdg-open') {
					Settings.set_string(Constants.SETTING_OPENING_BROWSER_COMMAND, 'xdg-open');
				}
				if (Settings.get_string(Constants.SETTING_USE_DEFAULT_BROWSER) !== this._default_browser_switch.active) {
					Settings.set_boolean(Constants.SETTING_USE_DEFAULT_BROWSER, this._default_browser_switch.active);
				}

			}
		}));
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
