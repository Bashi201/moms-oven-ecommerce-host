const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper: create safe folder name from cake name
function createFolderName(name, cakeId) {
  // Remove special chars, spaces → hyphen, lowercase
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')          // non-alphanum → -
    .replace(/(^-|-$)/g, '');             // remove leading/trailing -

  if (!slug) slug = 'cake';               // fallback

  return `${slug}-${cakeId}`;             // e.g. chocolate-fantasy-7
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // For new cake → we don't know cakeId yet → temporary folder
    // We'll move files after cake is created
    const tempPath = path.join('public', 'uploads', 'temp');
    
    // Create temp folder if not exists
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    
    cb(null, tempPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpg, jpeg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: fileFilter
});

const uploadMultiple = upload.array('images', 4);

module.exports = { uploadMultiple };