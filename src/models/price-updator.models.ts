import { Profile } from "./profile.models";

export class PriceUpdate {
    price: number;
    price_type: string;
    document_url: string;
    address: string;
    longitude: string;
    latitude: string;
    about: string;
    sub_categories: Array<string>;

    constructor(profile: Profile) {
        let ob;
        this.sub_categories = new Array<string>();
        for (let cat of profile.categories) {
            ob = { id: cat.id , price: '0' }
            this.sub_categories.push(ob);
        } 
        for (let cat of profile.subcategories) {
            ob = { id: cat.id , price: cat.price }
            this.sub_categories.push(ob);
        } 
        this.price = profile.price;
        this.price_type = profile.price_type;
        this.about = profile.about;
        this.address = profile.address;
        this.latitude = profile.latitude;
        this.longitude = profile.longitude;
        this.document_url = profile.document_url;
    }
}