import { Router } from 'express';
import * as collectionController from '../controllers/CollectionController';

const router = Router();

router.post('/', collectionController.createCollection);
router.get('/', collectionController.getAllCollections);
router.get('/:slug', collectionController.getCollectionBySlug);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

export default router;
