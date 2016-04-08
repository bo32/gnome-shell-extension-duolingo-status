const Me = imports.misc.extensionUtils.getCurrentExtension();
const Shell = imports.gi.Shell;
const Main = imports.ui.main;
const Lang = imports.lang;

const DuolingoUI = Me.imports.duolingoUI;

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
    menu = new DuolingoUI.DuolingoMenuButton();
    Main.panel.addToStatusArea('duolingo', menu);
    menu.connect('ready', function () {
        menu.get_refresh_button().connect('clicked', restart);
    });
}

function disable() {
	menu.destroy();
}

function restart() {
    disable();
    enable();
}
