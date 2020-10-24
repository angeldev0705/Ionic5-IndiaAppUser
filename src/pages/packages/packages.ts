import { Component, Inject } from '@angular/core';
import { NavController, Loading, LoadingController, Platform, AlertController } from 'ionic-angular';
import { PurchaseplanPage } from '../purchaseplan/purchaseplan';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { Plan } from '../../models/plan.models';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper.models';
import { PlanDetail } from '../../models/plan-detail.models';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { InAppPurchase } from '@ionic-native/in-app-purchase';

@Component({
  selector: 'page-packages',
  templateUrl: 'packages.html'
})
export class PackagesPage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  private plans: Array<Plan>;
  private currency: string;
  private myPlanDetail = PlanDetail.default();

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController, private service: ClientService, private platform: Platform, private alertCtrl: AlertController,
    private loadingCtrl: LoadingController, private translate: TranslateService, private iap: InAppPurchase) {
    this.currency = Helper.getSetting("currency");
    this.refreshPackages();
  }

  ionViewDidEnter() {
    let subscription: Subscription = this.service.planDetails().subscribe(res => {
      this.myPlanDetail = res;
    }, err => {
      console.log('plandetail', err);
    });
    this.subscriptions.push(subscription);
  }

  refreshPackages() {
    this.platform.ready().then(() => {
      this.translate.get('loading_plans').subscribe(value => this.presentLoading(value));
      if (this.platform.is("ios")) {
        this.iap.getProducts(this.config.inAppProductIds).then((products) => {
          console.log("products_in", products);
          let plansToShow = new Array<Plan>();
          for (let product of products) {
            let plan = new Plan();
            plan.id = String(product.productId);
            plan.name = product.title;
            plan.description = product.description;
            plan.price = product.price;
            plan.priceToShow = product.price;

            plansToShow.push(plan);
          }
          this.plans = plansToShow;
          this.dismissLoading();
        }).catch((err) => {
          console.log('packageslist', err);
          this.dismissLoading();
        });
      } else {
        this.subscriptions.push(this.service.plans().subscribe(res => {
          for (let p of res) p.priceToShow = this.currency + p.price;
          this.plans = res;
          this.dismissLoading();
          window.localStorage.setItem(Constants.KEY_PLANS, JSON.stringify(res));
        }, err => {
          console.log('packageslist', err);
          this.dismissLoading();
        }));
      }
    });
  }

  planDetail(plan) {
    this.navCtrl.push(PurchaseplanPage, { plan: plan });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
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
