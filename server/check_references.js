const path = require('path');
const dotenv = require('dotenv');
// Load env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const fs = require('fs');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/counterfeit_detector';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected to:', mongoURI);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const ProductReference = require('./models/ProductReference');

const checkReferences = async () => {
    await connectDB();

    try {
        const references = await ProductReference.find({});
        console.log(`Found ${references.length} references in DB`);

        references.forEach(ref => {
            console.log('------------------------------------------------');
            console.log(`ID: ${ref._id}`);
            console.log(`Product ID: ${ref.product_id}`);
            console.log(`Image Path: '${ref.reference_image_path}'`);

            if (ref.reference_image_path) {
                const absolutePath = path.join(__dirname, ref.reference_image_path);
                const exists = fs.existsSync(absolutePath);
                console.log(`File Exists on Disk: ${exists ? 'YES' : 'NO'}`);
                console.log(`Absolute Path: ${absolutePath}`);
            } else {
                console.log('❌ Image Path is MISSING or NULL');
            }
        });

        const uploadDir = path.join(__dirname, 'uploads/references');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            console.log('\nFiles in uploads/references directory:');
            files.forEach(f => console.log(` - ${f}`));
        } else {
            console.log('\nuploads/references directory does NOT exist');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

checkReferences();
