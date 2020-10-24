import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatMap';
import { Observable } from "rxjs/Observable";
import { APP_CONFIG, AppConfig } from "../app/app.config";
import { Country } from '../models/country.models';
import { Setting } from '../models/setting.models';
import { ResetPasswordResponse } from '../models/reset-password-request.models';
import { AuthResponse } from '../models/auth-response.models';
import { SignUpRequest } from '../models/signup-request.models';
import { BaseListResponse } from '../models/base-list.models';
import { Profile } from '../models/profile.models';
import { ProfileUpdateRequest } from '../models/profile-update-request.models';
import { SupportRequest } from '../models/support-request.models';
import { Appointment } from '../models/appointment.models';
import { User } from '../models/user.models';
import { Rating } from '../models/rating.models';
import { Plan } from '../models/plan.models';
import { PlanDetail } from '../models/plan-detail.models';
import { ProviderPortfolio } from '../models/provider-portfolio.models';
import { SocialLoginRequest } from '../models/sociallogin-request.models';
import { Faq } from '../models/faq.models';
import { Helper } from '../models/helper.models';
import { Constants } from '../models/constants.models';
import moment from 'moment';
import { Category } from '../models/category.models';

@Injectable()
export class ClientService {
    private myHeaders: HttpHeaders;
    private tokenToUse: string;

    constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {
        this.setupHeaders();
    }

    setupHeaders(authToken?: string) {
        //let savedLanguageCode = Helper.getLanguageDefault();
        this.myHeaders = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': ('Bearer ' + (authToken ? authToken : window.localStorage.getItem(Constants.KEY_TOKEN)))
            //, 'X-Localization': String(savedLanguageCode ? savedLanguageCode : this.config.availableLanguages[0].code)
        });
        this.tokenToUse = authToken;
    }

    public getTokenSetToUse(): string {
        return this.tokenToUse;
    }

    public getCountries(): Observable<Array<Country>> {
        return this.http.get<Array<Country>>('./assets/json/countries.json').concatMap((data) => {
            return Observable.of(data);
        });
    }

    public getSettings(): Observable<Array<Setting>> {
        return this.http.get<Array<Setting>>(this.config.apiBase + "api/settings", { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public forgetPassword(resetRequest: any): Observable<ResetPasswordResponse> {
        return this.http.post<ResetPasswordResponse>(this.config.apiBase + "api/forgot-password", JSON.stringify(resetRequest), { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public login(loginTokenRequest: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + "api/login", JSON.stringify(loginTokenRequest), { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public loginSocial(socialLoginRequest: SocialLoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + "api/social/login", socialLoginRequest, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public signUp(signUpRequest: SignUpRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + "api/register", JSON.stringify(signUpRequest), { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public verifyMobile(verifyRequest: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + "api/verify-mobile", JSON.stringify(verifyRequest), { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public checkUser(checkUserRequest: any): Observable<{}> {
        return this.http.post<{}>(this.config.apiBase + "api/check-user", JSON.stringify(checkUserRequest), { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public updateProfile(profileRequest: any): Observable<Profile> {
        return this.http.put<Profile>(this.config.apiBase + "api/provider/profile", JSON.stringify(profileRequest), { headers: this.myHeaders }).concatMap(data => {
            this.setupProfile(data);
            return Observable.of(data);
        });
    }

    public plans(): Observable<Array<Plan>> {
        return this.http.get<Array<Plan>>(this.config.apiBase + "api/provider/plans", { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public planPurchase(adminToken: string, planId: string, token): Observable<{}> {
        const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
        return this.http.post<{}>(this.config.apiBase + 'api/provider/plans/' + planId + '/payment/stripe', { token: token }, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public planPurchaseIOS(adminToken: string, reciept: string, planId: string): Observable<{}> {
        const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
        return this.http.post<{}>(this.config.apiBase + 'api/provider/plans/payment/appleinapp', { 'reciept': reciept, 'apple_plan_id': planId }, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }


    public planDetails(): Observable<PlanDetail> {
        return this.http.get<PlanDetail>(this.config.apiBase + "api/provider/plan-details", { headers: this.myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.remaining_days_count = 0;
            if (data.subscription) {
                let dateStart = moment(data.subscription.starts_on).toDate();
                let dateEnd = moment(data.subscription.expires_on).toDate();
                let dateNow = new Date();
                data.remaining_days_count = dateNow > dateEnd ? 0 : Math.round((dateEnd.getTime() - dateNow.getTime()) / (1000 * 60 * 60 * 24));
                data.starts_at = Helper.formatMillisDate(dateStart.getTime(), locale);
                data.ends_at = Helper.formatMillisDate(dateEnd.getTime(), locale);
            }
            if (!data.leads_remaining_for_today) data.leads_remaining_for_today = 0;
            data.leads_remaining_for_today = Number(data.leads_remaining_for_today.toFixed(2));
            return Observable.of(data);
        });
    }

    public categoryParent(pageNo): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/category?page=" + pageNo, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public categoryParentAll(page?: number, prevData?: Array<Category>): Observable<Array<Category>> {
        let pageToUse = page ? page : 1;
        let toReturn = new Array<Category>();
        if (prevData != null) toReturn = toReturn.concat(prevData);
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/category?page=" + pageToUse, { headers: this.myHeaders }).concatMap(data => {
            return (data.data && data.data.length > 0) ? this.categoryParentAll(++pageToUse, toReturn.concat(data.data)) : Observable.of(toReturn);
        });
    }

    // public categoryChildren(parentId: number): Observable<BaseListResponse> {
    //     return this.http.get<BaseListResponse>(this.config.apiBase + "api/category?category_id=" + parentId, { headers: this.myHeaders }).concatMap(data => {
    //         return Observable.of(data);
    //     });
    // }

    public categoryChildren(parentIds: Array<number>, pageNum: number): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/category?page=" + pageNum + "&categories=" + parentIds.join(), { headers: this.myHeaders }).concatMap(data => {
            // for (let sc of data)
            //     if (sc.pivot) sc.price = sc.pivot.price;
            return Observable.of(data);
        });
    }

    public getProfile(): Observable<Profile> {
        return this.http.get<Profile>(this.config.apiBase + "api/provider/profile", { headers: this.myHeaders }).concatMap(data => {
            this.setupProfile(data);
            return Observable.of(data);
        });
    }

    public getRatings(userId: number): Observable<Rating> {
        return this.http.get<Rating>(this.config.apiBase + "api/customer/providers/" + userId + "/rating-summary", { headers: this.myHeaders }).concatMap(data => {
            data.average_rating = Number(data.average_rating).toFixed(2);
            return Observable.of(data);
        });
    }

    public getMyReviews(pageNo: number): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/provider/ratings/?page=" + pageNo, { headers: this.myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            for (let review of data.data) {
                review.created_at = Helper.formatTimestampDate(review.created_at, locale);
            }
            return Observable.of(data);
        });
    }

    public getMyPortfolio(): Observable<Array<ProviderPortfolio>> {
        return this.http.get<Array<ProviderPortfolio>>(this.config.apiBase + "api/provider/portfolio", { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public addMyPortfolio(folioBody: { image_url: string, link: string }): Observable<ProviderPortfolio> {
        return this.http.post<ProviderPortfolio>(this.config.apiBase + "api/provider/portfolio", folioBody, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public deleteMyPortfolio(folioId): Observable<ProviderPortfolio> {
        return this.http.delete<ProviderPortfolio>(this.config.apiBase + "api/provider/portfolio/" + folioId, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public submitSupport(supportRequest: SupportRequest): Observable<{}> {
        return this.http.post<{}>(this.config.apiBase + "api/support", supportRequest, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public appointments(pageNo: number): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/provider/appointment?page=" + pageNo, { headers: this.myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            for (let ap of data.data) {
                ap.created_at = Helper.formatTimestampDateTime(ap.created_at, locale);
                ap.updated_at = Helper.formatTimestampDateTime(ap.updated_at, locale);
                for (let log of ap.logs) {
                    log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                    log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
                }
                ap.date = Helper.formatTimestampDate(ap.date, locale);
                ap.time_from = ap.time_from.substr(0, ap.time_from.lastIndexOf(":"));
                ap.time_to = ap.time_to.substr(0, ap.time_to.lastIndexOf(":"));

                if (ap) {
                    let pCats = new Array<Category>();
                    if (ap.subcategories && ap.subcategories.length) for (let cat of ap.subcategories) if (!cat.parent_id || cat.parent_id == 0) pCats.push(cat);
                    ap.categories = pCats;
                }

            }
            return Observable.of(data);
        });
    }

    public appointmentById(apId: number): Observable<Appointment> {
        return this.http.get<Appointment>(this.config.apiBase + "api/provider/appointment/" + apId, { headers: this.myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));

            if (data.provider) {
                let pCats = new Array<Category>();
                if (data.provider.subcategories && data.provider.subcategories.length) for (let cat of data.provider.subcategories) if (!cat.parent_id || cat.parent_id == 0) pCats.push(cat);
                data.provider.categories = pCats;
            }

            return Observable.of(data);
        });
    }

    public appointmentUpdate(apId: number, status: string): Observable<Appointment> {
        return this.http.put<Appointment>(this.config.apiBase + "api/provider/appointment/" + apId, { status: status }, { headers: this.myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));

            if (data.provider) {
                let pCats = new Array<Category>();
                if (data.provider.subcategories && data.provider.subcategories.length) for (let cat of data.provider.subcategories) if (!cat.parent_id || cat.parent_id == 0) pCats.push(cat);
                data.provider.categories = pCats;
            }

            return Observable.of(data);
        });
    }

    public updateUser(requestBody: any): Observable<User> {
        return this.http.put<User>(this.config.apiBase + "api/user", requestBody, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public logActivity(): Observable<{}> {
        return this.http.post<{}>(this.config.apiBase + 'api/activity-log', {}, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public faqs(): Observable<Array<Faq>> {
        return this.http.get<Array<Faq>>(this.config.apiBase + 'api/faq-help', { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public postNotification(roleTo: string, userIdTo: string): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/user/push-notification', { role: roleTo, user_id: userIdTo }, { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public getWhatsappDetails() {
        return this.http.get('https://dashboard.vtlabs.dev/whatsapp.php?product_name=handyman', { headers: this.myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    private setupProfile(data: Profile) {
        let pCats = new Array<Category>();
        let cCats = new Array<Category>();
        if (data.subcategories && data.subcategories.length) for (let cat of data.subcategories) if (!cat.parent_id || cat.parent_id == 0) pCats.push(cat); else cCats.push(cat);
        data.categories = pCats;
        data.subcategories = cCats;
        if (!data.price_type) data.price_type = "hour";
    }
}