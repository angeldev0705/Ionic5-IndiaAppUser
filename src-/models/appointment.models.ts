import { User } from "./user.models";
import { Profile } from "./profile.models";
import { Address } from "./address.models";
import { Category } from "./category.models";
import { StatusLog } from "./status-log.models";

export class Appointment {
    id: number;
    provider_id: number;
    user_id: number;
    address_id: number;
    status: string;
    date: string;
    time_from: string;
    time_to: string;
    created_at: string;
    updated_at: string;
    notes: string;
    user: User;
    provider: Profile;
    address: Address;
    category: Category;
    logs: Array<StatusLog>;
}