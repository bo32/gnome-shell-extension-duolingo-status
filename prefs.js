const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

CurrencyConverterSettingsWidget.prototype = {

	_init: function() {		
		this._grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
                                  row_spacing: 4,
                                  column_spacing: 4 });

		let username_label = new Gtk.Label({label: 'Username'});
		this.username_field = new Gtk.Entry({hexpand: true});
		this._grid.attach(username_label, 0, 0, 1, 1);
		this._grid.attach(this.username_field, 1, 0, 3, 1);
		
		return;
	},
	
	
	_completePrefsWidget: function() {
		let settings = Convenience.getSettings();
        let scrollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        scrollingWindow.add_with_viewport(this._grid);
        scrollingWindow.width_request = 400;
        scrollingWindow.show_all();
		scrollingWindow.unparent();
		scrollingWindow.connect('destroy', function() {
			// TODO save the username
			settings.set_string('username', this.username_field.text);
		});
        return scrollingWindow;
    },

};

function init() {
}

function CurrencyConverterSettingsWidget() {
    this._init();
}

function buildPrefsWidget() {
    let widget = new CurrencyConverterSettingsWidget();
	return widget._completePrefsWidget();
}

