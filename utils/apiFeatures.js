class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // const queryObj = { ...this.queryString };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);
    const { page, sort, limit, fields, ...queryObj } = this.queryString; // eslint-disable-line no-unused-vars

    const queryStr = JSON.stringify(queryObj).replace(/\b(eq|gt|gte|in|lt|lte|ne|nin)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // const excludedFields = ['-__v'].join(' ');

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      // if (!fields.includes('-')) {
      this.query = this.query.select(fields);
      // } else {
      //   this.query = this.query.select(`${excludedFields} ${fields}`);
      // }
    }
    // else {
    //   this.query = this.query.select(excludedFields);
    // }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
