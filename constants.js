const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var SETTING_APP_CHOOSER_ACTIVE_INDEX = 'app-chooser-active-index';
var SETTING_CHANGE_ICON_COLOR_WHEN_DAILY_GOAL_REACHED = 'change-icon-color-when-daily-goal-reached';
var SETTING_HIDE_WHEN_DAILY_GOAL_REACHED = 'hide-when-daily-goal-reached';
var SETTING_ICON_COLOR_WHEN_DAILY_GOAL_NOT_REACHED = 'icon-color-when-daily-goal-not-reached';
var SETTING_ICON_COLOR_WHEN_DAILY_GOAL_REACHED = 'icon-color-when-daily-goal-reached';
var SETTING_ICON_INDEX = 'icon-index';
var SETTING_ICON_POSITION = 'icon-position';
var SETTING_IS_REMINDER = 'is-reminder';
var SETTING_NOTIFICATION_TIME = 'notification-time';
var SETTING_PASSWORD = 'password';
var SETTING_OPENING_BROWSER_COMMAND = 'opening-browser-command';
var SETTING_SHOW_ICON_IN_NOTIFICATION_TRAY = 'show-icon-in-notification-tray';
var SETTING_SHOW_LINGOTS = 'show-lingots';
var SETTING_USE_AUTHENTICATION = 'use-authentication';
var SETTING_USE_DEFAULT_BROWSER = 'use-default-browser';
var SETTING_USERNAME = 'username';

var ICON_DUOLINGO = Me.path + '/icons/duolingo-symbolic.svg';
var ICON_DUOLINGO_ALERT = Me.path + '/icons/duolingo-alert-symbolic.svg';
var ICON_FIRE = Me.path + '/icons/fire.png';
var ICON_FLAG_PATH = Me.path + '/icons/flags/';
var ICON_FLAG_SIZE = 16;
var ICON_ICE_CUBE = Me.path + '/icons/ice_cube.png';
var ICON_LINGOTS = Me.path + '/icons/ruby.png';

var LABEL_DUOLINGO = 'duolingo';
var LABEL_DUOLINGO_WITH_WWW_PREFIX = 'www.duolingo';
var LABEL_NOTIFICATION_TITLE = 'Duolingo Status extension';
var LABEL_XP_SEPARATOR = ' / ';

var LANGUAGE_LABEL = 'label';
var LANGUAGE_CODE = 'code';
var LANGUAGE_LEVEL = 'level';
var LANGUAGE_POINTS = 'points';
var LANGUAGE_TO_NEXT_LEVEL = 'to_next_level';
var LANGUAGE_CURRENT_LANGUAGE = 'current_learning';

var STYLE_DOUBLE_OR_NOTHING_LABEL = 'double_or_nothing_label';
var STYLE_DUOLINGO_LINK = 'duolingo_link';
var STYLE_LINGOTS_LABEL = 'lingots_label';
var STYLE_STREAK_FROZEN = 'streak-frozen';
var STYLE_STREAK_NOT_FROZEN = 'streak-not-frozen';

var URL_DUOLINGO_HOME = 'https://duolingo.com';
var URL_DUOLINGO_LOGIN = 'https://duolingo.com/login';
var URL_DUOLINGO_STORE = 'https://duolingo.com/show_store';
var URL_DUOLINGO_SWITCH_LANGUAGE = 'https://duolingo.com/switch_language';
var URL_DUOLINGO_USERS = 'https://duolingo.com/users/';

var EVENT_PREFERENCES = 'preferences';
var EVENT_READY = 'ready';
var EVENT_REFRESH = 'refresh';
