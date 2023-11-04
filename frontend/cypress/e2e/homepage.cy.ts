/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Homepage', () => {

  beforeEach(() => {
    // Visit the homepage before each test case
    cy.visit('/');
  });

  it('loads the homepage', () => {
    // Check if the title is correct
    cy.title().should('eq', 'Login - Carriage');

    // Check if Carriage logo is present
    cy.get('img[alt="Carriage logo"]').should('be.visible');
  });

  it('displays admin and student login containers', () => {
    // Check for student login container
    cy.get('.styles.container_item_left').within(() => {
      cy.contains('Login with Google').should('be.visible');
    });

    // Check for admin login container
    cy.get('.styles.container_item_right').within(() => {
      cy.contains('Login with Google').should('be.visible');
    });
  });

  // Accessibility check using cypress-axe
  it('has no detectable a11y violations on load', () => {
    cy.injectAxe();  // Ensure you've installed cypress-axe to use this
    cy.checkA11y();
  });

  it('navigates to admin home on admin login', () => {
    cy.get('.styles.container_item_right').within(() => {
      cy.contains('Login with Google').click();
      // Mocking the GoogleAuth response and checking for redirect can be done here
    });
  });

  it('navigates to student home on student login', () => {
    cy.get('.styles.container_item_left').within(() => {
      cy.contains('Login with Google').click();
      // Mocking the GoogleAuth response and checking for redirect can be done here
    });
  });
});