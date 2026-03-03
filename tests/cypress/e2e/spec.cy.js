describe('Task Priority Filter', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => win.localStorage.clear());
  });

  it('Shows only tasks of selected priority', () => {
    // Luo kolme tehtävää eri prioriteeteilla
    cy.get('#topic').type('High Task');
    cy.get('#priority').select('high');
    cy.get('#task-form').submit();

    cy.get('#topic').type('Medium Task');
    cy.get('#priority').select('medium');
    cy.get('#task-form').submit();

    cy.get('#topic').type('Low Task');
    cy.get('#priority').select('low');
    cy.get('#task-form').submit();

    // Suodata high-priority
    cy.contains('button', 'High').click();
    cy.get('.task').should('have.length', 1);
    cy.contains('.task', 'High Task').should('exist');

    // Suodata medium-priority
    cy.contains('button', 'Medium').click();
    cy.get('.task').should('have.length', 1);
    cy.contains('.task', 'Medium Task').should('exist');

    // Suodata low-priority
    cy.contains('button', 'Low').click();
    cy.get('.task').should('have.length', 1);
    cy.contains('.task', 'Low Task').should('exist');

    // Näytä kaikki
    cy.contains('button', 'Show All').click();
    cy.get('.task').should('have.length', 3);
  });
});
