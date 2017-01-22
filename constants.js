const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let SETTING_APP_CHOOSER_ACTIVE_INDEX = 'app-chooser-active-index';
let SETTING_CHANGE_ICON_COLOR_WHEN_DAILY_GOAL_REACHED = 'change-icon-color-when-daily-goal-reached';
let SETTING_HIDE_WHEN_DAILY_GOAL_REACHED = 'hide-when-daily-goal-reached';
let SETTING_ICON_COLOR_WHEN_DAILY_GOAL_NOT_REACHED = 'icon-color-when-daily-goal-not-reached';
let SETTING_ICON_COLOR_WHEN_DAILY_GOAL_REACHED = 'icon-color-when-daily-goal-reached';
let SETTING_ICON_INDEX = 'icon-index';
let SETTING_ICON_POSITION = 'icon-position';
let SETTING_IS_REMINDER = 'is-reminder';
let SETTING_NOTIFICATION_TIME = 'notification-time';
let SETTING_OPENING_BROWSER_COMMAND = 'opening-browser-command';
let SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY = 'show-icon-in-notification-tray';
let SETTING_SHOW_LINGOTS = 'show-lingots';
let SETTING_USE_DEFAULT_BROWSER = 'use-default-browser';
let SETTING_USERNAME = 'username';

let ICON_DUOLINGO = Me.path + '/icons/duolingo-symbolic.svg';
let ICON_DUOLINGO_ALERT = Me.path + '/icons/duolingo-alert-symbolic.svg';
let ICON_FIRE = Me.path + '/icons/fire.png';
let ICON_FLAG_PATH = Me.path + '/icons/flags/';
let ICON_LINGOTS = Me.path + '/icons/ruby.png';
let ICON_MEDAL = Me.path + '/icons/medal.png';

let LABEL_DUOLINGO = 'duolingo';
let LABEL_DUOLINGO_WITH_WWW_PREFIX = 'www.duolingo';
let LABEL_NOTIFICATION_TITLE = 'Duolingo Status extension';
let LABEL_XP_SEPARATOR = ' / ';

let LANGUAGE_LABEL = 'label';
let LANGUAGE_CODE = 'code';
let LANGUAGE_LEVEL = 'level';
let LANGUAGE_POINTS = 'points';
let LANGUAGE_TO_NEXT_LEVEL = 'to_next_level';
let LANGUAGE_CURRENT_LANGUAGE = 'current_learning';

let STYLE_DOUBLE_OR_NOTHING_LABEL = 'double_or_nothing_label';
let STYLE_DUOLINGO_LINK = 'duolingo_link';
let STYLE_LINGOTS_LABEL = 'lingots_label';
let STYLE_STREAK_FROZEN = 'streak-frozen';
let STYLE_STREAK_NOT_FROZEN = 'streak-not-frozen';

let URL_DUOLINGO_HOME = 'http://duolingo.com';
let URL_DUOLINGO_STORE = 'http://duolingo.com/show_store';
let URL_DUOLINGO_USERS = 'https://duolingo.com/users/';

let EVENT_PREFERENCES = 'preferences';
let EVENT_READY = 'ready';
let EVENT_REFRESH = 'refresh';
