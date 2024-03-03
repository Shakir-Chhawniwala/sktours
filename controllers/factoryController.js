const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
