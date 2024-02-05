import mongoose from "mongoose";

const typetags = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, default: null },
    description: { type: mongoose.Schema.Types.String, default: null },
    createdAt: { type: mongoose.Schema.Types.Date, default: Date.now() },
    updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now() },
    type: { type: mongoose.Schema.Types.String, default: 'tags' },
});

export default mongoose.model.typetags || mongoose.model('typetags', typetags);