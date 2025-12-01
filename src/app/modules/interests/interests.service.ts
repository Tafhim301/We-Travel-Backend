
import { IInterest } from "./interests.interface";
import { Interest } from "./interests.model";

const createInterests = async (payload: Partial<IInterest>) => {

    const createdInterest = await Interest.create(payload);

    return createdInterest;

}
const getAllInterests = async () => {

    const allInterests = await Interest.find();

    return allInterests;
}
const getSingleInterest = async (payload: Partial<IInterest>) => {

    const interest = await Interest.findById(payload._id);

    return interest;
}
const updateInterest = async (payload: Partial<IInterest>) => {

    const updatedInterest = await Interest.findByIdAndUpdate(payload._id, payload, { new: true });

    return updatedInterest;
}

const deleteInterest = async (payload: Partial<IInterest>) => {

    const deletedInterest = await Interest.findByIdAndDelete(payload._id);

    return deletedInterest;
}



export const interestService = {
    createInterests,
    getAllInterests,
    getSingleInterest,
    updateInterest,
    deleteInterest,


}