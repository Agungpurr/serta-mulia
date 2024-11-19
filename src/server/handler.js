const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
  try {
    // Mengambil gambar dari payload dan model dari server
    const { image } = request.payload;
    const { model } = request.server.app;

    // Melakukan prediksi menggunakan fungsi predictClassification
    const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);

    // Membuat ID unik untuk data prediksi
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Data prediksi yang dihasilkan
    const data = {
      id,
      result: label,
      explanation,
      suggestion,
      confidenceScore,
      createdAt,
    };

    // Menyimpan data prediksi ke storage menggunakan storeData
    await storeData(id, data);

    // Membuat respons sukses
    const response = h.response({
      status: 'success',
      message: confidenceScore > 99
        ? 'Model is predicted successfully.'
        : 'Model is predicted successfully but under threshold. Please use the correct picture',
      data,
    });
    response.code(201);
    return response;

  } catch (error) {
    // Menangani kesalahan yang terjadi
    console.error('Error in postPredictHandler:', error);

    // Membuat respons kesalahan
    const response = h.response({
      status: 'fail',
      message: `An error occurred: ${error.message}`,
    });
    response.code(500); // Status kode untuk error internal server
    return response;
  }
}

module.exports = postPredictHandler;
