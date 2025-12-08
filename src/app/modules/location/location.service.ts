import { ILocation } from "./location.interface";
import { Location } from "./location.model";



const createLocations = async (payload: ILocation) => {

    const createdLocation = await Location.create(payload);

    return createdLocation;
}
const getAllLocations = async () => {

    const allLocations = await Location.find(); 
    return allLocations;
}
const getSingleLocation = async (payload: Partial<ILocation>) => {

    const location = await Location.findById(payload._id);

    return location;
}
const updateLocation = async (payload: Partial<ILocation>) => {

    const updatedLocation = await Location.findByIdAndUpdate(payload._id, payload, { new: true });
    return updatedLocation;
}

const deleteLocation = async (payload: Partial<ILocation>) => {
    const deletedLocation = await Location.findByIdAndDelete(payload._id);

    return deletedLocation;
}


const getContinents = async () => {
  return Location.distinct("continent");
};

const getCountriesByContinent = async (continent: string) => {
  return Location.distinct("country", { continent });
};

const getCitiesByCountry = async (country: string) => {
  return Location.distinct("city", { country });
};

const getDestinationsByCity = async (city: string) => {
  return Location.find({ city }).select("destination country city continent");
};




export const locationService = {
    createLocations,
    getAllLocations,
    getSingleLocation,
    updateLocation,
    deleteLocation,
     getContinents,
  getCountriesByContinent,
  getCitiesByCountry,
  getDestinationsByCity,

}