describe('AuthModule', () => {
  it('should redirect to auth page if not signed in', () => {
    cy.visit('/');
    cy.url().should('includes', 'auth');
  });
});
