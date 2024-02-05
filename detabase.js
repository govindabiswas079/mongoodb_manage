import mongoose from "mongoose";

const environment = process.env.NODE_ENV || 'development';
export const DATABASE = async () => {
    mongoose.set('strictQuery', true)
    const db = await mongoose.connect((environment === 'development') ? process?.env?.COMPASS_URI : process?.env?.ATLAS_URI); // environment ? process?.env?.COMPASS_URI : process?.env?.ATLAS_URI
    return db;
}