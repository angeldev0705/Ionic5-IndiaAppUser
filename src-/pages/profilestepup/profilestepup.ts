import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ProfilestepupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-profilestepup',
  templateUrl: 'profilestepup.html',
})
export class ProfilestepupPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilestepupPage');
  }

  // save() {
  //   if (!this.profile.categories || !this.profile.categories.length) {
  //     this.translate.get('err_service_cat').subscribe(value => this.showToast(value));
  //     return;
  //   }
  //   if (!this.profile.subcategories || !this.profile.subcategories.length) {
  //     this.translate.get('err_services').subscribe(value => this.showToast(value));
  //     return;
  //   }
  //   if (!this.profile.price || this.profile.price <= 0) {
  //     this.translate.get('err_empty_price').subscribe(value => this.showToast(value));
  //     return;
  //   }
  //   if (!this.profile.about || !this.profile.about.length) {
  //     this.translate.get('err_empty_about').subscribe(value => this.showToast(value));
  //     return;
  //   }
  //   if (!this.profile.address || !this.profile.address.length) {
  //     this.translate.get('err_select_location').subscribe(value => this.showToast(value));
  //     return;
  //   }
  //   // if (!this.profile.document_url || !this.profile.document_url.length) {
  //   //   this.translate.get('err_empty_doc').subscribe(value => this.showToast(value));
  //   //   return;
  //   // }

  //   let profileRequest = new ProfileUpdateRequest(this.profile);
  //   this.translate.get('profile_updating').subscribe(value => {
  //     this.presentLoading(value);
  //     this.subscriptions.push(this.service.updateProfile(profileRequest).subscribe(res => {
  //       window.localStorage.setItem(Constants.KEY_PROFILE, JSON.stringify(res));
  //       if (this.service.getTokenSetToUse()) window.localStorage.setItem(Constants.KEY_TOKEN, this.service.getTokenSetToUse());
  //       this.dismissLoading();
  //       this.app.getRootNav().setRoot(TabsPage);
  //     }, err => {
  //       this.dismissLoading();
  //       console.log("profile_update_err", err);
  //       this.translate.get('profile_updating_fail').subscribe(value => this.presentErrorAlert(value));
  //     }));
  //   });
  // }

}
