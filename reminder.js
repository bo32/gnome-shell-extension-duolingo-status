const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Constants = Me.imports.constants;
const Settings = Convenience.getSettings();

const TimeZone = imports.gi.GLib.TimeZone;
const DateTime = imports.gi.GLib.DateTime;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const Main = imports.ui.main;
const Gettext = imports.gettext;
const _ = Gettext.domain(Me.uuid).gettext;

var Reminder = class Reminder {

	constructor(duolingo) {
        this.duolingo = duolingo;
	}

    start() {
        if (Settings.get_boolean(Constants.SETTING_IS_REMINDER)) {

            var tz = TimeZone.new_local();
    		var now = DateTime.new_now(tz);
            var now_time = now.get_hour() * 3600 + now.get_minute() * 60 + now.get_second();
            var notification_time = Settings.get_string(Constants.SETTING_NOTIFICATION_TIME).split(':');
            var hours = notification_time[0];
            var minutes = notification_time[1];
            var alarm_time = hours * 3600 + minutes * 60;
            var delay = alarm_time - now_time;
            if (delay < 0) {
                // notification if for tomorrow
                delay = 24 * 3600 + delay;
            }
            this.timer_id = Mainloop.timeout_add((delay) * 1000, Lang.bind(this, function() {
                if (!this.duolingo.is_daily_goal_reached()) {
                    Main.notify(Constants.LABEL_NOTIFICATION_TITLE, _('Time to do Duolingo !'));
				}
                this.timer_id = null;
            }));
        }
    }

    stop() {
		if(this.timer_id != null) {
        	Mainloop.source_remove(this.timer_id);
			this.timer_id = null;
		}
    }
};
