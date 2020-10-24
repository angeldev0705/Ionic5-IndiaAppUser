import { Component, ViewChild } from '@angular/core';
import { NavController, Loading, NavParams, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { SignUpRequest } from '../../models/signup-request.models';
import { OtpPage } from '../otp/otp';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  @ViewChild('inputname') inputname;
  @ViewChild('inputemail') inputemail;
  @ViewChild('inputphone') inputphone;
  private loading: Loading;
  private loadingShown: Boolean = false;
  private signUpRequest = new SignUpRequest('', '', '', '');
  private countries: any;
  private phoneNumber: string;
  private countryCode: string;
  private phoneNumberFull: string;
  private phoneNumberHint: string;
  userType;

  constructor(params: NavParams, private navCtrl: NavController, private clientService: ClientService, private translate: TranslateService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController, private alertCtrl: AlertController) {
    let code = params.get('code');
    let phone = params.get('phone');
    let name = params.get('name');
    let email = params.get('email');
    if(email && email.length && name && name.length)
    {
      this.userType =  'googleuser';
    } else if ( code && code.length && phone && phone.length) {
      this.userType = 'mobileNumber';
    }
    // console.log(code);
    // console.log(phone);
    // if(code) {
    //   this.countryCode = code;
    // }
    // if(phone) {
    //   this.phoneNumber = phone;
    // }
    if (code && code.length) {
      this.countryCode = code;
      console.log(this.countryCode);
    }
    if (phone && phone.length) {
      this.phoneNumber = phone;
      console.log(this.phoneNumber);
    }
    if (name && name.length) {
      this.signUpRequest.name = name;
    }
    if (email && email.length) {
      this.signUpRequest.email = email;
    }
    this.getCountries();
    // this.changeHint();
  }

  focusEmail() {
    this.inputemail.setFocus();
  }

  focusPhone() {
    this.inputphone.setFocus();
  }

  // changeHint() {
  //   this.phoneNumber = "";
  //   if (this.countryCode && this.countryCode.length) {
  //     this.translate.get('enter_phone_number_exluding').subscribe(value => {
  //       this.phoneNumberHint = value + " (+" + this.countryCode + ")";
  //     });
  //   } else {
  //     this.translate.get('enter_phone_number').subscribe(value => {
  //       this.phoneNumberHint = value;
  //     });
  //   }
  // }

  getCountries() {
    this.clientService.getCountries().subscribe(data => {
      this.countries = data;
    }, err => {
      console.log(err);
    })
  }

  requestSignUp() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!this.signUpRequest.name.length) {
      this.translate.get('err_valid_name').subscribe(value => this.showToast(value));
    } else if (this.signUpRequest.email.length <= 5 || !reg.test(this.signUpRequest.email)) {
      this.translate.get('err_valid_email').subscribe(value => this.showToast(value));
    } else if( this.userType === 'mobileNumber') {
      if (!this.countryCode || !this.countryCode.length || !this.phoneNumber || !this.phoneNumber.length) {
        console.log(this.countryCode);
        console.log(this.phoneNumber);
        this.translate.get('err_valid_phone').subscribe(value => this.showToast(value));
      }
      else{
        this.alertPhone();
      }
    } else {
      if (!this.countryCode || !this.countryCode.length) {
        this.translate.get("select_country").subscribe(value => this.showToast(value));
        return;
      }
      if (!this.phoneNumber || this.phoneNumber.length === 0) {
        this.translate.get("enter_phone_number").subscribe(value => this.showToast(value));
        //this.showToast(this.phoneNumberHint);
        return;
      }
      if(this.phoneNumber.length < 9 || this.phoneNumber.length > 10){
        this.translate.get("input_number_length").subscribe(value => this.showToast(value));
        return;
      }
      /*if (this.phoneNumber.length > 10) {
        this.translate.get("input_number_length").subscribe(value => this.showToast(value));
        return;
      }*/else{
        alert("number "+this.phoneNumber);
        this.alertPhone();
      }
      /*if(this.phoneNumber.length == 10 && this.countryCode == '40'){
        console.log(this.phoneNumber.slice(0,1));
        if(this.phoneNumber.slice(0,1) == '0')
        {
          console.log(this.phoneNumber.slice(1,10));
          this.phoneNumber = this.phoneNumber.slice(1,10);
        } else {
          this.showToast(this.phoneNumberHint);
          return;
        }
      }*/
    }
  }

  alertPhone() {
    this.translate.get(['alert_phone', 'no', 'yes']).subscribe(text => {
      this.phoneNumberFull = "+" + this.countryCode + this.phoneNumber;
      let alert = this.alertCtrl.create({
        title: this.phoneNumberFull,
        message: text['alert_phone'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: text['yes'],
          handler: () => {
            this.signUpRequest.password = String(Math.floor(100000 + Math.random() * 900000));
            this.signUpRequest.mobile_number = this.phoneNumberFull;
            this.signUp();
          }
        }]
      });
      alert.present();
    });
  }

  signUp() {
    this.translate.get('signing_up').subscribe(value => {
      this.presentLoading(value);
    });
    this.clientService.signUp(this.signUpRequest).subscribe(res => {
      console.log(res);
      this.dismissLoading();
      this.navCtrl.push(OtpPage, { phoneNumberFull: res.user.mobile_number });
    }, err => {
      console.log(err);
      this.dismissLoading();
      let errMsg;
      this.translate.get(['invalid_credentials', 'invalid_credential_email', 'invalid_credential_phone', 'invalid_credential_password']).subscribe(value => {
        errMsg = value['invalid_credentials'];
        if (err && err.error && err.error.errors) {
          if (err.error.errors.email) {
            errMsg = value['invalid_credential_email'];
          } else if (err.error.errors.mobile_number) {
            errMsg = value['invalid_credential_phone'];
          } else if (err.error.errors.password) {
            errMsg = value['invalid_credential_password'];
          }
        }
        this.presentErrorAlert(errMsg);
      });
    });
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

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
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

}
