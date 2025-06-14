const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DEVELOPER_IDS = [
    '850022237531668500',
    '579877252641325095',
    '1089577939080847360'
];

const DATA_PATH = path.join(__dirname, 'data', 'discord-presence.json');

function savePresenceData(data) {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Presence verisi kaydedilemedi:', err);
    }
}

class DiscordPresenceBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMembers
            ]
        });
        this.presenceData = {};
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.updateAllPresences();
            setInterval(() => this.updateAllPresences(), 1000);
        });

        this.client.on('presenceUpdate', (oldPresence, newPresence) => {
            if (newPresence.member && DEVELOPER_IDS.includes(newPresence.member.id)) {
                this.updatePresence(newPresence.member);
            }
        });
    }

    updateAllPresences() {
        this.client.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(member => {
                if (DEVELOPER_IDS.includes(member.id)) {
                    this.updatePresence(member);
                }
            });
        });
        savePresenceData(this.presenceData);
    }

    updatePresence(member) {
        const presence = member.presence;
        if (!presence) return;
        const activities = presence.activities;
        const presenceInfo = {
            id: member.id,
            username: member.user.username,
            display_name: member.displayName,
            avatar: member.user.displayAvatarURL ? member.user.displayAvatarURL() : null,
            status: presence.status,
            activity: null,
            spotify: null,
            game: null,
            last_updated: new Date().toISOString()
        };
        activities.forEach(activity => {
            if (activity.type === 4) return;
            if (activity.name === 'Spotify') {
                const timestamps = activity.timestamps;
                const startTime = timestamps?.start ? timestamps.start.getTime() : null;
                const endTime = timestamps?.end ? timestamps.end.getTime() : null;
                const duration = (startTime && endTime) ? (endTime - startTime) / 1000 : null;
                const now = Date.now();
                const current = startTime ? Math.floor((now - startTime) / 1000) : null;
                presenceInfo.spotify = {
                    track: activity.details,
                    artist: activity.state,
                    album: activity.assets?.largeText,
                    url: activity.syncId ? `https://open.spotify.com/track/${activity.syncId}` : null,
                    albumArt: activity.assets?.largeImageURL(),
                    duration: duration,
                    start: startTime,
                    current: current
                };
            } else if (activity.type === ActivityType.Playing) {
                presenceInfo.game = {
                    name: activity.name,
                    type: 'playing'
                };
            } else {
                presenceInfo.activity = {
                    name: activity.name,
                    type: activity.type,
                    details: activity.details,
                    state: activity.state,
                    url: activity.url,
                    application_id: activity.applicationId
                };
            }
        });
        this.presenceData[member.id] = presenceInfo;
        savePresenceData(this.presenceData);
    }

    start() {
        this.client.login(process.env.DISCORD_TOKEN).catch(err => {
            console.error('Discord bot login hatası:', err);
        });
    }
}

// data klasörü yoksa oluştur
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

const bot = new DiscordPresenceBot();
bot.start(); 