import { Component, Inject } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, Loading, AlertController, Platform } from 'ionic-angular';
import { Plan } from '../../models/plan.models';
import { CardInfo } from '../../models/card-info.models';
import { Constants } from '../../models/constants.models';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Stripe, StripeCardTokenParams } from '@ionic-native/stripe';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { ClientService } from '../../providers/client.service';
import { InAppPurchase } from '@ionic-native/in-app-purchase';

@Component({
  selector: 'page-purchaseplan',
  templateUrl: 'purchaseplan.html'
})
export class PurchaseplanPage {
  private plan: Plan;
  private cardInfo = new CardInfo();
  private loading: Loading;
  private loadingShown: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  pg: string;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private toastCtrl: ToastController, private iap: InAppPurchase,
    private translate: TranslateService, private navCtrl: NavController, navParam: NavParams, private alertCtrl: AlertController,
    private stripe: Stripe, private loadingCtrl: LoadingController, private service: ClientService, private platform: Platform) {
    this.plan = navParam.get("plan");
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      if (!this.platform.is("ios")) {
        let savedCardInfo = JSON.parse(window.localStorage.getItem(Constants.KEY_CARD_INFO));
        this.cardInfo = new CardInfo();
        if (savedCardInfo) {
          this.cardInfo.name = savedCardInfo.name;
          this.cardInfo.number = savedCardInfo.number;
          this.cardInfo.expMonth = savedCardInfo.expMonth;
          this.cardInfo.expYear = savedCardInfo.expYear;
        }
        this.pg = "stripe";
      } else {
        this.pg = "iap";
      }
    });
  }

  confirm() {
    this.platform.ready().then(() => {
      if (this.pg == "iap") {
        const component = this;
        this.translate.get("just_moment").subscribe(value => {
          this.presentLoading(value);
          let receipt = null;
          this.iap.buy(component.plan.id).then(function (data) {
            receipt = data.receipt;
            // ...then mark it as consumed:
            return component.iap.consume(data.productType, data.receipt, data.signature);
          }).then(function (res) {
            console.log('product was successfully consumed!');
            component.markBuyedIOS(receipt);
          }).catch(function (err) {
            console.log(err);
            component.dismissLoading();
            console.log("buyPlanErr", err);
            component.showToast(err && err.message ? err.message : "Unable to purchase selected plan");
          });
        });
      } else if (this.pg == "stripe") {
        if (this.cardInfo.areFieldsFilled()) {
          this.translate.get('verifying_card').subscribe(text => {
            this.presentLoading(text);
          });
          this.stripe.setPublishableKey(this.config.stripeKey);
          this.stripe.createCardToken(this.cardInfo as StripeCardTokenParams).then(token => {
            this.dismissLoading();
            window.localStorage.setItem(Constants.KEY_CARD_INFO, JSON.stringify(this.cardInfo));
            this.purchasePlan(token.id);
          }).catch(error => {
            this.dismissLoading();
            this.presentErrorAlert(error);
            this.translate.get('invalid_card').subscribe(text => {
              this.showToast(text);
            });
            console.error(error);
          });
        } else {
          this.translate.get('fill_valid_card').subscribe(text => {
            this.showToast(text);
          });
        }
      }
    });
  }

  markBuyedIOS(receiptBase64) {
    this.subscriptions.push(this.service.planPurchaseIOS(window.localStorage.getItem(Constants.KEY_TOKEN), receiptBase64, this.plan.id).subscribe(res => {
      this.dismissLoading();
      this.translate.get('plan_purchased').subscribe(text => this.showToast(text));
      this.navCtrl.pop();
    }, err => {
      console.log('purchase_err', err);
      this.dismissLoading();
      if (err && err.error && err.error.message) {
        this.showToast(err.error.message);
      } else {
        this.showToast("Something went wrong on server");
      }
      this.navCtrl.pop();
    }));
  }

  purchasePlan(stripeToken) {
    this.subscriptions.push(this.service.planPurchase(window.localStorage.getItem(Constants.KEY_TOKEN), this.plan.id, stripeToken).subscribe(res => {
      this.dismissLoading();
      this.translate.get('plan_purchased').subscribe(text => {
        this.showToast(text);
      });
      this.navCtrl.pop();
    }, err => {
      console.log('purchase_err', err);
      this.dismissLoading();
      this.navCtrl.pop();
    }));
  }


  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
  }

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

  showToast(message: string) {
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
