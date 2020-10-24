import { Category } from "./category.models";
import { User } from "./user.models";

export class Profile {
    id: number;
    //primary_category_id: number;
    user_id: number;
    is_verified: number;
    price: number;
    document_url: string;
    image_url: string;
    price_type: string;
    address: string;
    about: string;
    latitude: string;
    longitude: string;
    user: User;
    //primary_category: Category;
    categories: Array<Category>;
    subcategories: Array<Category>;
    ratings: number;
    ratingscount: number;

    constructor() {
        this.categories = new Array<Category>();
        this.subcategories = new Array<Category>();
        this.user = new User();
        this.price_type = "hour";
    }
}
