export interface HotelType{
    _id: string;
    userId: string;
    name: string;
    city: string;
    country: string
    description: string;
    type: string;
    adultCount: number;
    childCount: number;
    facilities: [];
    pricePerNight: number;
    starRating: number
    imageUrls: string[]
    lastUpdated: Date;
}