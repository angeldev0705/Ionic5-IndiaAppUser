import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AccountPage } from '../account/account';


/**
 * Generated class for the ScanresultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-scanresult',
  templateUrl: 'scanresult.html',
})
export class ScanresultPage {
  QRtoken;
  resultQuery;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.QRtoken =  this.navParams.get("scantext");
    this.checkResult();
  }

  
  ionViewDidLoad() {
    console.log('ionViewDidLoad ScanresultPage');
    console.log(this.QRtoken);
  }

  
  checkResult(){
      if(this.QRtoken){
        if(this.QRtoken == 'win'){
          this.resultQuery = 'You win the price congrats';
        } else if(this.QRtoken == 'mismatch') {
          this.resultQuery = "The code it's matching but the prize was already wined";
        } else if(this.QRtoken == 'nexttime'){
          this.resultQuery = "Good luck next time";
        } else {
          this.resultQuery = "The code isn't matching";
        }
      } else {
        alert("Please Scan QR Code properly");
      }
  }


  ionViewWillUnload(){
    this.navCtrl.setRoot(AccountPage);
  }

  back(){
    this.navCtrl.setRoot(AccountPage);
  }

}
