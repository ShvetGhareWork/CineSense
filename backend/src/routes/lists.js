const express = require('express');
const router = express.Router();
const listsController = require('../controllers/listsController');

// User's lists
router.get('/', listsController.getLists);
router.post('/', listsController.createList);
router.get('/:id', listsController.getList);
router.put('/:id', listsController.updateList);
router.delete('/:id', listsController.deleteList);

// List items
router.post('/:id/items', listsController.addItemToList);
router.delete('/:id/items/:itemId', listsController.removeItemFromList);

// Community lists
router.get('/community/all', listsController.getCommunityLists);
router.post('/:id/follow', listsController.followList);

module.exports = router;
