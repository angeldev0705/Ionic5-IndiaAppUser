import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AlertController } from 'ionic-angular'
import { RequestsPage } from '../requests/requests';
import { NotificationsPage } from '../notifications/notifications';
import { ReviewPage } from '../review/review';
import { AccountPage } from '../account/account';
import { ChatslistPage } from '../chatslist/chatslist';
import { Tabs } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Diagnostic } from '@ionic-native/diagnostic';
import { TranslateService } from '@ngx-translate/core';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('myTabs') tabRef: Tabs;

  tab1Root = RequestsPage;
  tab2Root = NotificationsPage;
  tab3Root = ReviewPage;
  tab4Root = ChatslistPage;
  tab5Root = AccountPage;

  constructor(private service: ClientService, diagnostic: Diagnostic, private geolocation: Geolocation,
    private translate: TranslateService, private alertCtrl: AlertController) {

    service.logActivity().subscribe(res => {
      console.log(res);
    }, err => {
      console.log('logActivity', err);
    });

    diagnostic.isLocationEnabled().then((isAvailable) => {
      if (isAvailable) {
        this.setLocation();
      } else {
        this.alertLocationServices();
        this.setLocation();
      }
    }).catch((e) => {
      console.error(e);
      this.alertLocationServices();
      this.setLocation();
    });

  }

  setLocation() {
    this.geolocation.getCurrentPosition().then((position) => {
      this.service.updateProfile({ longitude: String(position.coords.longitude), latitude: String(position.coords.latitude) }).subscribe(res => {
        console.log(res);
      }, err => {
        console.log('logActivity', err);
      });
    }).catch((err) => {
      console.log("getCurrentPosition", err);
    });
  }

  alertLocationServices() {
    this.translate.get(['location_services_title', 'location_services_message', 'okay']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['location_services_title'],
        subTitle: text['location_services_message'],
        buttons: [{
          text: text['okay'],
          role: 'cancel',
          handler: () => {
            console.log('okay clicked');
          }
        }]
      });
      alert.present();
    })
  }

}
