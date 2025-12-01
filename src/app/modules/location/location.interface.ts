export interface ILocation {
  _id: string;
  country: string;
  city: string;
  continent?: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; 
  };
}
