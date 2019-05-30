const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Shell = imports.gi.Shell;
const Main = imports.ui.main;
const Lang = imports.lang;

const DuolingoUI = Me.imports.duolingoUI;
const Constants = Me.imports.constants;

const Gettext = imports.gettext;
const _ = Gettext.domain(Me.uuid).gettext;

function launch_extension_prefs(uuid) {
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    let info = app.get_app_info();
    let timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
        ['extension:///' + uuid],
        global.create_app_launch_context(timestamp, -1)
    );
    return app;
}

function init() {
}

let menu;
function enable() {
    menu = new DuolingoUI.DuolingoMenuButton();
    menu.connect(Constants.EVENT_REFRESH, function () {
        restart();
    });
    menu.connect(Constants.EVENT_PREFERENCES, function () {
        let app = launch_extension_prefs(Me.uuid);
        app.connect('windows_changed', Lang.bind(menu, function() {
            if (app.get_state() == Shell.AppState.STOPPED && menu.have_settings_been_changed() === true) {
    			restart();
                Main.notify(_('The Duolingo extension just restarted.'));
    			// this._settings_changed = false;
            }
        }));
    });
}

function disable() {
	menu.destroy();
}

function restart() {
    disable();
    enable();
}
