import mongoose from "mongoose";


const DetailsSchema = new mongoose.Schema({
    name: {type: String},
    logo: {type: String, require: true},
    email: {type: String, require:true},
    contactNumber: {type: Number, require: true},
    address: {type: String, require: true}

},{
    timestamps: true
})


export const Details = mongoose.model("Details", DetailsSchema)
