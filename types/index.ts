export interface Category {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    subs: string[];
}

export interface RecurringItem {
    id: string;
    type: string;
    name: string;
    amount: number;
    owner: string;
    category?: string;
    sub?: string;
    deletedAt?: string;
}

export interface Transaction {
    id: string;
    date: string;
    category: string;
    sub: string;
    amount: number;
    notes: string;
    isPaid: boolean;
    week: string;
    owner: string;
}
