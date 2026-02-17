export const queryString = (model, populate) => async (req, res, next) => {
    try {
        const { page = 1, limit = 10, select, sort, ...filters } = req.query;
        // Filter
        let queryStr = JSON.stringify(filters);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            match => `$${match}`
        );
        const mFilters = JSON.parse(queryStr);        

        let query = model.find(mFilters);
        // Select
        if (select)
            query = query.select(select.split(",").join(" "));
        // Sort
        if (sort)
            query = query.sort(sort.split(",").join(" "));
        // Pagination
        query = query
            .skip((page - 1) * limit)
            .limit(Number(limit));
        if (populate)
            query = query.populate(populate);
        const results = await query;
        res.results = {
            success: true,
            count: results.length,
            data: results,
        };
        next();
    } catch (err) {
        next(err);
    }
};