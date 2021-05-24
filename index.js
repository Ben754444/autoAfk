const { Plugin } = require('powercord/entities');
const { React, FluxDispatcher, getModule} = require('powercord/webpack');

const settings = getModule([ 'updateRemoteSettings' ],false);

//cba to make a discord settings window. change the stuff yourself
//might make it more customisable if i can be bothered in the future
//you can change some stuff like the afk time if you send an updateRemoteSettings req with the afkTimeout in seconds
const statusType = "idle" //dnd, online, idle, invisible - not sure why you would change this
const emojiName = "💤" //just the emoji you want to use as your status
const normalStatus = "dnd" //dnd, online, idle, invisible - status when ur not afk
module.exports = class AFK extends Plugin {
    async startPlugin () {
        this.afk = this.afk.bind(this);
        await FluxDispatcher.subscribe('AFK', this.afk);
    }
    afk(){
        settings.updateRemoteSettings({
            status : statusType,
            customStatus: {
                emojiName: emojiName
            }
        });
        powercord.api.notices.sendAnnouncement('afk-true', {
            color: 'orange',
            message: `We noticed you left.. :( that's okay, we went ahead and changed your status.`,
            button: {
                text: "Disable",
                onClick: () => {
                    console.log("[AFK] Disabled");
                    settings.updateRemoteSettings({
                        status : normalStatus,
                        customStatus: {}
                    });
                }
            }

        });
    }

    pluginWillUnload(){
        FluxDispatcher.unsubscribe('AFK', this.afk);
    }

}