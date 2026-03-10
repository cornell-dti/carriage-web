import express from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/prisma';
import { LocationTag } from '@prisma/client';
import { validateUser } from '../util';

const router = express.Router();

// Get a location by id
router.get('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({ where: { id } });
    if (!location) {
      return res.status(400).send({ err: 'id not found in Locations' });
    }
    res.status(200).json({ data: location });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).send({ err: 'Failed to fetch location' });
  }
});

// Get and query all locations
router.get('/', validateUser('User'), async (req, res) => {
  try {
    const { active } = req.query;

    let where = {};
    if (active === 'true') {
      where = {
        tag: { notIn: [LocationTag.INACTIVE, LocationTag.CUSTOM] },
      };
    } else if (active === 'false') {
      where = { tag: LocationTag.INACTIVE };
    }

    const locations = await prisma.location.findMany({ where });
    res.status(200).send({ data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send({ err: 'Failed to fetch locations' });
  }
});

// Create a location
router.post('/', validateUser('Admin'), async (req, res) => {
  try {
    const { body } = req;
    const location = await prisma.location.create({
      data: { ...body, id: uuid(), tag: body.tag?.toUpperCase() as LocationTag },
    });
    res.status(200).send({ data: location });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).send({ err: 'Failed to create location' });
  }
});

// Create a custom location (riders)
router.post('/custom', validateUser('User'), async (req, res) => {
  try {
    const { body } = req;
    const location = await prisma.location.create({
      data: { ...body, id: uuid(), tag: LocationTag.CUSTOM },
    });
    res.status(200).send({ data: location });
  } catch (error) {
    console.error('Error creating custom location:', error);
    res.status(500).send({ err: 'Failed to create custom location' });
  }
});

// Update an existing location
router.put('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.update({
      where: { id },
      data: {...req.body, tag: req.body.tag?.toUpperCase() as LocationTag},
    });
    res.status(200).send({ data: location });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Locations' });
    }
    console.error('Error updating location:', error);
    res.status(500).send({ err: 'Failed to update location' });
  }
});

// Delete an existing location
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id } });
    res.status(200).send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Locations' });
    }
    console.error('Error deleting location:', error);
    res.status(500).send({ err: 'Failed to delete location' });
  }
});

export default router;
