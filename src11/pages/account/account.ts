import { Component, Inject } from '@angular/core';
import { NavController, AlertController, App } from 'ionic-angular';
import { MyprofilePage } from '../myprofile/myprofile';
import { PackagesPage } from '../packages/packages';
import { ConatctusPage } from '../conatctus/conatctus';
import { PrivacyPage } from '../privacy/privacy';
import { SigninPage } from '../signin/signin';
import { Profile } from '../../models/profile.models';
import { Constants } from '../../models/constants.models';
import { DocumentUploadPage } from '../document-upload/document-upload';
import { TranslateService } from '@ngx-translate/core';
import { ManagelanguagePage } from '../managelanguage/managelanguage';
import { My_portfolioPage } from '../my_portfolio/my_portfolio';
import { Helper } from '../../models/helper.models';
import { FaqsPage } from '../faqs/faqs';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { AppConfig, APP_CONFIG } from '../../app/app.config';
import { ClientService } from '../../providers/client.service';
import { QrscannerPage } from '../qrscanner/qrscanner';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  profile = new Profile();

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController, private alertCtrl: AlertController,
    private app: App, private translate: TranslateService, public inAppBrowser: InAppBrowser, private apiService: ClientService) { }

  ionViewDidEnter() {
    let savedProfile = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
    if (savedProfile != null) this.profile = savedProfile;
  }

  myprofile() {
    this.navCtrl.push(MyprofilePage);
  }
  packages() {
    this.navCtrl.push(PackagesPage);
  }
  conatctus() {
    this.navCtrl.push(ConatctusPage);
  }
  faqs() {
    this.navCtrl.push(FaqsPage);
  }
  privacy() {
    let terms: string = Helper.getSetting("privacy_policy");
    if (terms && terms.length) {
      this.translate.get('privacy_policy').subscribe(value => {
        this.navCtrl.push(PrivacyPage, { toShow: terms, heading: value });
      });
    }
  }
  aboutus() {
    let terms: string = Helper.getSetting("about_us");
    if (terms && terms.length) {
      this.translate.get('about_us').subscribe(value => {
        this.navCtrl.push(PrivacyPage, { toShow: terms, heading: value });
      });
    }
  }
  chooseLanguage() {
    this.navCtrl.push(ManagelanguagePage);
  }
  my_portfolio() {
    this.navCtrl.push(My_portfolioPage);
  }

  uploadDocument(){
    this.navCtrl.push(DocumentUploadPage);
  }

  QR(){
    this.navCtrl.push(QrscannerPage);
  }

  alertLogout() {
    this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['logout_title'],
        message: text['logout_message'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }, {
          text: text['yes'],
          handler: () => {
            window.localStorage.removeItem(Constants.KEY_TOKEN);
            window.localStorage.removeItem(Constants.KEY_PROFILE);
            window.localStorage.removeItem(Constants.KEY_NOTIFICATIONS);
            window.localStorage.removeItem(Constants.KEY_CARD_INFO);
            this.apiService.setupHeaders(null);
            this.app.getRootNav().setRoot(SigninPage);
          }
        }]
      });
      alert.present();
    });
  }
  
  developedBy() {
    const options: InAppBrowserOptions = {
      zoom: 'no'
    }
    const browser = this.inAppBrowser.create('https://verbosetechlabs.com/', '_system', options);
  }

}
