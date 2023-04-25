import express from 'express';

// Basic Data: Appropriate Admin
export const AdminRequest1 = {
  firstName: 'Endpoint-Test',
  lastName: 'Admin',
  phoneNumber: '0000000000',
  email: 'adminEndpointTest@example.com',
  photoLink: 'random-link',
};

//Admin with Fixed ID
export const AdminFixedID = {
  firstName: 'Endpoint-Test-Fixed-ID',
  lastName: 'Admin',
  phoneNumber: '0000000000',
  email: 'adminEndpointTest@example.com',
  photoLink: 'random-link',
  id: 1,
};

//Admin with Missing Data
export const AdminMissingData = {
  lastName: 'Admin',
  phoneNumber: '0000000000',
  email: 'adminEndpointTest@example.com',
  photoLink: 'random-link',
};
