const { Plugin, TFile } = require('obsidian');

class BoardGameFetcherPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'update-boardgames',
            name: 'Update Board Games',
            callback: () => this.updateBoardGames()
        });
    }

    async updateBoardGames() {
        const response = await fetch('https://api.geekdo.com/xmlapi2/collection?username=wayne79687968&stats=true');
        const text = await response.text();

        // Parse the XML data
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Get the list of current board game notes
        const currentNotes = this.app.vault.getFiles().filter(file => file.path.startsWith('Inbox/Boardgame/')).map(file => file.basename);

        // For each board game in the XML data, create or update a note
        const boardGames = Array.from(xmlDoc.querySelectorAll('item'));
        for (const item of boardGames) {
            const nameElement = item.querySelector('name');
            const yearPublishedElement = item.querySelector('yearpublished');
            const imageElement = item.querySelector('image');
            const statsElement = item.querySelector('stats');
            const statusElement = item.querySelector('status');

            let content = '';

            const name = nameElement.textContent;
            const yearPublished = yearPublishedElement ? yearPublishedElement.textContent : '';
            const image = imageElement ? imageElement.textContent : '';
            const minPlayers = statsElement ? statsElement.getAttribute('minplayers') : '';
            const maxPlayers = statsElement ? statsElement.getAttribute('maxplayers') : '';
            const minPlaytime = statsElement ? statsElement.getAttribute('minplaytime') : '';
            const maxPlaytime = statsElement ? statsElement.getAttribute('maxplaytime') : '';
            const playingTime = statsElement ? statsElement.getAttribute('playingtime') : '';
            const own = statusElement ? (statusElement.getAttribute('own') === '1' ? 'yes' : 'no') : 'no';
            const prevOwned = statusElement ? (statusElement.getAttribute('prevowned') === '1' ? 'yes' : 'no') : 'no';
            const forTrade = statusElement ? (statusElement.getAttribute('fortrade') === '1' ? 'yes' : 'no') : 'no';

            content = `---
title: ${name}
yearpublished: ${yearPublished}
image: ${image}
minplayers: ${minPlayers}
maxplayers: ${maxPlayers}
minplaytime: ${minPlaytime}
maxplaytime: ${maxPlaytime}
playingtime: ${playingTime}
own: ${own}
prevowned: ${prevOwned}
fortrade: ${forTrade}
---
`;
            if (name) {
                console.log(content);
            }
        }
    }
}

module.exports = BoardGameFetcherPlugin;