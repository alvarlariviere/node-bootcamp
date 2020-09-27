const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkId = (req, res, next, val) => {
  if (val > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  if (req.method === 'PATCH') {
    if (req.body.id && req.body.id !== val) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID in the body is not matching ID in the URL',
      });
    }
    delete req.body.id;
  }

  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

exports.checkParamNumber = (req, res, next) => {
  if (Object.keys(req.body).length > 1) {
    return res.status(400).json({ status: 'fail', message: 'Too many parameters' });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  res.status(200).json({ status: 'success', data: { tour } });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), () => {
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tourIndex = tours.findIndex(el => el.id === id);

  tours[tourIndex] = { ...tours[tourIndex], ...req.body };

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), () => {
    res.status(200).json({ status: 'success', data: { tour: tours[tourIndex] } });
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tourIndex = tours.findIndex(el => el.id === id);

  delete tours[tourIndex];

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), () => {
    res.status(204).json({ status: 'success', data: null });
  });
};
