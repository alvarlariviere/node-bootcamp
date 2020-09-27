const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getName = Model => {
  return Model.modelName.toLowerCase();
};

exports.getAll = (Model, foreignData = { foreignModel: null, foreignField: null }) =>
  catchAsync(async (req, res, next) => {
    const { foreignModel, foreignField } = foreignData;
    const filter = req.params[foreignField] ? { [foreignModel]: req.params[foreignField] } : {}; // from nested route
    const features = new ApiFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(200).json({ status: 'success', results: docs.length, data: { [`${getName(Model)}s`]: docs } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = popOptions ? Model.findById(req.params.id).populate(popOptions) : Model.findById(req.params.id);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`No ${getName(Model)} found with that ID.`, 404));
    }

    res.status(200).json({ status: 'success', data: { [getName(Model)]: doc } });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { [getName(Model)]: doc } });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No ${getName(Model)} found witht that ID.`, 404));
    }

    res.status(200).json({ status: 'success', data: { [getName(Model)]: doc } });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No ${getName(Model)} found with that ID.`, 404));
    }

    res.status(204).json({ status: 'success', data: null });
  });
