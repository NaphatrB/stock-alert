const axios = require('axios');
const qs = require('qs'); // to build URL-encoded strings
const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            on('before:browser:launch', (browser = {}, launchOptions) => {
                if (browser.name === 'electron') {
                    launchOptions.args.push('--ignore-certificate-errors');
                    return launchOptions;
                }
                // For other browsers you can add flags similarly
                return launchOptions;
            });
            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                },

                sendWebhook(message) {
                    console.log('message', message)
                    const data = {
                        payload: JSON.stringify({ text: message })
                    };

                    console.log(qs.stringify(data));

                    return axios.post(process.env.WEBHOOK_URL, qs.stringify(data), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                        .then(response => {
                            console.log('webhook sent, status:', response.status);
                            return null;
                        })
                        .catch(error => {
                            console.error('webhook send failed:', error.message);
                            throw error;
                        });


                },
            });


        },
    },
});
