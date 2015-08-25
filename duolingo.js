const Lang = imports.lang;
const Soup = imports.gi.Soup;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const DateUtils = Me.imports.dateUtils;

const Duolingo = new Lang.Class({
	Name: 'Duolingo',

	_init: function(login) {
		this.login = login;
		this.raw_data = null;
	},
	
	// TODO: call only once duolingo website and save the response in a variable, that we'll use for all the data we display
	get_raw_data: function(callback) {
		let url = 'http://duolingo.com/users/' + this.login;
		let request = Soup.Message.new('GET', url);
		let session = new Soup.SessionSync();
		session.queue_message(request, Lang.bind(this, function(session, response) {
			this.raw_data = JSON.parse(response.response_body.data);
			callback(this.raw_data);
		}));
	},
	
	/** Returns the sum of improvements for the giv en date */
	// TODO: handle error from the answer, e.g. 404 or username not found
	get_improvement: function(date, callback) {
		let url = 'http://duolingo.com/users/' + this.login;
		let request = Soup.Message.new('GET', url);
		let session = new Soup.SessionSync();
		session.queue_message(request, Lang.bind(this, function(session, response) {
			let improvements = JSON.parse(response.response_body.data).calendar;
			let daily_goal = JSON.parse(response.response_body.data).daily_goal;
			let sum = 0;
			for (let i in improvements) {
				let date = new Date(improvements[i].datetime);
				if (DateUtils.isToday(date)) {
					sum += parseInt(improvements[i].improvement);
				}
			}
			callback(sum.toString(), daily_goal);
		}));
	},

	/** Returns an Array of the learnt languages by the given profile. The current language is in first position. 
	Each element of the returned array contains the followinf keys: 'label', 'level', 'points', 'to_next_level'. */
	// TODO: handle error from the answer, e.g. 404 or username not found
	get_languages: function(callback) {
		let url = 'http://duolingo.com/users/' + this.login;
		let request = Soup.Message.new('GET', url);
		let session = new Soup.SessionSync();
		let languages = new Array();
		session.queue_message(request, Lang.bind(this, function(session, response) {
			let languages = JSON.parse(response.response_body.data).languages;
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
			if (callback) {
				callback(learnt_languages);
			}
		}));
	},
	
	//TODO get lingots
	get_lingots: function(callback) {
		let url = 'http://duolingo.com/users/' + this.login;
		let request = Soup.Message.new('GET', url);
		let session = new Soup.SessionSync();
		session.queue_message(request, Lang.bind(this, function(session, response) {
			let props = JSON.parse(response.response_body.data).tracking_properties;
			global.log(typeof(props));
			/*for (let p in props) {
				global.log(props[p].lingots);
			}*/
			if (callback) {
				callback();
			}
		}));
	},
});	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

