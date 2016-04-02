const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TimeZone = imports.gi.GLib.TimeZone;
const DateTime = imports.gi.GLib.DateTime;
const Mainloop = imports.mainloop;

const Duolingo = new Lang.Class({
	Name: 'Duolingo',

	_init: function(login) {
		this.login = login;
		this.raw_data = null;
		this.timeouts = 3;
	},

	/* Calls the server and saves the answer in the property raw_data.
	If the user is not found, displays a notification, and the menu is not built.
	If an error different than 200 is returned, displays a notification, and the menu is not built. */
	get_raw_data: function(callback) {
		if (!this.login) {
			callback( "Please enter a username in the settings.");
			return;
		}

		let url = 'https://duolingo.com/users/' + this.login;
		let request = Soup.Message.new('GET', url);
		let session = new Soup.SessionSync();
		session.queue_message(request, Lang.bind(this, function(session, response) {
			if (response.status_code == 200) {
				try {
					this.raw_data = JSON.parse(response.response_body.data);
					callback();
				} catch (err) {
					global.log(err);
					callback("The user couldn't be found.");
				}
			} else {
				this.timeouts--;
				if (this.timeouts == 0) {
					callback("The server couldn't be reached.");
				} else {
					Mainloop.timeout_add(3500, Lang.bind(this, function() {
						this.get_raw_data(callback);
					}));
				}
			}
		}));
	},

	/* Returns today's timestamp at midnight, relative to your time zone. */
	get_duolingos_daystart : function() {
		let tz = TimeZone.new_local();
		let now = DateTime.new_now(tz);
		let year = now.get_year();
		let month = now.get_month();
		let day = now.get_day_of_month();
		let day_start = DateTime.new(tz,year, month, day, 0, 0, 0.0);
		return day_start.to_utc().to_unix() * 1000;
	},

	/** Returns the sum of improvements for the given date */
	get_improvement: function() {
		let take_after = this.get_duolingos_daystart();
		let improvements = this.raw_data.calendar;
		let sum = 0;
		for (let i in improvements) {
			let date = improvements[i].datetime;
			if (take_after < date) {
				sum += parseInt(improvements[i].improvement);
			}
		}
		return sum;
	},

	get_daily_goal: function() {
		return this.raw_data.daily_goal;
	},

	/** Returns an Array of the learnt languages by the given profile. The current language is in first position.
	Each element of the returned array contains the followinf keys: 'label', 'level', 'points', 'to_next_level'. */
	get_languages: function(callback) {
		let languages = this.raw_data.languages;
		let current_language;
		let learnt_languages = new Array();
		for (let l in languages) {
			if (Boolean(languages[l].learning)) {
				/* save the language and the related information in a cell */
				let language = new Array();
				language['label'] = languages[l].language_string;
				language['level'] = languages[l].level;
				language['points'] = languages[l].points;
				language['to_next_level'] = languages[l].to_next_level;

				/* add the current language in the final list */
				if (Boolean(languages[l].current_learning)) {
					let tmp = [language];
					learnt_languages = tmp.concat(learnt_languages);
				} else {
					learnt_languages.push(language);
				}
			}
		}
		return learnt_languages;
	},

	get_lingots: function() {
		return this.raw_data.rupees;
	},

	get_streak: function() {
		return this.raw_data.site_streak;
	},

	is_daily_goal_reached: function() {
		return this.get_improvement() >= this.get_daily_goal();
	},

	is_frozen: function() {
		return this.raw_data.inventory != null && this.raw_data.inventory.streak_freeze != null;
	},

	get_learned_chapters: function() {
		let results = new Array();
		let skills = this.raw_data.language_data.da.skills;
		for (let s in skills) {
			// global.log(s + ": " + skills[s].short + " - " + skills[s].learned);
			if (skills[s].learned) {
				results.push(skills[s]);
			}
		}
		return results;
	},

	get_count_learned_chapters: function() {
		return this.get_learned_chapters().length;
	},

	get_count_available_chapters: function() {
		return this.raw_data.language_data.da.skills.length;
	},
});
