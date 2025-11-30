export interface ILocation {
  country: string;
  city: string;
  continent?: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; 
  };
}
