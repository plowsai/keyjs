const lib = {
    generateToken: (pass) => {
        const token = jwt.sign({ pass }, secretKey, { expiresIn: '1h' });
        return token;
    }
}

module.exports = lib;