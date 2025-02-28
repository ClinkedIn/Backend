const express = require('express');
const impressionController = require('../controllers/impressionController');

const router = express.Router();

router.route('/')
  .post(impressionController.createImpression);

router.route('/:id')
  .get(impressionController.getAllImpressionsByTargetId)
  .delete(impressionController.deleteImpressionById);

module.exports = router;