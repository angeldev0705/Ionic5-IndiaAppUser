import { Component, Inject } from '@angular/core';
import { NavController, Loading, LoadingController, Platform, AlertController, ToastController, ModalController  } from 'ionic-angular';
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

/**
 * Generated class for the SubscriptionPage page., 
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-subscription',
  templateUrl: 'subscription.html',
})
export class SubscriptionPage {

  private loading: Loading;
  private loadingShown: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  private plans: Array<Plan>;
  private currency: string;
  private myPlanDetail = PlanDetail.default();
  private selected;
  public imgs = [
    ["https://as2.ftcdn.net/jpg/01/11/68/57/500_F_111685778_kVH0Svxuop5CtSEX5bBMiI1emDLPo0SO.jpg"],
    ["https://as2.ftcdn.net/jpg/01/16/06/45/500_F_116064535_ckO9G8Go5IJ44CC0q2r9EQPk9x0NTxrv.jpg"],
    ["https://as2.ftcdn.net/jpg/00/55/55/97/500_F_55559766_RbNjuAOOWxefOQW9j9vubEvynBgO7n3O.jpg"],
  ]

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private navCtrl: NavController, private service: ClientService, private platform: Platform, private alertCtrl: AlertController,
    private loadingCtrl: LoadingController, private translate: TranslateService, private iap: InAppPurchase ,  private toastCtrl: ToastController, public modelCtrl: ModalController) {
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

  checksub(){
    if(!this.selected){
      console.log(this.selected);
      console.log('condition');
      this.showToast("please select the plan to continue");
    }
    else{
      console.log(this.selected);
      console.log(this.plans[this.selected]);
      this.planDetail(this.plans[this.selected]);
      // this.openmodel();
    }
  }


  private showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  // openmodel(){
  //   const model = this.modelCtrl.create(PurchaseplanPage);
  //   model.onDidDismiss(() => {
  //     console.log('dissmiss');
  //   });
  //   model.present();
  // }
 
}
