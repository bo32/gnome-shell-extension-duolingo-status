const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const St = imports.gi.St;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Constants = Me.imports.constants;
const CustomSignals = Me.imports.custom_signals.CustomSignals;
const Convenience = Me.imports.convenience;
const FLAGS = Me.imports.flagsKeys.flags;
const Utils = Me.imports.utils;

const Settings = Convenience.getSettings();

var LanguageSubMenu = class LanguageMenu extends PopupMenu.PopupSubMenuMenuItem {

	constructor(language, duolingo) {
		super(language[Constants.LANGUAGE_LABEL], true);
		this.language_code = language[Constants.LANGUAGE_CODE];
		
		this.custom_signals = new CustomSignals();

		/* display the flag */
		var flag_name = FLAGS[language[Constants.LANGUAGE_LABEL]];
		this.icon.gicon = Gio.icon_new_for_string(Constants.ICON_FLAG_PATH + flag_name);
		this.icon.icon_size = Constants.ICON_FLAG_SIZE;

		/* Insert the current level of the language. 5 is the index of the last position in the sub menu */
		this.actor.insert_child_at_index(new St.Label({
            text: _('lvl. ') + language[Constants.LANGUAGE_LEVEL].toString(),
            y_align: Clutter.ActorAlign.CENTER
        }), 6);

		/* Add the menu displaying the global points of the language */
		var menu_total_points = new PopupMenu.PopupBaseMenuItem();
		menu_total_points.actor.add(new St.Label({text: _('Total'), x_expand: true, style: 'font-weight: bold;'}));
		menu_total_points.actor.add(new St.Label({text: Utils.formatThousandNumber(language[Constants.LANGUAGE_POINTS].toString()) + ' XP', style: 'font-weight: bold;'}));
		this.menu.addMenuItem(menu_total_points);

		var menu_next_level = new PopupMenu.PopupBaseMenuItem();
		menu_next_level.actor.add(new St.Label({text: _('Next level in'), x_expand: true}));
		menu_next_level.actor.add(new St.Label({text: Utils.formatThousandNumber(language[Constants.LANGUAGE_TO_NEXT_LEVEL].toString()) + ' XP'}));
		this.menu.addMenuItem(menu_next_level);

        if (language[Constants.LANGUAGE_CURRENT_LANGUAGE]) {
            var completion = new PopupMenu.PopupBaseMenuItem();
    		completion.actor.add(new St.Label({
				text: _('Completion'),
				x_expand: true
			}));
            var label = duolingo.get_count_learned_chapters() + Constants.LABEL_XP_SEPARATOR + duolingo.get_count_available_chapters();
    		completion.actor.add(new St.Label({text: label}));
    		this.menu.addMenuItem(completion);
        }

		if (Settings.get_boolean(Constants.SETTING_USE_AUTHENTICATION)) {
			if (!language[Constants.LANGUAGE_CURRENT_LANGUAGE]) {
				var menu_switch_to = new PopupMenu.PopupBaseMenuItem();
				menu_switch_to.actor.add(new St.Label({
					text: _('Switch to'),
					x_expand: true,
					x_align: Clutter.ActorAlign.CENTER}));

				this.menu.addMenuItem(menu_switch_to);
				this.menu.connect('activate', Lang.bind(this, function() {
					duolingo.post_switch_language(
						this.language_code, 
						Lang.bind(this, function() {
							this.custom_signals.emit(Constants.EVENT_REFRESH);
						}),
						this.print_error);
				}));
			}
		}
	}

	print_error(error_message) {
		Main.notify(Constants.LABEL_NOTIFICATION_TITLE, error_message);
    }

};
