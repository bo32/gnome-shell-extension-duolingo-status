const Lang = imports.lang;
const Soup = imports.gi.Soup;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const DateUtils = Me.imports.dateUtils;

const Duolingo = new Lang.Class({
	Name: 'Duolingo',

	_init: function(login) {
		this.login = login;
		this.raw_data = null;
	},
	
	/* Calls the server and saves the answer in the property raw_data.
	If the user is not found, displays a notification, and the menu is not built.
	If an error different than 200 is returned, displays a notification, and the menu is not built. */
	get_raw_data: function(callback) {
		let url = 'http://duolingo.com/users/' + this.login;
		let request = Soup.Message.new('GET', url);
		let session = new Soup.SessionSync();
		session.queue_message(request, Lang.bind(this, function(session, response) {
			if (response.status_code == 200) {
				try {
					this.raw_data = JSON.parse(response.response_body.data);
				} catch (err) {
					Main.notify('Duolingo Status extension', "The user couldn't be found.");
				}
				if (callback)
					callback(this.raw_data);
			} else {
				Main.notify('Duolingo Status extension', "The server couldn't be reached.");
			}
		}));
	},
	
	/** Returns the sum of improvements for the given date */
	get_improvement: function(date) {
		let improvements = this.raw_data.calendar;
		let sum = 0;
		for (let i in improvements) {
			let date = new Date(improvements[i].datetime);
			if (DateUtils.isToday(date)) {
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
});	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

