import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import logger from '../utils/logger.js';

// @desc    Search medicines with availability
export const searchMedicines = async (req, res, next) => {
  try {
    const { q, category, location, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = { isActive: true };
    
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    // Find medicines
    const medicines = await Medicine.find(searchQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    // Get inventory data for each medicine
    const medicinesWithInventory = await Promise.all(
      medicines.map(async (medicine) => {
        const inventoryItems = await Inventory.find({ 
          medicine: medicine._id,
          availableStock: { $gt: 0 }
        })
        .populate('pharmacy', 'name pharmacyDetails location')
        .sort({ price: 1 });

        return {
          ...medicine.toObject(),
          availability: inventoryItems.map(item => ({
            pharmacy: {
              id: item.pharmacy._id,
              name: item.pharmacy.pharmacyDetails?.pharmacyName || item.pharmacy.name,
              location: item.pharmacy.location,
              address: item.pharmacy.pharmacyDetails?.address
            },
            stock: item.availableStock,
            price: item.price,
            status: item.status
          }))
        };
      })
    );

    const total = await Medicine.countDocuments(searchQuery);

    paginatedResponse(res, medicinesWithInventory, {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      total
    }, 'Medicines retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine by ID
export const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    // Get inventory data
    const inventoryItems = await Inventory.find({ 
      medicine: medicine._id 
    })
    .populate('pharmacy', 'name pharmacyDetails location')
    .sort({ price: 1 });

    const medicineWithInventory = {
      ...medicine.toObject(),
      availability: inventoryItems.map(item => ({
        pharmacy: {
          id: item.pharmacy._id,
          name: item.pharmacy.pharmacyDetails?.pharmacyName || item.pharmacy.name,
          location: item.pharmacy.location,
          address: item.pharmacy.pharmacyDetails?.address
        },
        stock: item.availableStock,
        price: item.price,
        status: item.status
      }))
    };

    successResponse(res, medicineWithInventory, 'Medicine retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Create new medicine
export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);

    logger.info(`New medicine created: ${medicine.name} by admin: ${req.user.email}`);
    successResponse(res, medicine, 'Medicine created successfully', 201);

  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    successResponse(res, medicine, 'Medicine updated successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine (soft delete)
export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!medicine) {
      return errorResponse(res, 'Medicine not found', 404);
    }

    successResponse(res, null, 'Medicine deactivated successfully');

  } catch (error) {
    next(error);
  }
};

// @desc    Get all medicines
export const getAllMedicines = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (category) query.category = category;

    const medicines = await Medicine.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Medicine.countDocuments(query);

    paginatedResponse(res, medicines, {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      total
    }, 'Medicines retrieved successfully');

  } catch (error) {
    next(error);
  }
};
