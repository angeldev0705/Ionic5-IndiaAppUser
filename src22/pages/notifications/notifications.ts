import { Component } from '@angular/core';
import { NavController, Toast, ToastController } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { MyNotification } from '../../models/notifications.models';
import { Helper } from '../../models/helper.models';
import { ChatslistPage } from '../chatslist/chatslist';
import { RequestsPage } from '../requests/requests';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {
  private notifications = new Array<MyNotification>();

  constructor(private nav: NavController) { }

  ionViewDidEnter() {
    let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
    if (notifications && notifications.length) {
      let locale = Helper.getLocale();
      for (let noti of notifications) {
        noti.time = Helper.formatMillisDate(Number(noti.time), locale);
        if (noti.title.toLowerCase().includes("pending")) {
          //noti.title = "Pending";
        } else if (noti.title.toLowerCase().includes("accepted")) {
          //noti.title = "Accepted";
          noti.colorclass = "completed";
        } else if (noti.title.toLowerCase().includes("onway")) {
          //noti.title = "On the way";
        } else if (noti.title.toLowerCase().includes("ongoing")) {
          //noti.title = "On going";
        } else if (noti.title.toLowerCase().includes("complete")) {
          //noti.title = "Complete";
          noti.colorclass = "completed";
        } else if (noti.title.toLowerCase().includes("cancelled")) {
          //noti.title = "Cancelled";
          noti.colorclass = "cancelled";
        } else if (noti.title.toLowerCase().includes("rejected")) {
          //noti.title = "Rejected";
          noti.colorclass = "cancelled";
        } else if (noti.title.toLowerCase().includes("message")) {
          //noti.title = "New Message";
          noti.colorclass = "new_message";
        }
      }
      this.notifications = notifications.reverse();
    }
  }


  goto(title){
    if( title == "New message" || title == "Mesaj nou"){
      this.nav.push(ChatslistPage);
    } else if ( title == "Application canceled" || title == "Cerere anulată"){
      this.nav.push(RequestsPage);
    } else if ( title == "Application accepted" || title == "Cerere acceptată"){ 
      this.nav.push(RequestsPage);
    } else if ( title == "Application rejected" || title == "Cerere respinsă"){
      this.nav.push(RequestsPage);
    } else if ( title == "The provider is on his way" || title == "Providerul este pe drum"){
      this.nav.push(RequestsPage);
    } else if ( title == "Complete activity" || title == "Activitate completă"){
      this.nav.push(RequestsPage);
    } else if ( title == "Appointment Started" || title == "Programarea a început"){
      this.nav.push(RequestsPage);
    } else if ( title == "Appointment Complete" || title == "Programare finalizată"){
      this.nav.push(RequestsPage);
    } else if ( title == "New application" || title == "Cerere nouă"){
      this.nav.push(RequestsPage);
    } else if ( title == "Appointment Accepted" || title == "Programare acceptată"){
      this.nav.push(RequestsPage);
    } else if ( title == "Appointment Cancelled" || title == "Programare anulată"){
      this.nav.push(RequestsPage);
    } else if ( title == "Application canceled" || title == "Cerere anulată"){
      this.nav.push(RequestsPage);
    } else if ( title == "New Appointment" || title == "Programare noua"){
      this.nav.push(RequestsPage);
    } else {
      
    }

  }
}