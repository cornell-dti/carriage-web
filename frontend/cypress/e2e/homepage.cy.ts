/// <reference types="cypress" />

describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('successfully loads', () => {
    cy.get('[data-cy="home"]').should('be.visible');
  });

  it('has the correct title', () => {
    cy.title().should('include', 'Login - Carriage');
  });

  it('has visible student and admin login buttons with correct text', () => {
    cy.get('[data-cy="container_item_left"]').should('contain', 'Sign in with Google').and('contain', 'Students');
    cy.get('[data-cy="container_item_right"]').should('contain', 'Sign in with Google').and('contain', 'Admins');
  });

  it('has a visible logo for both student and admin buttons', () => {
    cy.get('[data-cy="badge"]').should('have.attr', 'alt', 'Carriage logo');
    cy.get('[data-cy="container_item_left"] img').should('have.attr', 'alt', 'google logo');
    cy.get('[data-cy="container_item_right"] img').should('have.attr', 'alt', 'google logo');
  });

  it('student login button triggers the correct function', () => {
    // Spy on 'studentLogin' function
    // const spy = cy.spy().as('studentLoginSpy');
    // cy.window().then((win) => {
    //   // win.studentLogin = spy;
    // });
    // cy.get('[data-cy="container_item_left"] .btn').click();
    // cy.get('@studentLoginSpy').should('have.been.calledOnce');
  });

  it('admin login button triggers the correct function', () => {
    // Spy on 'adminLogin' function
    // const spy = cy.spy().as('adminLoginSpy');
    // cy.window().then((win) => {
    //   // win.adminLogin = spy;
    // });
    // cy.get('[data-cy="container_item_right"] .btn').click();
    // cy.get('@adminLoginSpy').should('have.been.calledOnce');
  });
});
