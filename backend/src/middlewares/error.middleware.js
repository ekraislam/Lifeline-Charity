const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ message });
};

module.exports = errorHandler;
