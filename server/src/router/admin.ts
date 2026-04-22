import express from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/prisma';
import { AdminRole } from '../../generated/prisma/client';
import {
  validateUser,
  checkRiderEmailExists,
  checkNetIDExistsForOtherEmployee,
} from '../util';

const router = express.Router();

// Get an admin by id
router.get('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(400).send({ err: 'id not found in Employees' });
    }
    res.status(200).json({ data: employee });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).send({ err: 'Failed to fetch admin' });
  }
});

// Get all admins
router.get('/', validateUser('Admin'), async (req, res) => {
  try {
    const admins = await prisma.employee.findMany({ where: { isAdmin: true } });
    res.status(200).send({ data: admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send({ err: 'Failed to fetch admins' });
  }
});

// Create or promote an employee to admin
router.post('/', validateUser('Admin'), async (req, res) => {
  try {
    const { body } = req;

    const riderExists = await checkRiderEmailExists(body.email);
    if (riderExists) {
      return res.status(409).send({
        err: 'A rider with this NetID already exists',
      });
    }

    const adminRoles = normalizeRoles(body.adminRoles || body.type || body.roles);

    // Upsert: if employee already exists (e.g. was a driver), promote them to admin
    const existing = await prisma.employee.findUnique({
      where: { email: body.email },
    });

    let employee;
    if (existing) {
      employee = await prisma.employee.update({
        where: { id: existing.id },
        data: {
          firstName: body.firstName ?? existing.firstName,
          lastName: body.lastName ?? existing.lastName,
          phoneNumber: body.phoneNumber ?? existing.phoneNumber,
          photoLink: body.photoLink ?? existing.photoLink,
          isAdmin: true,
          adminRoles: adminRoles as AdminRole[],
        },
      });
    } else {
      const id = (!body.eid || body.eid === '') ? uuid() : body.eid;
      employee = await prisma.employee.create({
        data: {
          id,
          firstName: body.firstName,
          lastName: body.lastName,
          adminRoles: adminRoles as AdminRole[],
          isAdmin: true,
          isDriver: body.isDriver || false,
          phoneNumber: body.phoneNumber,
          email: body.email,
          photoLink: body.photoLink || null,
        },
      });
    }

    res.status(200).send({ data: employee });
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
          err: 'An employee with this NetID already exists',
        });
      }
    }

    if (body.adminRoles || body.type || body.roles) {
      body.adminRoles = normalizeRoles(
        body.adminRoles || body.type || body.roles
      ) as AdminRole[];
      delete body.type;
      delete body.roles;
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: body,
    });

    res.status(200).send({ data: employee });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Employees' });
    }
    console.error('Error updating admin:', error);
    res.status(500).send({ err: 'Failed to update admin' });
  }
});

// Remove admin role; deletes record entirely if not also a driver
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(400).send({ err: 'id not found in Employees' });
    }

    if (employee.isDriver) {
      await prisma.employee.update({
        where: { id },
        data: { isAdmin: false, adminRoles: [] },
      });
    } else {
      await prisma.employee.delete({ where: { id } });
    }

    res.status(200).send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Employees' });
    }
    console.error('Error deleting admin:', error);
    res.status(500).send({ err: 'Failed to delete admin' });
  }
});

function normalizeRoles(input: any): string[] {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr
    .map((r: string) => r.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_'))
    .filter((r: string) => r === 'SDS_ADMIN' || r === 'REDRUNNER_ADMIN');
}

export default router;
