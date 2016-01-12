const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Duolingo = Me.imports.duolingo.Duolingo;
const Util = imports.misc.util;
const FLAGS = Me.imports.flagsKeys.flags;
const Utils = Me.imports.utils;
const Settings = Convenience.getSettings();
const GLib = imports.gi.GLib;
const TimeZone = imports.gi.GLib.TimeZone;
const DateTime = imports.gi.GLib.DateTime;
const Mainloop = imports.mainloop;

let icon_size = 16;
let menu_width = 250;
let duolingo_green = '#78C800';
let notification_label = 'Duolingo Status extension';

const DuolingoMenuButton = new Lang.Class({
    Name: 'Duolingo.DuolingoMenuButton',
    Extends: PanelMenu.Button,

	_init: function() {
        this.parent(0.0, 'duolingo');
        // let tz = TimeZone.new_local();
		// let now = DateTime.new_now(tz);
        // global.log(now.get_hour() + ':' + now.get_minute() + ':' + now.get_second());
        // let now_time = now.get_hour() * 3600 + now.get_minute() * 60 + now.get_second();
        // let alarm_time = 23 * 3600 + 48 * 60 + 59;
        // global.log(now_time);
        // global.log(alarm_time - now_time);
        // let delay = alarm_time - now_time;
        // if (delay < 0) {
        //     delay =
        // }
        // Mainloop.timeout_add((alarm_time - now_time) * 1000, Lang.bind(this, function() {
        //     Main.notify('blabla', 'blabal');
        // }));


		this.duolingo = new Duolingo(Settings.get_string('username'));
		this.duolingo.get_raw_data(Lang.bind(this, this._create_menus));
	},

	_create_menus: function(error) {
		if (Settings.get_boolean('hide-when-daily-goal-reached') && this.duolingo.is_daily_goal_reached()) {
			this.destroy();
			return;
		}

		if(error) {
			//TODO use notifyerror maybe??
			Main.notify(notification_label, error);
			this._init_icon(Me.path + "/icons/duolingo-alert-symbolic.svg");
			this._init_duolingo_menu();
			return;
		};

		this._init_icon(Me.path + "/icons/duolingo-symbolic.svg");
		this._init_duolingo_menu();

		/* display profile menu */
		this.todays_improvement = new St.Label({y_align: Clutter.ActorAlign.CENTER});
		this.profile_menu = new PopupMenu.PopupBaseMenuItem();
		this.profile_menu.actor.add(this.todays_improvement);

		let streak_label = new St.Label({x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
		if (this.duolingo.get_streak() != 0) {
			streak_label.text =  this.duolingo.get_streak().toString();
			streak_label.style_class = 'streak';
		} else {
			streak_label.text = '';
		}
		this.profile_menu.actor.add(streak_label, {expand: true});

		this.menu.addMenuItem(this.profile_menu);
		let improvement = this.duolingo.get_improvement();
		let daily_goal = this.duolingo.get_daily_goal();
		this._set_todays_improvement(improvement, daily_goal);

		/* display language menus */
		let languages = this.duolingo.get_languages();
		this._add_language_menus(languages);

		let lingots = this.duolingo.get_lingots();
		this._display_lingots(lingots);
	},

	_init_icon: function(path) {
		this.hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
		let gicon = Gio.icon_new_for_string(path);
		let icon = new St.Icon({gicon: gicon, icon_size: icon_size});
        this.hbox.add_child(icon);
        this.actor.add_style_class_name("panel-status-button");
		this.actor.add_child(this.hbox);
	},

	_init_duolingo_menu: function() {
		/* Duolingo menu */
		let link_menu = new PopupMenu.PopupBaseMenuItem();
		link_menu.actor.width = menu_width;
		let link_label = new St.Label({ text: 'Duolingo.com', x_align: Clutter.ActorAlign.CENTER });
		link_label.style = 'color: ' + duolingo_green + ';';
		link_label.style += 'font-weight: bold;'
		link_menu.actor.add(link_label, { expand: true });
		link_menu.connect('activate', function() {
			//Util.spawn(['xdg-open', 'http://duolingo.com']);
			Util.spawn([Settings.get_string('opening-browser-command'), 'http://duolingo.com']);
		});

		/* refresh button */
		let refresh_icon = new St.Icon({
			icon_name: 'view-refresh-symbolic',
			style_class: 'system-actions-icon',
			icon_size: icon_size
		});
		let refresh_button = new St.Button({child: refresh_icon});
		refresh_button.connect('clicked', this._refresh);
		link_menu.actor.add(refresh_button, {expand: false});

		/* Preferences button */
		let preferences_icon = new St.Icon({
			icon_name: 'system-run-symbolic',
			style_class: 'system-actions-icon',
			icon_size: icon_size
		});
		let preferences_button = new St.Button({child: preferences_icon});
		preferences_button.connect('clicked', Lang.bind(this, function() {
			launch_extension_prefs(Me.uuid);
		}));
		link_menu.actor.add(preferences_button, {expand: false});

		this.menu.addMenuItem(link_menu);
	},

	_refresh: function() {
		disable();
		enable();
	},

	_add_language_menus: function(languages) {
		for (let l in languages) {
			let m = new LanguageSubMenu(languages[l]);
			this.menu.addMenuItem(m);
		}
	},

	_display_lingots: function(amount) {
		let gicon = Gio.icon_new_for_string(Me.path + "/icons/ruby.png");
		let lingots_icon = new St.Icon({gicon: gicon, icon_size: icon_size, y_align:Clutter.ActorAlign.CENTER});
		this.profile_menu.actor.add(lingots_icon);
		let lingots_label = new St.Label({y_align:Clutter.ActorAlign.CENTER, text: Utils.formatThousandNumber(amount.toString())});
		this.profile_menu.actor.add(lingots_label);
		this.profile_menu.connect('activate', this._open_lingots_link);
	},

	_open_lingots_link: function() {
		Util.spawn(['xdg-open', 'http://duolingo.com/show_store']);
	},

	_set_todays_improvement: function(improvement, daily_goal) {
		this.today_improvement = improvement;
		this.daily_goal = daily_goal;
		this.todays_improvement.text = improvement + ' / ' + daily_goal + ' XP';

		let is_daily_goal_reached = improvement >= daily_goal;

		if (!is_daily_goal_reached) {
			this.hbox.get_child_at_index(0).style = 'color: ' + Settings.get_string('icon-color-when-daily-goal-not-reached') +';'
		} else {
			if(Settings.get_boolean('change-icon-color-when-daily-goal-reached')) {
				this.hbox.get_child_at_index(0).style = 'color: ' + Settings.get_string('icon-color-when-daily-goal-reached') +';'
			}
		}
	},

    destroy: function() {
		this.parent();
    },
});

const LanguageSubMenu = new Lang.Class({
    Name: 'Duolingo.LanguageMenu',
    Extends: PopupMenu.PopupSubMenuMenuItem,

	_init: function(language) {
		this.parent(language['label'], true);

		/* display the flag */
		let flag_name = FLAGS[language['label']];
		this.icon.gicon = Gio.icon_new_for_string(Me.path + '/icons/flags/' + flag_name);
		this.icon.icon_size = icon_size;

		/* Insert the current level of the language. 5 is the index of the last position in the sub menu */
		this.actor.insert_child_at_index(new St.Label({ text: 'lvl. ' + language['level'].toString(), y_align: Clutter.ActorAlign.CENTER }), 5);

		/* Add the menu displaying the global points of the language */
		let menu_total_points = new PopupMenu.PopupBaseMenuItem();
		menu_total_points.actor.add(new St.Label({text: 'Total', x_expand: true, style: 'font-weight: bold;'}));
		menu_total_points.actor.add(new St.Label({text: Utils.formatThousandNumber(language['points'].toString()) + ' XP', style: 'font-weight: bold;'}));
		this.menu.addMenuItem(menu_total_points);

		let menu_next_level = new PopupMenu.PopupBaseMenuItem();
		menu_next_level.actor.add(new St.Label({text: 'Next level in', x_expand: true}));
		menu_next_level.actor.add(new St.Label({text: Utils.formatThousandNumber(language['to_next_level'].toString()) + ' XP'}));
		this.menu.addMenuItem(menu_next_level);
	},
});

function launch_extension_prefs(uuid) {
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    let info = app.get_app_info();
    let timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
        ['extension:///' + uuid],
        global.create_app_launch_context(timestamp, -1)
    );
}

function init() {
}

let menu;
function enable() {
    menu = new DuolingoMenuButton;
    Main.panel.addToStatusArea('duolingo', menu);
}

function disable() {
	menu.destroy();
}
