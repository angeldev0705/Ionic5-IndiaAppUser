import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { ToastController } from 'ionic-angular'; 
import { ClientService } from '../../providers/client.service';
import { ScanresultPage } from '../scanresult/scanresult'; 
/**
 * Generated class for the QrscannerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-qrscanner',
  templateUrl: 'qrscanner.html',
  providers: [ClientService]
})
export class QrscannerPage {
  scanSubscription;
  constructor(public navCtrl: NavController, public navParams: NavParams, private qrScanner: QRScanner , private toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    this.scan();
  }
  ionViewWillLeave() {
    this.stopScanning();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QRscannerPage');
    this.scan();
  }

  scan() {
    (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
      this.qrScanner.prepare().then((status: QRScannerStatus) => {
        console.log('qrscanner is running');
        console.log(status);
        if (status.authorized) {
          this.qrScanner.show();
          console.log('qr show hit');
          this.scanSubscription = this.qrScanner.scan().subscribe((text:string) => {
            console.log('this is on subscribe one ');
            let toast = this.toastCtrl.create({
              message: 'QR Code Scaned',
              position: 'bottom',
              duration: 3000,
              closeButtonText: 'OK'
            });
            toast.present();
            this.navCtrl.push(ScanresultPage, { scantext: text });
          });
        } else {
          console.error('Permission Denied', status);
        }
      })
      .catch((e: any) => {
        console.error('Error', e);
      });
  }
  
  stopScanning() {
    (this.scanSubscription) ? this.scanSubscription.unsubscribe() : null;
    this.scanSubscription=null;
    (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
    this.qrScanner.hide();
    this.qrScanner.destroy();
  }
  
}
