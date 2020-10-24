import { Component, Inject, ViewChild } from '@angular/core';
import { Platform, Nav, Events, Loading, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SigninPage } from '../pages/signin/signin';
import { ClientService } from '../providers/client.service';
import { APP_CONFIG, AppConfig } from './app.config';
import { Constants } from '../models/constants.models';
import { TabsPage } from '../pages/tabs/tabs';
import { OneSignal } from '@ionic-native/onesignal';
import { MyNotification } from '../models/notifications.models';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { MyprofilePage } from '../pages/myprofile/myprofile';
import { Profile } from '../models/profile.models';
import firebase from 'firebase';
import { compareDates } from 'ionic-angular/umd/util/datetime-util';
import { ChatslistPage } from './../pages/chatslist/chatslist'
import { RequestsPage } from './../pages/requests/requests';
import { NotificationsPage } from './../pages/notifications/notifications';
import * as IntroJs from './../../node_modules/intro.js/intro.js';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  private profileMe: Profile;
  private loading: Loading;
  private loadingShown: boolean = false;
  rtlSide: string = "left";
  public notificationPlayerIds;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private platform: Platform,
    private oneSignal: OneSignal, private statusBar: StatusBar, private splashScreen: SplashScreen,
    private clientService: ClientService, events: Events, private translate: TranslateService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    //window.localStorage.setItem(Constants.KEY_LOCATION, "{\"name\":\"Laxmi Nagar, New Delhi, Delhi, India\",\"lat\":28.689638299999995,\"lng\":77.29134669999996}");
    this.initializeApp();

    clientService.getSettings().subscribe(res => {
      console.log('setting_setup_success');
      window.localStorage.setItem(Constants.KEY_SETTING, JSON.stringify(res));
    }, err => {
      console.log('setting_setup_error', err);
    });

    events.subscribe('language:selection', (language) => {
      clientService.updateUser({ language: language }).subscribe(res => {
        console.log(res);
      }, err => {
        console.log('update_user', err);
      });
      this.globalize(language);
    });

    events.subscribe('user:login', (loginRes) => {
      this.clientService.setupHeaders(loginRes.token);
      this.translate.get(["checking_profile", "something_wrong"]).subscribe(values => {
        this.presentLoading(values["checking_profile"]);
        this.clientService.getProfile().subscribe(res => {
          this.dismissLoading();
          if (res.categories && res.categories.length) {
            this.profileMe = res;
            window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
            window.localStorage.setItem(Constants.KEY_TOKEN, loginRes.token);
            this.nav.setRoot(TabsPage);
            this.updatePlayerId();
          } else {
            this.nav.push(MyprofilePage);
          }
        }, err => {
          console.log("getProfile", err);
          this.dismissLoading();
          this.showToast(values["something_wrong"]);
          this.nav.push(MyprofilePage);
        });
      });
    });

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.show();
      this.introMethod();
      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });
      this.oneSignal.setLogLevel({logLevel: 6, visualLevel: 0});
      if (this.platform.is('cordova')) this.initOneSignal();
      this.refreshSettings();
      this.profileMe = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
      this.nav.setRoot((this.profileMe != null && this.profileMe.user != null) ? TabsPage : SigninPage);
      setTimeout(() => {
        this.splashScreen.hide();
        if (this.platform.is('cordova') && (this.profileMe != null && this.profileMe.user != null)) this.updatePlayerId();
      }, 3000);
      let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
      this.globalize(defaultLang);
    });
    
  }


 

  private updatePlayerId() {
    console.log('update playerid');
    this.oneSignal.getIds().then((id) => {
      if (id && id.userId) {
        console.log('id adnd id.userid persent');
        firebase.database().ref(Constants.REF_USERS_FCM_IDS).child((this.profileMe.user_id + "hp")).set(id.userId);
        let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
        this.clientService.updateUser({
          fcm_registration_id_provider: id.userId,
          language: (defaultLang && defaultLang.length) ? defaultLang : this.config.availableLanguages[0].code
        }).subscribe(res => {
          console.log(res);
        }, err => {
          console.log('update_user', err);
        });
      }
    });
  }

  private refreshSettings() {
    this.clientService.getSettings().subscribe(res => {
      console.log('setting_setup_success');
      window.localStorage.setItem(Constants.KEY_SETTING, JSON.stringify(res));
    }, err => {
      console.log('setting_setup_error', err);
    });
  }

  globalize(languagePriority) {
    this.translate.setDefaultLang("en");
    let defaultLangCode = this.config.availableLanguages[0].code;
    this.translate.use(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    window.localStorage.setItem(Constants.KEY_LOCALE, languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar':
      case 'iw':
      case 'ur':
      case 'fa':
        this.platform.setDir('ltr', false);
        this.platform.setDir('rtl', true);
        this.rtlSide = "right";
        break;
      default:
        this.platform.setDir('rtl', false);
        this.platform.setDir('ltr', true);
        this.rtlSide = "left";
        break;
    }
  }

  getSideOfCurLang() {
    this.rtlSide = this.platform.dir() === 'rtl' ? "right" : "left";
    return this.rtlSide;
  }

  getSuitableLanguage(language) {
    window.localStorage.setItem("locale", language);
    language = language.substring(0, 2).toLowerCase();
    console.log('check for: ' + language);
    return this.config.availableLanguages.some(x => x.code == language) ? language : 'en';
  }

  initOneSignal() {
    console.log(this.config.oneSignalAppId);
    if (this.config.oneSignalAppId && this.config.oneSignalAppId.length && this.config.oneSignalGPSenderId && this.config.oneSignalGPSenderId.length) {
      this.oneSignal.startInit(this.config.oneSignalAppId , this.config.oneSignalGPSenderId );
      console.log('init noti running');
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log(data);
        let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
        if (!notifications) notifications = new Array<MyNotification>();
        notifications.push(new MyNotification((data.payload.additionalData && data.payload.additionalData.title) ? data.payload.additionalData.title : data.payload.title,
          (data.payload.additionalData && data.payload.additionalData.body) ? data.payload.additionalData.body : data.payload.body,
          String(new Date().getTime())));
        window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        noti_ids_processed.push(data.payload.notificationID);
        window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        let index = noti_ids_processed.indexOf(data.notification.payload.notificationID);
        if (index == -1) {
          let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
          if (!notifications) notifications = new Array<MyNotification>();
          notifications.push(new MyNotification((data.notification.payload.additionalData && data.notification.payload.additionalData.title) ? data.notification.payload.additionalData.title : data.notification.payload.title,
            (data.notification.payload.additionalData && data.notification.payload.additionalData.body) ? data.notification.payload.additionalData.body : data.notification.payload.body,
            String(new Date().getTime())));
          window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
        } else {
          noti_ids_processed.splice(index, 1);
          window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
        }
        if( data.notification.payload.additionalData.title == "New message" || data.notification.payload.additionalData.title == "Mesaj nou"){
          this.nav.setRoot(TabsPage);
          this.nav.push(ChatslistPage);
        } else if ( data.notification.payload.additionalData.title == "Application canceled" || data.notification.payload.additionalData.title == "Cerere anulată"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Application accepted" || data.notification.payload.additionalData.title == "Cerere acceptată"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Application rejected" || data.notification.payload.additionalData.title == "Cerere respinsă"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "The provider is on his way" || data.notification.payload.additionalData.title == "Providerul este pe drum"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Complete activity" || data.notification.payload.additionalData.title == "Activitate completă"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Appointment Started" || data.notification.payload.additionalData.title == "Programarea a început"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Appointment Complete" || data.notification.payload.additionalData.title == "Programare finalizată"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "New application" || data.notification.payload.additionalData.title == "Cerere nouă"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Appointment Accepted" || data.notification.payload.additionalData.title == "Programare acceptată"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Appointment Cancelled" || data.notification.payload.additionalData.title == "Programare anulată"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "Application canceled" || data.notification.payload.additionalData.title == "Cerere anulată"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else if ( data.notification.payload.additionalData.title == "New Appointment" || data.notification.payload.additionalData.title == "Programare noua"){
          this.nav.setRoot(TabsPage);
          this.nav.push(RequestsPage);
        } else {
          this.nav.setRoot(TabsPage);
          this.nav.push(NotificationsPage);
        }


        
      });
      this.oneSignal.endInit();
      
      
      this.oneSignal.addSubscriptionObserver().subscribe((state) => {
        if (!state.from.subscribed && state.to.subscribed) {
         // get player ID
          state.to.userId
          console.log(state.to.userId);
          console.log(state);
          console.log('addsub');
        }
      });

    }

     

    this.oneSignal.getPermissionSubscriptionState().then((status)  => {
      status.permissionStatus.hasPrompted; // Bool
      status.permissionStatus.status; // iOS only: Integer: 0 = Not Determined, 1 = Denied, 2 = Authorized
      status.permissionStatus.state; //Android only: Integer: 1 = Authorized, 2 = Denied
    
      status.subscriptionStatus.subscribed; // Bool
      status.subscriptionStatus.userSubscriptionSetting; // Bool
      status.subscriptionStatus.userId; // String: OneSignal Player ID
      status.subscriptionStatus.pushToken; // String: Device Identifier from FCM/APNs
  
      console.log(status);
    });
  }



  private presentLoading(message: string) {
    this.loading = this.loadingCtrl.create({
      content: message
    });

    this.loading.onDidDismiss(() => { });

    this.loading.present();
    this.loadingShown = true;
  }

  private dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }

  private showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  // private formatDate(date: Date): string {
  //   let months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  //   return this.translate.instant(months[date.getMonth()]) + ' ' + date.getDate() + ', ' + date.getFullYear();
  // }
  introMethod() {
    // import IntroJS
    // const IntroJs = require("../../../node_modules/intro.js/intro");
    let intro = IntroJs.introJs();
    console.log("inside intro.js");
    intro.setOptions({
    steps: [
    {
    intro: "Ahlan wa Sahlan"
    },
    {
    element: "#step1",
    intro:
    "When you are slaves on Earth, and  you are told: ‘Renounce Earthly freedom, for in Heaven awaits you unimaginable freedom.’ Answer back: 'He who did not taste freedom on Earth, will not know it in Heaven!’",
    position: "right"
    },
    {
    element: "#step2",
    intro:
    "Most people live way too long in the past. The past is a springboard to jump forward from, not a sofa to relax on",
    position: "bottom"
    }
    ],
    showProgress: true,
    skipLabel: "Annuler",
    doneLabel: "Commencer",
    nextLabel: "Suivant",
    prevLabel: "Précédent",
    overlayOpacity: "0.8"
    });
    intro.start();
  }

}
