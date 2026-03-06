import express from 'express';
import { prisma } from '../../lib/prisma';
import { Tag } from '../models/location';
import { validateUser } from '../util';

const router = express.Router();

/**
 * Get a location by ID
 */
router.get('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({ where: { id } });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Get all locations or filtered by query
 */
router.get('/', validateUser('User'), async (req, res) => {
  try {
    const { active } = req.query;

    const where: any = {};

    if (active !== undefined) {
      if (active === 'true') {
        where.NOT = { tag: { in: [Tag.INACTIVE, Tag.CUSTOM] } };
      } else {
        where.tag = Tag.INACTIVE;
      }
    }

    const locations = await prisma.location.findMany({ where });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Create a new location (Admin only)
 */
router.post('/', validateUser('Admin'), async (req, res) => {
  try {
    const { body } = req;
    const location = await prisma.location.create({
      data: body,
    });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Create a custom location (User allowed)
 */
router.post('/custom', validateUser('User'), async (req, res) => {
  try {
    const { body } = req;
    const location = await prisma.location.create({
      data: {
        ...body,
        tag: Tag.CUSTOM,
      },
    });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Update a location by ID (Admin only)
 */
router.put('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const updated = await prisma.location.update({
      where: { id },
      data: body,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Delete a location by ID (Admin only)
 */
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;