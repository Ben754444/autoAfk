const { Plugin } = require('powercord/entities');
const { React, FluxDispatcher, getModule} = require('powercord/webpack');

const settings = getModule([ 'updateRemoteSettings' ],false);
const Settings = require('./components/Settings.jsx');

let userSettings;

//cba to make a discord settings window. change the stuff yourself
//might make it more customisable if i can be bothered in the future
//you can change some stuff like the afk time if you send an updateRemoteSettings req with the afkTimeout in seconds
module.exports = class AFK extends Plugin {
    async startPlugin () {
        this.afk = this.afk.bind(this);
        await FluxDispatcher.subscribe('AFK', this.afk);
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'AFK',
            render: Settings
        });
        userSettings = this.settings;
        powercord.api.commands.registerCommand({
                command: 'afkTimeout',
                description: 'Set your afk timeout',
                usage: '{c} [time in seconds]',
                executor: this.setTimeout.bind()
            })
        powercord.api.commands.registerCommand({
                command: 'afk',
                description: 'Override whether you are afk or not',
                usage: '{c} [on/off]',
                executor: this.setAfk.bind()
            }
        )
    }
    setAfk(args){
        if(args.length !== 1){
            return{
                send: false,
                result: "Missing argument: Option"
            }
        }
        if(["on", "enable", "true"].includes(args[0].toLowerCase())){
            settings.updateRemoteSettings({
                status : userSettings.get('afkStatus', 'idle'),
                customStatus: {
                    emojiName: userSettings.get('afkEmoji'),
                    text: userSettings.get('afkText')
                }
            });
        } else if(["off", "disable", "false"].includes(args[0].toLowerCase())){
            settings.updateRemoteSettings({
                customStatus : {
                    emojiName: userSettings.get('normalEmoji'),
                    text: userSettings.get('normalText')
                },
                status: userSettings.get('normalStatus', 'online')
            });
        } else {
            return{
                send: false,
                result: "Argument Option must be either on or off!"
            }
        }
    }

    setTimeout(args){
        if(args.length !== 1){
            return{
                send: false,
                result: "Missing argument: Time (seconds)"
            }
        }
        if(args[0] > 600 || args[0] < 30){ // discords rules not mine dont complain
            return{
                send: false,
                result: "Argument Time must be between 30 and 600"
            }
        }
        settings.updateRemoteSettings({
            afkTimeout: args[0]
        })
        return{
            send: false,
            result: "**Success**\nSet afkTimeout to " + args[0] + " seconds"
        }
    }

    afk(){
        settings.updateRemoteSettings({
            status : userSettings.get('afkStatus', 'idle'),
            customStatus: {
                emojiName: userSettings.get('afkEmoji'),
                text: userSettings.get('afkText')
            }
        });

        powercord.api.notices.sendAnnouncement('afk-true', {
            color: 'orange',
            message: `We noticed you left.. :( that's okay, we went ahead and changed your status.`,
            button: {
                text: "Disable",
                onClick: () => {
                    settings.updateRemoteSettings({
                        customStatus : {
                            emojiName: userSettings.get('normalEmoji'),
                            text: userSettings.get('normalText')
                        },
                        status: userSettings.get('normalStatus', 'online')
                    });
                }
            }

        });
    }

    pluginWillUnload(){
        FluxDispatcher.unsubscribe('AFK', this.afk);
        powercord.api.commands.unregisterCommand('afkTimeout');
        powercord.api.commands.unregisterCommand('afk');
        powercord.api.settings.unregisterSettings(this.entityID);
    }

}