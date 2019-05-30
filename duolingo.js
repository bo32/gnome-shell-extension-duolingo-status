const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const TimeZone = imports.gi.GLib.TimeZone;
const DateTime = imports.gi.GLib.DateTime;
const Mainloop = imports.mainloop;

const Constants = Me.imports.constants;

const TIME_OUT_ATTEMPTS = 3;
const TIME_OUT_DURATION = 3500;

const Gettext = imports.gettext;
const _ = Gettext.domain(Me.uuid).gettext;

var Duolingo = class Duolingo {

	constructor(login, password) {
		this.login = login;
		this.password = password;
		this.raw_data = null;
		this.timeouts = TIME_OUT_ATTEMPTS;
	}

	/* Calls the server and saves the answer in the property raw_data.
	If the user is not found, displays a notification, and the menu is not built.
	If an error different than 200 is returned, displays a notification, and the menu is not built. */
	get_raw_data(callback) {
		if (!this.login) {
			callback(_("Please enter a username in the settings."));
			return null;
		}

		if (this.raw_data != null) {
			return this.raw_data;
		}

		if (!this.password) {
			var url = Constants.URL_DUOLINGO_USERS + this.login;
			if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
				url = url.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
			}
			var request = Soup.Message.new('GET', url);
			var session = new Soup.SessionAsync();
			session.queue_message(request, Lang.bind(this, function(session, response) {
				if (response.status_code == 200) {
					try {
						this.raw_data = JSON.parse(response.response_body.data);
						callback();
					} catch (err) {
						global.log(err);
						callback(_("The user couldn't be found."));
					}
				} else {
					this.timeouts--;
					if (this.timeouts == 0) {
						callback(_("The server couldn't be reached."));
					} else {
						Mainloop.timeout_add(TIME_OUT_DURATION, Lang.bind(this, function() {
							this.get_raw_data(callback);
						}));
					}
				}
			}));
			
		} else {
			let session = new Soup.SessionAsync();
			session.user_agent = Me.metadata.uuid;

			let url = Constants.URL_DUOLINGO_LOGIN;
			if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
				url = url.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
			}
			let params = {'login': this.login, 'password': this.password};
			let message = Soup.form_request_new_from_hash('POST', url, params);
			message.request_headers.append('Connection', 'keep-alive');
			session.queue_message(message, Lang.bind(this, function(session, response) {
				let data = JSON.parse(response.response_body.data);
				if (data['failure'] != null) {
					global.log(data['message'] + '. Error: ' + data['failure']);
					callback(_("Authentication failed."));
					return;
				}

				let cookies = Soup.cookies_from_response(response);
				let url = Constants.URL_DUOLINGO_USERS + this.login;
				if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
					url = url.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
				}
				let msg = Soup.Message.new('GET', url);
				Soup.cookies_to_request(cookies, msg);
				session.queue_message(msg, Lang.bind(this, function(session, response) {
					if (response.status_code == 200) {
						try {
							this.raw_data = JSON.parse(response.response_body.data);
							callback();
						} catch (err) {
							global.log(err);
							callback(_("The user couldn't be found."));
						}
					} else {
						this.timeouts--;
						if (this.timeouts == 0) {
							callback(_("The server couldn't be reached."));
						} else {
							Mainloop.timeout_add(TIME_OUT_DURATION, Lang.bind(this, function() {
								this.get_raw_data(callback);
							}));
						}
					}
				}));
			}));
		}

		return this.raw_data;
	}

	/* Returns today's timestamp at midnight, relative to your time zone. */
	get_duolingos_daystart() {
		var tz = TimeZone.new_local();
		var now = DateTime.new_now(tz);
		var year = now.get_year();
		var month = now.get_month();
		var day = now.get_day_of_month();
		var day_start = DateTime.new(tz,year, month, day, 0, 0, 0.0);
		return day_start.to_utc().to_unix() * 1000;
	}

	/** Returns the sum of improvements for the given date */
	get_improvement() {
		var take_after = this.get_duolingos_daystart();
		var improvements = this.get_raw_data().calendar;
		var sum = 0;
		for (var i in improvements) {
			var date = improvements[i].datetime;
			if (take_after < date) {
				sum += parseInt(improvements[i].improvement);
			}
		}
		return sum;
	}

	get_daily_goal() {
		return this.get_raw_data().daily_goal;
	}

	/** Returns an Array of the learnt languages by the given profile. The current language is in first position.
	Each element of the returned array contains the followinf keys: 'label', 'level', 'points', 'to_next_level'. */
	get_languages(callback) {
		var languages = this.get_raw_data().languages;
		var current_language;
		var learnt_languages = new Array();
		for (var l in languages) {
			if (Boolean(languages[l].learning)) {
				/* save the language and the related information in a cell */
				var language = new Array();
				language[Constants.LANGUAGE_LABEL] = languages[l].language_string;
				language[Constants.LANGUAGE_CODE] = languages[l].language;
				language[Constants.LANGUAGE_LEVEL] = languages[l].level;
				language[Constants.LANGUAGE_POINTS] = languages[l].points;
				language[Constants.LANGUAGE_TO_NEXT_LEVEL] = languages[l].to_next_level;
				language[Constants.LANGUAGE_CURRENT_LANGUAGE] = languages[l].current_learning;

				/* add the current language in the final list */
				if (Boolean(languages[l].current_learning)) {
					var tmp = [language];
					learnt_languages = tmp.concat(learnt_languages);
				} else {
					learnt_languages.push(language);
				}
			}
		}
		return learnt_languages;
	}

	get_current_learning_language() {
		var languages = this.get_languages();
		for (var l in languages) {
			if(languages[l][Constants.LANGUAGE_CURRENT_LANGUAGE]) {
				return languages[l];
			}
		}
		return null;
	}

	get_lingots() {
		return this.get_raw_data().rupees;
	}

	get_streak() {
		return this.get_raw_data().site_streak;
	}

	is_daily_goal_reached() {
		return this.get_improvement() >= this.get_daily_goal();
	}

	is_frozen() {
		return this.get_raw_data().inventory != null && this.get_raw_data().inventory.streak_freeze != null;
	}

	get_double_or_nothing_status() {
		if (this.get_raw_data().inventory != null)
			if (this.get_raw_data().inventory.hasOwnProperty('rupee_wager'))
				return this.get_raw_data().inventory.rupee_wager;
			else 
				return undefined;
		return null;
	}

	get_learned_chapters() {
		var results = new Array();
		var current_language =  this.get_current_learning_language()[Constants.LANGUAGE_CODE];
		var skills = this.get_raw_data().language_data[current_language].skills;
		for (var s in skills) {
			if (skills[s].learned) {
				results.push(skills[s]);
			}
		}
		return results;
	}

	get_count_learned_chapters() {
		return this.get_learned_chapters().length;
	}

	get_count_available_chapters() {
		var current_language =  this.get_current_learning_language()[Constants.LANGUAGE_CODE];
		return this.get_raw_data().language_data[current_language].skills.length;
	}


	post_switch_language(new_language_code, callback, err) {
		var session = new Soup.SessionAsync();
		session.user_agent = Me.metadata.uuid;

		var url = Constants.URL_DUOLINGO_LOGIN;
		if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
			url = url.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
		}
		var params = {'login': this.login, 'password': this.password};
		var message = Soup.form_request_new_from_hash('POST', url, params);
		message.request_headers.append('Connection', 'keep-alive');
		session.queue_message(message, Lang.bind(this, function(session, response) {
			var data = JSON.parse(response.response_body.data);

			if (data['failure'] != null) {
				err(data['message'] + '. Error: ' + data['failure']);
				return;
			}

			var cookies = Soup.cookies_from_response(response);
			var url_switch = Constants.URL_DUOLINGO_SWITCH_LANGUAGE;
			if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
				url_switch = url_switch.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
			}
			var params_switch = {'learning_language': new_language_code};
			var msg = Soup.form_request_new_from_hash('POST', url_switch, params_switch);
			Soup.cookies_to_request(cookies, msg);
			session.queue_message(msg, Lang.bind(this, function(session, response) {
				callback();
			}));
		}));
	}

	get_learning_from_language() {
		return this.get_raw_data().learning_language_string;
	}

	authenticate() {
		// TODO reuse this function
	}

	buy_item(item_name, callback, err) {
		var session = new Soup.SessionAsync();
		session.user_agent = Me.metadata.uuid;

		var url = Constants.URL_DUOLINGO_LOGIN;
		if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
			url = url.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
		}
		var params = {'login': this.login, 'password': this.password};
		var message = Soup.form_request_new_from_hash('POST', url, params);
		message.request_headers.append('Connection', 'keep-alive');
		session.queue_message(message, Lang.bind(this, function(session, response) {
			var data = JSON.parse(response.response_body.data);
			if (data['failure'] != null) {
				err(data['message'] + '. Error: ' + data['failure']);
				return;
			}

			var cookies = Soup.cookies_from_response(response);
			var url_buy_item = 'https://duolingo.com/store/purchase_item';
			if (Settings.get_boolean(Constants.SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY)) {
				url_buy_item = url_buy_item.replace(Constants.LABEL_DUOLINGO, Constants.LABEL_DUOLINGO_WITH_WWW_PREFIX);
			}
			var learning_from_language = this.get_learning_from_language();
			var params_buy_item = {'item_name': item_name, 'learning_language': learning_from_language};
			var msg = Soup.form_request_new_from_hash('POST', url_buy_item, params_buy_item);
			Soup.cookies_to_request(cookies, msg);
			session.queue_message(msg, Lang.bind(this, function(session, response) {
				global.log(response.status_code + ' - ' + response.reason_phrase);
				global.log(response.response_body.data);
				global.log(response.status_code + ' - ' + response.reason_phrase);
				global.log(response.response_headers.get_one('content-type'));
				callback();
			}));
		}));
	}

};
