import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AllreviewPage } from '../allreview/allreview';
import { Constants } from '../../models/constants.models';
import { ClientService } from '../../providers/client.service';
import { Rating } from '../../models/rating.models';
import { RatingSummary } from '../../models/rating-summary.models';
import { Profile } from '../../models/profile.models';

@Component({
  selector: 'page-review',
  templateUrl: 'review.html'
})
export class ReviewPage {
  private profileMe: Profile;
  private rating: Rating;

  constructor(private navCtrl: NavController, private service: ClientService) {
    this.rating = JSON.parse(window.localStorage.getItem(Constants.KEY_RATING_SUMMARY));
    if (!this.rating) this.rating = Rating.getDefault();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.profileMe = JSON.parse(window.localStorage.getItem(Constants.KEY_PROFILE));
      if (this.profileMe) {
        this.service.getRatings(this.profileMe.id).subscribe(res => {
          let ratingSummaries = RatingSummary.defaultArray();
          for (let ratingSummaryResult of res.summary) {
            ratingSummaries[ratingSummaryResult.rounded_rating - 1].total = ratingSummaryResult.total;
            ratingSummaries[ratingSummaryResult.rounded_rating - 1].percent = ((ratingSummaryResult.total / res.total_ratings) * 100);
          }
          res.summary = ratingSummaries;
          this.rating = res;
          window.localStorage.setItem(Constants.KEY_RATING_SUMMARY, JSON.stringify(res));
        }, err => {
          console.log('rating_err', err);
        });
      }
    }, 1000);
  }

  allreview() {
    this.navCtrl.push(AllreviewPage);
  }

}
