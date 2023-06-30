const { Plugin, TFile, Notice, Setting, PluginSettingTab } = require('obsidian');

class BoardGameFetcherPlugin extends Plugin {
    settings = {};

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'update-boardgames',
            name: 'Update Board Games',
            callback: () => this.updateBoardGames()
        });

        this.addSettingTab(new BoardGameFetcherSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async updateBoardGames() {
        new Notice('Board game update started.');

        const response = await fetch('https://api.geekdo.com/xmlapi2/collection?username=' + this.settings.username + '&stats=1');
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
            const sanitized_name = name.replace(/[\\/*"<>:|?]/g, '')
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

            content = `title:: ${sanitized_name}
yearpublished:: ${yearPublished}
image:: ${image}
minplayers:: ${minPlayers}
maxplayers:: ${maxPlayers}
minplaytime:: ${minPlaytime}
maxplaytime:: ${maxPlaytime}
playingtime:: ${playingTime}
own:: ${own}
prevowned:: ${prevOwned}
fortrade:: ${forTrade}
`;

            const id = item.getAttribute('objectid');
            if (id) {
                let retryCount = 0;
                let gameText = "";
                while (retryCount < 5) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        const gameResponse = await fetch('https://api.geekdo.com/xmlapi2/thing?id=' + id + '&stats=1');
                        gameText = await gameResponse.text();
                        break;
                    } catch (error) {
                        retryCount++;
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                }
                if (retryCount >= 5) {
                    new Notice('Failed to update board game: ' + id);
                    continue;
                }
                const gameDoc = parser.parseFromString(gameText, 'text/xml');
                const designers = Array.from(gameDoc.querySelectorAll('link[type="boardgamedesigner"]')).map(link => '"' + link.getAttribute('value') + '"').join(', ') ? ? '';
                const artists = Array.from(gameDoc.querySelectorAll('link[type="boardgameartist"]')).map(link => '"' + link.getAttribute('value') + '"').join(', ') ? ? '';
                const rank = gameDoc.querySelector('rank[type="subtype"]').getAttribute('value') ? ? '';
                const weight = gameDoc.querySelector('averageweight').getAttribute('value') ? ? '';
                const score = gameDoc.querySelector('average').getAttribute('value') ? ? '';
                content += `designers:: ${designers}
artists:: ${artists}
rank:: ${rank}
weight:: ${weight}
score:: ${score}`;

            }

            if (sanitized_name) {
                // Create or update the note
                const notePath = this.settings.notePath + '/' + sanitized_name + '.md';
                console.log(content);

                let file = this.app.vault.getAbstractFileByPath(notePath);
                if (file instanceof TFile) {
                    await this.app.vault.modify(file, content);
                } else {
                    await this.app.vault.create(notePath, content);
                }

                // Remove the note from the list of current notes
                const index = currentNotes.indexOf(sanitized_name);
                if (index !== -1) {
                    currentNotes.splice(index, 1);
                }
            }
        }

        // Delete any notes that are no longer in the XML data
        for (const noteName of currentNotes) {
            const notePath = `Inbox/Boardgame/${noteName}.md`;
            let file = this.app.vault.getAbstractFileByPath(notePath);
            if (file instanceof TFile) {
                await this.app.vault.delete(file);
            }
        }

        new Notice('Board game update completed.');
    }
}

class BoardGameFetcherSettingTab extends PluginSettingTab {
    plugin;

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('BoardGameGeek Username')
            .setDesc('Enter your BoardGameGeek username.')
            .addText(text => text
                .setPlaceholder('Enter your username')
                .setValue(this.plugin.settings.username || '')
                .onChange(async(value) => {
                    this.plugin.settings.username = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Note Path')
            .setDesc('Enter the path where the notes should be saved.')
            .addText(text => text
                .setPlaceholder('Enter note path')
                .setValue(this.plugin.settings.notePath || '')
                .onChange(async(value) => {
                    this.plugin.settings.notePath = value;
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = BoardGameFetcherPlugin;