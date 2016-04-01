const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

const TimeZone = imports.gi.GLib.TimeZone;
const DateTime = imports.gi.GLib.DateTime;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const Main = imports.ui.main;

const Reminder = new Lang.Class({
	Name: 'Reminder',

	_init: function(duolingo) {
		global.log('reminder initiated')
        this.duolingo = duolingo;
		this.timer_ids = [];
	},

    start: function() {
		global.log("start reminder: " + Settings.get_boolean('is-reminder'));
        if (Settings.get_boolean('is-reminder')) {

            let tz = TimeZone.new_local();
    		let now = DateTime.new_now(tz);
            let now_time = now.get_hour() * 3600 + now.get_minute() * 60 + now.get_second();
            let notification_time = Settings.get_string('notification-time').split(':');
            let hours = notification_time[0];
            let minutes = notification_time[1];
            let alarm_time = hours * 3600 + minutes * 60;
            let delay = alarm_time - now_time;
            if (delay < 0) {
                // notification if for tomorrow
                delay = 24 * 3600 + delay;
            }
            let timer_id = Mainloop.timeout_add((delay) * 1000, Lang.bind(this, function() {
                if (!this.duolingo.is_daily_goal_reached()) {
                    Main.notify('Duolingo', 'Time to do Duolingo !');
                }
                Mainloop.timeout_add(1000, Lang.bind(this, function() {
                    this.start();
                }));
            }));
			this.timer_ids.push(timer_id);
			global.log("new timer:" + timer_id);
			global.log(this.timer_ids.length + " timers");
            //Main.notify('Duolingo', 'Reminder set for ' + Settings.get_string('notification-time') + '.');
        }
    },

    stop: function() {
		global.log("cleaning " + this.timer_ids.length + " timers");
		for(var timer_id in this.timer_ids) {
        	Mainloop.source_remove(timer_id);
			global.log("timer " + timer_id + " removed.");
			this.timer_ids.pop(timer_id);
		}
		global.log(this.timer_ids.length + " timers stopped");
    }
});
