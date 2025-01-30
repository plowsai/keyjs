
const pass = "1234567890"

const token = jwt.sign({ pass }, secretKey, { expiresIn: '1h' });
