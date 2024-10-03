const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URl = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URl);
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    //map function returns new array
    //accessing the obj and addding new field
    ...obj,
    owner: "66dee5fbbc86b325c5ad1cc4",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

initDB();
