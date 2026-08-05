import { Request, Response } from 'express';
import * as collectionService from '../services/CollectionService';

export const createCollection = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const collection = await collectionService.createCollection(data);
        res.status(201).json({ success: true, data: collection });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAllCollections = async (req: Request, res: Response): Promise<void> => {
    try {
        const collections = await collectionService.getAllCollections();
        res.status(200).json({ success: true, data: collections });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCollectionBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = await collectionService.getCollectionBySlug(req.params.slug as string);
        if (!collection) {
            res.status(404).json({ success: false, message: 'Collection not found' });
            return;
        }
        res.status(200).json({ success: true, data: collection });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
    try {
        const collection = await collectionService.updateCollection(req.params.id as string, req.body);
        res.status(200).json({ success: true, data: collection });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
    try {
        await collectionService.deleteCollection(req.params.id as string);
        res.status(200).json({ success: true, message: 'Collection deleted' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
