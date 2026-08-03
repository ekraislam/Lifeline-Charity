const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Allow-Origin, X-Forwarded-For, X-CSRF-Token');
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ message });
};

module.exports = errorHandler;
