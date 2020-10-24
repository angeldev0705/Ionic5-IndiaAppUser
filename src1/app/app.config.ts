import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
	apiKey: string,
	authDomain: string,
	databaseURL: string,
	projectId: string,
	storageBucket: string,
	messagingSenderId: string,
	webApplicationId: string
}

export interface AppConfig {
	appName: string;
	apiBase: string;
	googleApiKey: string;
	stripeKey: string;
	oneSignalAppId: string;
	oneSignalGPSenderId: string;
	availableLanguages: Array<any>;
	inAppProductIds: Array<string>;
	firebaseConfig: FirebaseConfig;
	demoMode: boolean;
}

export const BaseAppConfig: AppConfig = {
	appName: "2MIL Pro",
	apiBase: "https://admin.2-mil.com/",
	googleApiKey: "AIzaSyDnYmhksSfvPiKUYMS_MwGIQKErh7_i2H4",
	stripeKey: "",
	oneSignalAppId: "da4f3406-e407-4472-97a1-5d484afeb855",
	oneSignalGPSenderId: "1084053651775",
	availableLanguages: [{
		code: 'ro',
		name: 'Romanian'
	}, {
		code: 'en',
		name: 'English'
	}
		// , {
		// 	code: 'fr',
		// 	name: 'Française'
		// }, {
		// 	code: 'ar',
		// 	name: 'عربى'
		// }, {
		// 	code: 'zh',
		// 	name: '中文'
		// }, {
		// 	code: 'et',
		// 	name: 'Eestlane'
		// }, {
		// 	code: 'fi',
		// 	name: 'Suomalainen'
		// }, {
		// 	code: 'es',
		// 	name: 'Español'
		// }, {
		// 	code: 'sv',
		// 	name: 'svenska'
		// }, {
		// 	code: 'bn',
		// 	name: 'বাংলা'
		// }, {
		// 	code: 'hi',
		// 	name: 'हिन्दी'
		// }, {
		// 	code: 'ur',
		// 	name: 'اردو'
		// }
	],
	demoMode: false,
	inAppProductIds: [],
	firebaseConfig: {
		webApplicationId: "1084053651775-lvrno0df09rrc978msopobahuqdan56p.apps.googleusercontent.com",
		apiKey: "AIzaSyDnYmhksSfvPiKUYMS_MwGIQKErh7_i2H4",
		authDomain: "mil-bc2b0.firebaseapp.com",
		databaseURL: "https://mil-bc2b0.firebaseio.com",
		projectId: "mil-bc2b0",
		storageBucket: "mil-bc2b0.appspot.com",
		messagingSenderId: "1084053651775"
	}
};