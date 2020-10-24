import { Profile } from "./profile.models";

export class ProfileUpdateRequest {
    price: number;
    price_type: string;
    document_url: string;
    address: string;
    longitude: string;
    latitude: string;
    about: string;
    sub_categories: Array<number>;

    constructor(profile: Profile) {
        this.sub_categories = new Array<number>();
        for (let cat of profile.categories) this.sub_categories.push(cat.id);
        for (let cat of profile.subcategories) this.sub_categories.push(cat.id);
        this.price = profile.price;
        this.price_type = profile.price_type;
        this.about = profile.about;
        this.address = profile.address;
        this.latitude = profile.latitude;
        this.longitude = profile.longitude;
        this.document_url = profile.document_url;
    }
}
