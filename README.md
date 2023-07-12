# Board Game Fetcher Plugin

The Board Game Fetcher Plugin is an Obsidian plugin that allows you to fetch and update information about board games from BoardGameGeek. It creates or updates notes for each board game in your collection, including details such as the game's name, year of publication, image, player count, playtime, ownership status, and more.

## Installation

1. Download the `BoardGameFetcherPlugin` folder and place it in your Obsidian vault's plugins directory.
2. Enable the "Board Game Fetcher Plugin" in the Obsidian settings.

## Usage

### Setting up the Plugin

1. Open the Obsidian settings and navigate to the "Community Plugins" tab.
2. Enable the "Board Game Fetcher Plugin".
3. Navigate to the "Board Game Fetcher" tab in the settings sidebar.

### Configuring Plugin Settings

1. In the "BoardGameGeek Username" field, enter your BoardGameGeek username. This will be used to fetch your board game collection information.
2. In the "Note Path" field, enter the path where you want the board game notes to be saved. For example, if you enter `Inbox/Boardgame`, the plugin will create or update notes in the `Inbox/Boardgame` directory.

### Updating Board Games

1. Once you have configured the plugin settings, go to the command palette in Obsidian (keyboard shortcut: Ctrl/Cmd + P).
2. Search for the "Update Board Games" command and select it.
3. The plugin will fetch your board game collection from BoardGameGeek and update the corresponding notes in Obsidian.
4. A notice will appear indicating the start and completion of the update process.

### Board Game Note Format

The plugin creates or updates notes for each board game in the specified note path. The note content follows the following format:

```
title:: [Game Name]
yearpublished:: [Year Published]
image:: [URL of the Game's Image]
minplayers:: [Minimum Number of Players]
maxplayers:: [Maximum Number of Players]
minplaytime:: [Minimum Playtime (in minutes)]
maxplaytime:: [Maximum Playtime (in minutes)]
playingtime:: [Average Playing Time (in minutes)]
own:: [Whether you own the game (yes/no)]
prevowned:: [Whether you previously owned the game (yes/no)]
fortrade:: [Whether the game is available for trade (yes/no)]
designers:: [Designers of the game]
artists:: [Artists of the game]
rank:: [Game's Rank]
weight:: [Game's Weight]
score:: [Game's Average Score]
```

## Support

For support or bug reports, please create an issue on the [GitHub repository](https://github.com/your-repo-link).

## License

This plugin is licensed under the [MIT License](https://opensource.org/licenses/MIT).
