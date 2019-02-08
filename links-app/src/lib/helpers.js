const helpers = {};
const bcrypt = require('bcryptjs');

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const passwordEncrypted = await bcrypt.hash(password, salt);
    return passwordEncrypted;
};

helpers.matchPassword = async(password, savedPassword) => {
    try{
        const asd = await bcrypt.compare(password,savedPassword);
    }catch (e){
        //TODO: mandar msj con flash
        console.log(e);
    }

};

module.exports = helpers;