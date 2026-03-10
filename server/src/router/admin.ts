import express from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/prisma';
import { AdminRole } from '../../generated/prisma/client';
import { validateUser, checkNetIDExists, checkNetIDExistsForOtherEmployee } from '../util';

const router = express.Router();

// Get an admin
router.get('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      return res.status(400).send({ err: 'id not found in Admins' });
    }
    res.status(200).json({ data: admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).send({ err: 'Failed to fetch admin' });
  }
});

// Get all admins
router.get('/', validateUser('Admin'), async (req, res) => {
  try {
    const admins = await prisma.admin.findMany();
    res.status(200).send({ data: admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send({ err: 'Failed to fetch admins' });
  }
});


// Put a driver in Admins table
router.post('/', validateUser('Admin'), async (req, res) => {
  try {
    const { body } = req;

    const emailExists = await checkNetIDExists(body.email, 'admin');
    if (emailExists) {
      return res.status(409).send({
        err: 'An employee with this NetID already exists'
      });
    }

    const rolesInput = body.type || body.roles || [];
    const roles = Array.isArray(rolesInput)
      ? rolesInput
          .map((r: string) => r.toUpperCase().replace(/\s+/g, '_'))
          .filter((r: string) => r === 'SDS_ADMIN' || r === 'REDRUNNER_ADMIN')
      : [];

    const admin = await prisma.admin.create({
      data: {
        id: !body.eid || body.eid === '' ? uuid() : body.eid,
        firstName: body.firstName,
        lastName: body.lastName,
        roles: roles as AdminRole[],
        isDriver: body.isDriver || false,
        phoneNumber: body.phoneNumber,
        email: body.email,
        photoLink: body.photoLink || null,
      },
    });

    res.status(200).send({ data: admin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).send({ err: 'Failed to create admin' });
  }
});

// Update an existing admin
router.put('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    if (body.email) {
      const emailExists = await checkNetIDExistsForOtherEmployee(body.email, id);
      if (emailExists) {
        return res.status(409).send({
          err: 'An employee with this NetID already exists'
        });
      }
    }

    if (body.type || body.roles) {
      const roles = body.type || body.roles;
      body.roles = Array.isArray(roles) ? roles.map((r: string) => r.toUpperCase() as AdminRole) : roles;
      delete body.type;
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: body,
    });

    res.status(200).send({ data: admin });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Admins' });
    }
    console.error('Error updating admin:', error);
    res.status(500).send({ err: 'Failed to update admin' });
  }
});

// Remove an admin
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.admin.delete({ where: { id } });
    res.status(200).send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Admins' });
    }
    console.error('Error deleting admin:', error);
    res.status(500).send({ err: 'Failed to delete admin' });
  }
});

export default router;
