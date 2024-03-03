const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOne = Model => {
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: document
    });
  });
};

exports.getOne = (Model, options) => {
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const query = Model.findById(id);
    if (options) {
      query.populate(options);
    }
    const document = await query;
    if (!document) {
      return new AppError('Cannot delete the requested document', 404);
    }
    res.status(200).json({
      status: 'success',
      data: document
    });
  });
};

exports.updateOne = Model => {
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.body.params, req.body, {
      new: true,
      runValidators: true
    });
    if (!document) {
      return new AppError('Cannot delete the requested document', 404);
    }
    res.status(200).json({
      status: 'success',
      data: document
    });
  });
};

exports.deleteOne = Model => {
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return new AppError('Cannot delete the requested document', 404);
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
};
