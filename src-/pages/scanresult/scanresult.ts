import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , LoadingController , Loading} from 'ionic-angular';
import { AccountPage } from '../account/account';
import { ClientService } from '../../providers/client.service';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';


/**
 * Generated class for the ScanresultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-scanresult',
  templateUrl: 'scanresult.html',
  providers: [ClientService]
})
export class ScanresultPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  QRtoken;
  resultQuery;
  qrmesg;
  user;
  date;
  constructor(public navCtrl: NavController, public navParams: NavParams , private service: ClientService , private loadingCtrl: LoadingController ,private translate: TranslateService,) {
    this.user = JSON.parse(localStorage.getItem('2milp_profile'));
    this.date = new Date().toJSON().slice(0, 10);
    this.QRtoken =  this.navParams.get("scantext");
    this.checkResult();
    console.log(this.user);
  }

  
  ionViewDidLoad() {
    console.log('ionViewDidLoad ScanresultPage');
    console.log(this.QRtoken);
  }

  
  checkResult(){
    this.translate.get('just_moment').subscribe(value => {
      this.presentLoading(value);
        this.qrmesg = {
          QRcode: this.QRtoken,
          winDate: this.date,
          UserID: this.user.id,
          APP: '2Mil'
        };
        this.service.checkQrCode(window.localStorage.getItem(Constants.KEY_TOKEN), this.qrmesg).subscribe(res => {
          console.log(res);
          this.resultQuery = res.message;
          this.dismissLoading();
        }, err => {
          console.log(err);
        });
      });
      // if(this.QRtoken){
      //   if(this.QRtoken == 'win'){
      //     this.resultQuery = 'You win the price congrats';
      //   } else if(this.QRtoken == 'mismatch') {
      //     this.resultQuery = "The code it's matching but the prize was already wined";
      //   } else if(this.QRtoken == 'nexttime'){
      //     this.resultQuery = "Good luck next time";
      //   } else {
      //     this.resultQuery = "The code isn't matching";
      //   }
      // } else {
      //   alert("Please Scan QR Code properly");
      // }
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


  ionViewWillUnload(){
    this.navCtrl.setRoot(AccountPage);
  }

  back(){
    this.navCtrl.setRoot(AccountPage);
  }

}
