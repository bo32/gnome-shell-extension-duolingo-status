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
const Reminder = Me.imports.reminder.Reminder;
const FLAGS = Me.imports.flagsKeys.flags;
const Utils = Me.imports.utils;
const Constants = Me.imports.constants;

const Util = imports.misc.util;
const Settings = Convenience.getSettings();

const Gettext = imports.gettext;
const _ = Gettext.domain(Me.uuid).gettext;

let icon_size = 16;
let menu_width = 250;

const DuolingoMenuButton = new Lang.Class({
    Name: 'Duolingo.DuolingoMenuButton',
    Extends: PanelMenu.Button,

	_init: function() {
        this.parent(0.0, 'duolingo');

	    Gettext.bindtextdomain(Me.uuid, Me.dir.get_child('locale').get_path());

        this.reminder = null;
		this.duolingo = new Duolingo(
			Settings.get_string(Constants.SETTING_USERNAME),
			Settings.get_string(Constants.SETTING_PASSWORD));
		this.duolingo.get_raw_data(Lang.bind(this, this._create_menus));

        this._settings_changed = false;
        Settings.connect('changed', Lang.bind(this, function() {
			if (this._settings_changed !== true)
				this._settings_changed = true;
		}));
	},

	_create_menus: function(error) {
		if (Settings.get_boolean(Constants.SETTING_HIDE_WHEN_DAILY_GOAL_REACHED) && this.duolingo.is_daily_goal_reached()) {
			this.destroy();
			return;
		}

		if(error) {
			Main.notify(Constants.LABEL_NOTIFICATION_TITLE, error);
			this._init_icon(Constants.ICON_DUOLINGO_ALERT);
			this._init_duolingo_menu();
		} else {
    		this._init_icon(Constants.ICON_DUOLINGO);
    		this._init_duolingo_menu();

    		/* display profile menu */
    		this.todays_improvement = new St.Label({
                y_align: Clutter.ActorAlign.CENTER});
    		this.profile_menu = new PopupMenu.PopupBaseMenuItem();

    		this.profile_menu.actor.add(this.todays_improvement);

    		let streak_label = new St.Label({
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER });
    		if (this.duolingo.get_streak() != 0) {
    			streak_label.text =  this.duolingo.get_streak().toString();
                if (this.duolingo.is_frozen()) {
                    streak_label.style_class = Constants.STYLE_STREAK_FROZEN;
                } else {
                    streak_label.style_class = Constants.STYLE_STREAK_NOT_FROZEN;
                }

    		} else {
    			streak_label.text = '';
    		}
    		this.profile_menu.actor.add(streak_label, {expand: true});

    		this.menu.addMenuItem(this.profile_menu);
    		this._set_todays_improvement();
    		this._display_lingots();
            this._display_double_or_nothing();

    		/* display language menus */
    		this._add_language_menus();

			// this._add_purchase_menu();

            // initiate reminder
            this._initiate_reminder();
        }
        this._finalize_menu_icon();
	},

	_init_icon: function(path) {
		this.hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
		let gicon = Gio.icon_new_for_string(path);
		let icon = new St.Icon({gicon: gicon, icon_size: icon_size});
        this.hbox.add_child(icon);
        this.actor.add_style_class_name('panel-status-button');
		this.actor.add_child(this.hbox);
	},

	_init_duolingo_menu: function() {
		/* Duolingo menu */
		let link_menu = new PopupMenu.PopupBaseMenuItem();
		link_menu.actor.width = menu_width;
		let link_label = new St.Label({ text: 'Duolingo.com', x_align: Clutter.ActorAlign.CENTER });
        link_label.add_style_class_name(Constants.STYLE_DUOLINGO_LINK);
		link_menu.actor.add(link_label, { expand: true });
		link_menu.connect('activate', function() {
			Util.spawn([Settings.get_string(Constants.SETTING_OPENING_BROWSER_COMMAND), Constants.URL_DUOLINGO_HOME]);
		});

		/* refresh button */
		let refresh_icon = new St.Icon({
			icon_name: 'view-refresh-symbolic',
			style_class: 'system-actions-icon',
			icon_size: icon_size
		});
		this.refresh_button = new St.Button({child: refresh_icon});
		link_menu.actor.add(this.refresh_button, {expand: false});

		/* Preferences button */
		let preferences_icon = new St.Icon({
			icon_name: 'system-run-symbolic',
			style_class: 'system-actions-icon',
			icon_size: icon_size
		});
		let preferences_button = new St.Button({child: preferences_icon});
		preferences_button.connect('clicked', Lang.bind(this, function() {
            this.emit(Constants.EVENT_PREFERENCES);
		}));
		link_menu.actor.add(preferences_button, {expand: false});

		this.menu.addMenuItem(link_menu);
	},

    get_refresh_button: function() {
        return this.refresh_button;
    },

    _initiate_reminder: function() {
        this.reminder = new Reminder(this.duolingo);
        if (!this.duolingo.is_daily_goal_reached()) {
            this.reminder.start();
        }
    },

    _stop_reminder: function() {
        if (this.reminder != null)
            this.reminder.stop();
    },

	_add_language_menus: function() {
        let languages = this.duolingo.get_languages();
		for (let l in languages) {
			let m = new LanguageSubMenu(languages[l], this.duolingo);
			this.menu.addMenuItem(m);
			m.connect(Constants.EVENT_REFRESH, Lang.bind(this, function () {
        		this.emit(Constants.EVENT_REFRESH);
			}));
		}
	},

	_display_lingots: function() {
        if(this.duolingo.get_double_or_nothing_status() == null || Settings.get_boolean(Constants.SETTING_SHOW_LINGOTS)) {
            let lingots = this.duolingo.get_lingots();
        	let gicon = Gio.icon_new_for_string(Constants.ICON_LINGOTS);
        	let lingots_icon = new St.Icon({
                gicon: gicon,
                icon_size: icon_size,
                y_align: Clutter.ActorAlign.CENTER});
        	let lingots_label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                text: Utils.formatThousandNumber(lingots.toString())});
            lingots_label.add_style_class_name(Constants.STYLE_LINGOTS_LABEL);
        	this.profile_menu.connect('activate', this._open_lingots_link);
            this.profile_menu.actor.add(lingots_icon);
        	this.profile_menu.actor.add(lingots_label);
        }
	},

    _display_double_or_nothing: function() {
        let double_or_nothing = this.duolingo.get_double_or_nothing_status();
        if (double_or_nothing != null) {
            let gicon = Gio.icon_new_for_string(Constants.ICON_FIRE);
        	let fire_icon = new St.Icon({
                gicon: gicon,
                icon_size: icon_size,
                y_align: Clutter.ActorAlign.CENTER});
    		let double_or_nothing_label = new St.Label({
                y_align:Clutter.ActorAlign.CENTER,
                text: double_or_nothing + Constants.LABEL_XP_SEPARATOR + '7'});
            double_or_nothing_label.add_style_class_name(Constants.STYLE_DOUBLE_OR_NOTHING_LABEL);
        	this.profile_menu.connect('activate', this._open_lingots_link);
    		this.profile_menu.actor.add(fire_icon);
    		this.profile_menu.actor.add(double_or_nothing_label);
        }
	},

	_open_lingots_link: function() {
        Util.spawn([Settings.get_string(Constants.SETTING_OPENING_BROWSER_COMMAND), Constants.URL_DUOLINGO_STORE]);
	},

	_set_todays_improvement: function() {
		let improvement = this.duolingo.get_improvement();
		let daily_goal = this.duolingo.get_daily_goal();
		this.todays_improvement.text = improvement + Constants.LABEL_XP_SEPARATOR + daily_goal + ' XP';

		if (!this.duolingo.is_daily_goal_reached()) {
			this.hbox.get_child_at_index(0).style = 'color: ' + Settings.get_string(Constants.SETTING_ICON_COLOR_WHEN_DAILY_GOAL_NOT_REACHED) +';'
		} else {
			if(Settings.get_boolean(Constants.SETTING_CHANGE_ICON_COLOR_WHEN_DAILY_GOAL_REACHED)) {
				this.hbox.get_child_at_index(0).style = 'color: ' + Settings.get_string(Constants.SETTING_ICON_COLOR_WHEN_DAILY_GOAL_REACHED) +';'
			}
		}
	},

    _finalize_menu_icon: function() {
        // for the top right corner, use Main.panel.addToStatusArea() with an index as a 3rd parameter.
        // let index = 0; // 0, 1: normal in the queue, 2: just at the left of the main menu, -1: completely in the top right corner
        // let position = 'right';
        let index = parseInt(Settings.get_string(Constants.SETTING_ICON_INDEX));
        let position = Settings.get_string(Constants.SETTING_ICON_POSITION);
        Main.panel.addToStatusArea('duolingo', this, index, position);
        this.emit(Constants.EVENT_READY);
    },

    have_settings_been_changed: function() {
        return this._settings_changed;
    },

	_add_purchase_menu: function() {
		if (Settings.get_boolean(Constants.SETTING_USE_AUTHENTICATION)) {

			/* Duolingo menu */
			// let purchase_menu = new PopupMenu.PopupBaseMenuItem();
			// purchase_menu.actor.width = menu_width;

			let buy_streak_button = new St.Button({
            	style_class: 'system-menu-action',
				x_fill: false,
            	can_focus: true
        	});

			// Set the Icon of the Button
			let gicon = Gio.icon_new_for_string(Constants.ICON_ICE_CUBE);
        	let buy_streak_icon = new St.Icon({
				gicon: gicon, 
				icon_size: icon_size
			});
			buy_streak_button.set_child(buy_streak_icon);
			// this.menu.box.add_child(buy_streak_button);

			let buy_fire_button = new St.Button({
            	style_class: 'system-menu-action',
				x_fill: false,
            	can_focus: true
        	});
			gicon = Gio.icon_new_for_string(Constants.ICON_FIRE);
        	let buy_fire_icon = new St.Icon({
				gicon: gicon, 
				icon_size: icon_size
			});
			buy_fire_button.set_child(buy_fire_icon);

			let buttons_box = new St.BoxLayout({
				style_class: 'buttons-box'
			});

			buttons_box.add(buy_streak_button);
			buttons_box.add(buy_fire_button);

			this.menu.box.add_child(buttons_box);

			buy_streak_button.connect('clicked', Lang.bind(this, function() {
				global.log('here');
				this.duolingo.buy_item(
					'streak_freeze', 
					// 'rupee_wager',
					Lang.bind(this, function() {
						this.emit(Constants.EVENT_REFRESH);
					}),
					this.print_error
				);	
			}));
		}
	},

	print_error: function(error_message) {
		Main.notify(Constants.LABEL_NOTIFICATION_TITLE, error_message);
	},

    destroy: function() {
        this._stop_reminder();
		this.parent();
    },
});

const LanguageSubMenu = new Lang.Class({
    Name: 'Duolingo.LanguageMenu',
    Extends: PopupMenu.PopupSubMenuMenuItem,

	_init: function(language, duolingo) {
		this.parent(language[Constants.LANGUAGE_LABEL], true);
        this.language_code = language[Constants.LANGUAGE_CODE];

		/* display the flag */
		let flag_name = FLAGS[language[Constants.LANGUAGE_LABEL]];
		this.icon.gicon = Gio.icon_new_for_string(Constants.ICON_FLAG_PATH + flag_name);
		this.icon.icon_size = icon_size;

        // TODO: display star or change label color
		// if (language[Constants.LANGUAGE_CURRENT_LANGUAGE]) {
		// 	if (duolingo.get_count_learned_chapters() == duolingo.get_count_available_chapters()) {
        //         let gicon = Gio.icon_new_for_string(Constants.ICON_MEDAL);
        // 		let completed_icon = new St.Icon({gicon: gicon, icon_size: icon_size});
		// 		this.actor.insert_child_at_index(completed_icon, 3);
        //         // this.actor.get_child_at_index(2).add_style_class_name(Constants.STYLE_LANGUAGE_COMPLETED);
		// 	}
		// }

		/* Insert the current level of the language. 5 is the index of the last position in the sub menu */
		this.actor.insert_child_at_index(new St.Label({
            text: _('lvl. ') + language[Constants.LANGUAGE_LEVEL].toString(),
            y_align: Clutter.ActorAlign.CENTER
        }), 6);
		// this.refresh_button = new St.Button({child: refresh_icon});

		/* Add the menu displaying the global points of the language */
		let menu_total_points = new PopupMenu.PopupBaseMenuItem();
		menu_total_points.actor.add(new St.Label({text: _('Total'), x_expand: true, style: 'font-weight: bold;'}));
		menu_total_points.actor.add(new St.Label({text: Utils.formatThousandNumber(language[Constants.LANGUAGE_POINTS].toString()) + ' XP', style: 'font-weight: bold;'}));
		this.menu.addMenuItem(menu_total_points);

		let menu_next_level = new PopupMenu.PopupBaseMenuItem();
		menu_next_level.actor.add(new St.Label({text: _('Next level in'), x_expand: true}));
		menu_next_level.actor.add(new St.Label({text: Utils.formatThousandNumber(language[Constants.LANGUAGE_TO_NEXT_LEVEL].toString()) + ' XP'}));
		this.menu.addMenuItem(menu_next_level);

        if (language[Constants.LANGUAGE_CURRENT_LANGUAGE]) {
            let completion = new PopupMenu.PopupBaseMenuItem();
    		completion.actor.add(new St.Label({
				text: _('Completion'),
				x_expand: true
			}));
            let label = duolingo.get_count_learned_chapters() + Constants.LABEL_XP_SEPARATOR + duolingo.get_count_available_chapters();
    		completion.actor.add(new St.Label({text: label}));
    		this.menu.addMenuItem(completion);
        }

		if (Settings.get_boolean(Constants.SETTING_USE_AUTHENTICATION)) {
			if (!language[Constants.LANGUAGE_CURRENT_LANGUAGE]) {
				let menu_switch_to = new PopupMenu.PopupBaseMenuItem();
				menu_switch_to.actor.add(new St.Label({
					text: _('Switch to'),
					x_expand: true,
					x_align: Clutter.ActorAlign.CENTER}));

				this.menu.addMenuItem(menu_switch_to);
				this.menu.connect('activate', Lang.bind(this, function() {
					duolingo.post_switch_language(
						this.language_code, 
						Lang.bind(this, function() {
							this.emit(Constants.EVENT_REFRESH);
						}),
						this.print_error);
				}));
			}
		}

	},

	print_error: function(error_message) {
		Main.notify(Constants.LABEL_NOTIFICATION_TITLE, error_message);
	},

});
