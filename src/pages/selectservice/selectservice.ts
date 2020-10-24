import { Component } from '@angular/core';
import { NavController, Loading, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Category } from '../../models/category.models';
import { Constants } from '../../models/constants.models';
import { Subscription } from 'rxjs/Subscription';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-selectservice',
  templateUrl: 'selectservice.html'
})
export class SelectservicePage {
  private loading: Loading;
  private loadingShown: Boolean = false;
  private isLoading = true;
  private parentCategories: Array<Category>;
  private subCategoriesOld: Array<Category>;
  private subCategoriesNew = new Array<Category>();
  private subscriptions: Array<Subscription> = [];
  private infiniteScroll: any;
  private pageNo = 1;
  private allDone = false;
  private beforeprice;
  callby;
  arr = Array();

  constructor(private navCtrl: NavController, params: NavParams, private service: ClientService,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController, private translate: TranslateService) {
    this.parentCategories = params.get("cats");
    this.subCategoriesOld = params.get("cats_sub");
    this.beforeprice = JSON.parse(window.localStorage.getItem('latestSubCat'));
    // let len = this.beforeprice.subcategories.length; 
    if(this.beforeprice)
    {
      console.log(this.beforeprice);
      let i = 0;
      for(let a of this.beforeprice)
      {
        this.arr[i] = a.pivot;
        console.log(a.pivot);
        i++;
      }
      console.log(this.arr);
    }
    // console.log(this.beforeprice.subcategories.pivot.length);
    this.callby = params.get("sendby");
  }

  ionViewDidEnter(){
    this.translate.get("just_moment").subscribe(value => {
      this.presentLoading(value);
      this.loadChildCategories();
    });
  }

  ionViewWillLeave() {
    let catsSelected = new Array<Category>();
    if (this.subCategoriesNew && this.subCategoriesNew.length) for (let cat of this.subCategoriesNew) if (cat.selected) catsSelected.push(cat);
    window.localStorage.setItem("temp_sub_cats", JSON.stringify(catsSelected));

    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.dismissLoading();
  }

  done() {
    console.log(this.subCategoriesNew);
    if (this.subCategoriesNew) {
      let selectenMade = false;
      let pricebalac =  true;
      for (let cat of this.subCategoriesNew) {
         console.log(cat);
        if (cat.selected) {
          selectenMade = true; 
          if(!cat.price) {
            pricebalac = false;
            break;
          }
          if(cat.price< 20 || cat.price >500) {
            this.translate.get('price_range_sel').subscribe(value => this.showToast(value));
            return;
          }
        }
      }
      if(this.callby){
        if(selectenMade){
          this.navCtrl.pop();
        }
        else{
          this.showToast("No services selected");
        }
      }else{
        if (selectenMade && pricebalac) {
          this.navCtrl.pop();
        } else {
          if(selectenMade){
            this.showToast("Please enter service price");
          }
          else{
            this.showToast("No services selected");
          }
        }
      }
    }
  }
  
  loadChildCategories() {
    this.isLoading = true;
    let parentCategoryIds = new Array<number>();
    for (let cat of this.parentCategories) parentCategoryIds.push(cat.id);

    this.subscriptions.push(this.service.categoryChildren(parentCategoryIds, this.pageNo).subscribe(res => {
      console.log(res);
      let cats: Array<Category> = res.data;
      if (this.subCategoriesOld) {
        for (let selectedCat of this.subCategoriesOld) {
          for (let newCat of cats) {
            if (selectedCat.id == newCat.id) {
              newCat.selected = true;
              break;
            } 
          }
        }
      }
      console.log(cats);
      this.subCategoriesNew = this.subCategoriesNew.concat(cats);
      for(let a of this.subCategoriesNew)
      {
        for(let b of this.arr){
          if(a.id == b.category_id){
            a.price = b.price;
          }
        }
      }
      this.isLoading = false;
      this.allDone = (!res || !res.data.length);
      this.dismissLoading();
    }, err => {
      console.log('cat_sub_err', err);
      this.isLoading = false;
      this.dismissLoading();
    }));
  }

  toggleSelection(subCat: Category) {
    subCat.selected = !subCat.selected;
    console.log('selection_toggle', subCat);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.loadChildCategories();
    } else {
      infiniteScroll.complete();
    }
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
}
