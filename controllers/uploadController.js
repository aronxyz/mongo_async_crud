const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const customFileName = req.body.fileName || `default-name-${Date.now()}`;
    cb(null, `${customFileName}`);
  }
});

const upload = multer({ storage });
const uploadMiddleware = upload.single('image');

const uploadFile = (req, res) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).send({ message: err.message });
    }

    console.log('File Information:', req.file);

    res.status(200).json({ message: 'File uploaded successfully.', file: req.file });
  });
};

module.exports = {
  uploadFile,
};