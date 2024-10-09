const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

//call main function
main().then((result) => {
    console.log("connected to database");
}).catch((err) => {
    console.error(err);
});
//database connection
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "65ff22e57728b0af6fb483b2" ,
}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized in db");

}
initDB();