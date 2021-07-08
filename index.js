const { Plugin } = require('powercord/entities');
const { React, FluxDispatcher, getModule, getModuleByDisplayName} = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Icon } = require("powercord/components");
const settings = getModule([ 'updateRemoteSettings' ],false);
const Settings = require('./components/Settings.jsx');

let userSettings;
let enableDetection = true;
let afkStatus;
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
                description: 'Override whether you are afk or not + toggle detection',
                usage: '{c} [on/off/detectionToggle]',
                executor: this.setAfk.bind()
            }
        )
        const classes = await getModule([ 'iconWrapper', 'clickable' ]);
        const HeaderBarContainer = await getModuleByDisplayName('HeaderBarContainer')

        /* Copyright (C) 2021 TaiAurori (Gabriel Sylvain) - All Rights Reserved
     * (Some code from TheShadowGamer)
     * You may use, distribute and modify this code under the
     * terms of the MIT license.
     * Basically, you can change and redistribute this code
     * but this copyright notice must remain unmodified.
     */

        inject("afk-header-button", HeaderBarContainer.prototype, "render", (args, res) => {
          if (res.props.children[1].key) {
              if (!res.props.toolbar) {
                res.props.toolbar = React.createElement(React.Fragment, { children: [] });
              }
              res.props.toolbar.props.children.push(
                React.createElement(HeaderBarContainer.Icon, {
                  onClick: () => {
                      if(afkStatus === false){
                          settings.updateRemoteSettings({
                              status : userSettings.get('afkStatus', 'idle'),
                              customStatus: {
                                  emojiId: userSettings.get('afkEmoji'),
                                  //emojiId: '490774631284867073',
                                  text: userSettings.get('afkText')
                              }
                          });
                          powercord.api.notices.sendToast('afk-on', {
                              header: 'AFK Toggled',
                              content: 'AFK is now enabled',
                              type: 'info',
                              timeout: 10e3,
                              buttons: [ {
                                  text: 'Close', // required
                                  color: 'red',
                                  size: 'medium',
                                  look: 'outlined',
                              } ],
                          });
                          afkStatus = true
                      } else {
                          if(userSettings.get('normalEmoji', null) !== null || userSettings.get('normalText', null) !== null){
                              settings.updateRemoteSettings({
                                  customStatus : {
                                      emojiId: userSettings.get('normalEmoji'), //emojiName
                                      text: userSettings.get('normalText')
                                  },
                                  status: userSettings.get('normalStatus', 'online')
                              });
                              afkStatus = false
                          } else {
                              settings.updateRemoteSettings({
                                  customStatus: {},
                                  status: userSettings.get('normalStatus', 'online')
                              });
                              afkStatus = false
                          }
                          powercord.api.notices.sendToast('afk-off', {
                              header: 'AFK Toggled',
                              content: 'AFK is now disabled',
                              type: 'info',
                              timeout: 10e3,
                              buttons: [ {
                                  text: 'Close', // required
                                  color: 'red',
                                  size: 'medium',
                                  look: 'outlined',
                              } ],
                          });
                      }
                  },
                  icon: () => React.createElement(Icon, {
                    className: classes.icon,
                    name: 'Close',
                  }),
                  tooltip: "Toggle AFK"
                }),
              )
          }
          return res;
        });
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
                    emojiId: userSettings.get('afkEmoji'),
                    text: userSettings.get('afkText')
                }
            });
            return {
                send: false,
                result: "AFK has been enbaled"
            }
        } else if(["off", "disable", "false"].includes(args[0].toLowerCase())){
            settings.updateRemoteSettings({
                customStatus : {
                    emojiId: userSettings.get('normalEmoji'),
                    text: userSettings.get('normalText')
                },
                status: userSettings.get('normalStatus', 'online')
            });
            return {
                send: false,
                result: "AFK has been disabled"
            }
        } else {
            return{
                send: false,
                result: "Argument Option must be either on or off!"
            }
        }

         if(args[0] === "detectionToggle") {
            enableDetection = !enableDetection;
            return{
                send: false,
                result: "Automatic Detection has been set to " + enableDetection
            }
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
        if(enableDetection){
            settings.updateRemoteSettings({
                status : userSettings.get('afkStatus', 'idle'),
                customStatus: {
                    emojiId: userSettings.get('afkEmoji'),
                    text: userSettings.get('afkText')
                }
            });
            afkStatus = true
        }


        powercord.api.notices.sendAnnouncement('afk-true', {
            color: 'orange',
            message: `We noticed you left.. :( that's okay, we went ahead and changed your status.`,
            button: {
                text: "Disable",
                onClick: () => {
                    if(userSettings.get('normalEmoji', null) !== null || userSettings.get('normalText', null) !== null){
                        settings.updateRemoteSettings({
                            customStatus : {
                                emojiId: userSettings.get('normalEmoji'), //emojiName
                                text: userSettings.get('normalText')
                            },
                            status: userSettings.get('normalStatus', 'online')
                        });
                        afkStatus = false
                    } else {
                        settings.updateRemoteSettings({
                            customStatus: {},
                            status: userSettings.get('normalStatus', 'online')
                        });
                        afkStatus = false

                    }

                }
            }

        });
    }

    pluginWillUnload(){
        FluxDispatcher.unsubscribe('AFK', this.afk);
        powercord.api.commands.unregisterCommand('afkTimeout');
        powercord.api.commands.unregisterCommand('afk');
        powercord.api.settings.unregisterSettings(this.entityID);
        uninject("afk-header-button");
    }
    afkStatus = false

}