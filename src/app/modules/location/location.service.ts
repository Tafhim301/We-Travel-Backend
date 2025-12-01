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



export const locationService = {
    createLocations,
    getAllLocations,
    getSingleLocation,
    updateLocation,
    deleteLocation,

}