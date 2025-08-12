describe('stock check', () => {
    it('Checks all colour + storage combinations and sends results once', () => {
      let results = [];
      const targetUrl = Cypress.env('TARGET_URL');
  
      cy.visit(targetUrl);
  
      // Accept essential cookies if shown
      cy.contains('button', /accept essential cookies only/i, { timeout: 10000 })
        .should('be.visible')
        .click({ force: true });
  
      cy.get('#device-colour-select').then(colourSelect => {
        const colours = [...colourSelect.find('option')]
          .filter(opt => opt.value && !opt.disabled)
          .map(opt => opt.textContent.trim());
  
        cy.get('#device-storage-select').then(storageSelect => {
          const storages = [...storageSelect.find('option')]
            .filter(opt => opt.value && !opt.disabled)
            .map(opt => opt.textContent.trim());
  
          cy.wrap(colours).each((colour) => {
            cy.get('#device-colour-select').select(colour);
  
            cy.wrap(storages).each((storage) => {
              if (storage.includes('128GB')) {
                cy.get('#device-storage-select').select(storage);
  
                results.push({ colour, storage });
                cy.log(`${colour} ${storage}`);
              }
            });
          }).then(() => {
            if (results.length > 0) {
              const formattedResults = results
                .map(item => `Colour: ${item.colour}, Storage: ${item.storage}`)
                .join('\n');
  
              cy.task('sendWebhook', formattedResults).then(() => {
                cy.log('Results sent to webhook');
              });
            }
          });
        });
      });
    });
  });
  