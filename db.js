const mongoose = require('mongoose');
const { mainModel } = require("./models/post");
require("dotenv").config();
const uri = process.env.MONGODBURI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
}).then(async () => {
  // Ambil semua entri dari database
  const data = await mainModel.find();

  // Loop melalui setiap entri
  data.forEach(async (entry) => {
    // Periksa apakah properti "Edit" tidak ada
    if (!entry.hasOwnProperty('Edit')) {
      // Jika tidak ada, tambahkan properti "Edit" dengan nilai default "tidak ada waktu"
      entry.Edit = "tidak ada waktu";
      // Simpan perubahan ke database
      console.log(entry);
            await mainModel.findByIdAndUpdate(entry._id, { $set: { Edit: entry.Edit } });
    }
  });

}).catch(err => {
  console.error('Kesalahan koneksi MongoDB:', err.message);
});

