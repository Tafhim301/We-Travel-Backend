/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { locationService } from "./location.service";


const createLocations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await locationService.createLocations(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Location created successfully",
      data: result,
    });
  }
);
const getAllLocations    = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await locationService.getAllLocations();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Locations retrieved successfully",
      data: result,
    });
  }
);
const getSingleLocation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const result = await locationService.getSingleLocation({_id: id});
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Location retrieved successfully",
      data: result,
    });
  }
);
const updatedLocation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
     const {id} = req.params;
    const result = await locationService.updateLocation({_id: id , ...req.body});
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Location updated successfully",
      data: result,
    });
  }
);
const deletedLocation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
     const {id} = req.params;
     await locationService.deleteLocation({_id : id});
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Location deleted successfully",
      data: null,
    });
  }
);


const getContinents = catchAsync(async (req, res) => {
  const result = await locationService.getContinents();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Continents fetched successfully",
    data: result,
  });
});

const getCountries = catchAsync(async (req, res) => {
  const { continent } = req.query;
  const result = await locationService.getCountriesByContinent(String(continent));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Countries fetched successfully",
    data: result,
  });
});

const getCities = catchAsync(async (req, res) => {
  const { country } = req.query;
  const result = await locationService.getCitiesByCountry(String(country));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cities fetched successfully",
    data: result,
  });
});

const getDestinations = catchAsync(async (req, res) => {
  const { city } = req.query;
  const result = await locationService.getDestinationsByCity(String(city));
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Destinations fetched successfully",
    data: result,
  });
});



export const locationController = {
    createLocations,
    getAllLocations,
    getSingleLocation,
    updatedLocation,
    deletedLocation,
    getContinents,
    getCountries,
    getCities,
    getDestinations,
};
