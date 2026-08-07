import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Address } from '../models/Address.js';

// 1. Get All User Addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, addresses, 'Addresses retrieved successfully.'));
});

// 2. Create Address
export const createAddress = asyncHandler(async (req, res) => {
  const existingCount = await Address.countDocuments({ user: req.user._id });

  const addressData = {
    ...req.body,
    user: req.user._id,
  };

  // If this is the user's first address, force isDefault to true
  if (existingCount === 0) {
    addressData.isDefault = true;
  }

  const address = await Address.create(addressData);

  return res
    .status(201)
    .json(new ApiResponse(201, address, 'Address created successfully.'));
});

// 3. Update Address
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await Address.findById(id);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  if (address.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this address.');
  }

  Object.assign(address, req.body);
  await address.save();

  return res
    .status(200)
    .json(new ApiResponse(200, address, 'Address updated successfully.'));
});

// 4. Delete Address
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await Address.findById(id);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  if (address.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this address.');
  }

  const wasDefault = address.isDefault;
  await Address.findByIdAndDelete(id);

  // If we deleted the default address, auto-promote the most recently created remaining address
  if (wasDefault) {
    const nextAddress = await Address.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Address deleted successfully.'));
});

// 5. Set Address as Default
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const address = await Address.findById(id);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  if (address.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this address.');
  }

  address.isDefault = true;
  await address.save();

  return res
    .status(200)
    .json(new ApiResponse(200, address, 'Default address updated successfully.'));
});
