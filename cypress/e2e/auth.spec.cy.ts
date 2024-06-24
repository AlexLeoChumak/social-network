describe('AuthModule', () => {
  it('should redirect to auth page if not signed in', () => {
    cy.visit('/');
    cy.url().should('includes', 'auth');
  });

  it('should have a disabled sign in button', () => {
    cy.get('ion-button')
      .should('contain', 'Sign in')
      .should('have.attr', 'disabled');
  });
});
