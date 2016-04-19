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

const Util = imports.misc.util;
const FLAGS = Me.imports.flagsKeys.flags;
const Utils = Me.imports.utils;
const Settings = Convenience.getSettings();

let icon_size = 16;
let menu_width = 250;
let notification_label = 'Duolingo Status extension';

const DuolingoMenuButton = new Lang.Class({
    Name: 'Duolingo.DuolingoMenuButton',
    Extends: PanelMenu.Button,

	_init: function() {
        this.parent(0.0, 'duolingo');
        this.reminder = null;
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
            if (this.duolingo.is_frozen()) {
                streak_label.style_class = 'streak-frozen';
            } else {
                streak_label.style_class = 'streak-not-frozen';
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

        // initiate reminder
        this._initiate_reminder();

        this._display_in_original_tray_icon();

        Main.panel.addToStatusArea('duolingo', this);
        this.emit('ready');
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
        link_label.add_style_class_name('duolingo_link');
		link_menu.actor.add(link_label, { expand: true });
		link_menu.connect('activate', function() {
			Util.spawn([Settings.get_string('opening-browser-command'), 'http://duolingo.com']);
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
			// launch_extension_prefs(Me.uuid);
            this.emit('preferences');
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

	_add_language_menus: function() {
        let languages = this.duolingo.get_languages();
		for (let l in languages) {
			let m = new LanguageSubMenu(languages[l], this.duolingo);
			this.menu.addMenuItem(m);
		}
	},

	_display_lingots: function() {
        if(this.duolingo.get_double_or_nothing_status() == null || Settings.get_boolean('show-lingots')) {
            let lingots = this.duolingo.get_lingots();
        	let gicon = Gio.icon_new_for_string(Me.path + "/icons/ruby.png");
        	let lingots_icon = new St.Icon({
                gicon: gicon,
                icon_size: icon_size,
                y_align: Clutter.ActorAlign.CENTER});
        	let lingots_label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                text: Utils.formatThousandNumber(lingots.toString())});
            lingots_label.add_style_class_name('lingots_label');
        	this.profile_menu.connect('activate', this._open_lingots_link);
            this.profile_menu.actor.add(lingots_icon);
        	this.profile_menu.actor.add(lingots_label);
        }
	},

    _display_double_or_nothing: function() {
        let double_or_nothing = this.duolingo.get_double_or_nothing_status();
        if (double_or_nothing != null) {
            let gicon = Gio.icon_new_for_string(Me.path + "/icons/fire.png");
        	let fire_icon = new St.Icon({
                gicon: gicon,
                icon_size: icon_size,
                y_align: Clutter.ActorAlign.CENTER});
    		let double_or_nothing_label = new St.Label({
                y_align:Clutter.ActorAlign.CENTER,
                text: double_or_nothing + ' / 7'});
            double_or_nothing_label.add_style_class_name('double_or_nothing_label');
        	this.profile_menu.connect('activate', this._open_lingots_link);
    		this.profile_menu.actor.add(fire_icon);
    		this.profile_menu.actor.add(double_or_nothing_label);
        }
	},

	_open_lingots_link: function() {
        Util.spawn([Settings.get_string('opening-browser-command'), 'http://duolingo.com/show_store']);
	},

	_set_todays_improvement: function() {
		let improvement = this.duolingo.get_improvement();
		let daily_goal = this.duolingo.get_daily_goal();
		this.todays_improvement.text = improvement + ' / ' + daily_goal + ' XP';

		if (!this.duolingo.is_daily_goal_reached()) {
			this.hbox.get_child_at_index(0).style = 'color: ' + Settings.get_string('icon-color-when-daily-goal-not-reached') +';'
		} else {
			if(Settings.get_boolean('change-icon-color-when-daily-goal-reached')) {
				this.hbox.get_child_at_index(0).style = 'color: ' + Settings.get_string('icon-color-when-daily-goal-reached') +';'
			}
		}
	},

    _display_in_original_tray_icon: function() {
        let tray = Main.legacyTray;
        let children = tray._iconBox.get_n_children();
        for(let i = 0; i < children; i++) {
            global.log(tray._iconBox.get_child_at_index(i));
            let button = tray._iconBox.get_child_at_index(i);
            this._onTrayIconAddedRemoveOriginalIcon(Main.legacyTray._trayManager, button.child);
        }
    },

    _onTrayIconAddedRemoveOriginalIcon: function(object, icon) {
        // if(Settings.get_boolean('change-icon-color-when-daily-goal-reached') && icon.wm_class == "Skype") {
        //     let button = icon.get_parent();
        //     if(button != null) {
        //         button.destroy();
        //     }
        // }
    },

    destroy: function() {
		this.parent();
    },
});

const LanguageSubMenu = new Lang.Class({
    Name: 'Duolingo.LanguageMenu',
    Extends: PopupMenu.PopupSubMenuMenuItem,

	_init: function(language, duolingo) {
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

        if (language['current_learning']) {
            let completion = new PopupMenu.PopupBaseMenuItem();
    		completion.actor.add(new St.Label({text: 'Completion', x_expand: true}));
            let label = duolingo.get_count_learned_chapters() + ' / ' + duolingo.get_count_available_chapters();
    		completion.actor.add(new St.Label({text: label}));
    		this.menu.addMenuItem(completion);
        }
	},
});
