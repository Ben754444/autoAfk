const { TextInput, TextAreaInput, Category } = require('powercord/components/settings');
const { React } = require('powercord/webpack');

module.exports = class Settings extends React.Component {
    render() {
        const { getSetting, updateSetting } = this.props;
        return (
            <div>
                <TextInput
                    required={true}
                    note="AFK Status - dnd/idle/online/invisible"
                    value={getSetting('afkStatus', 'idle')}
                    onChange={val => updateSetting('afkStatus', val)}
                >
                    AFK Status
                </TextInput>
                <TextInput
                    required={false}
                    note="The emoji in your custom status"
                    value={getSetting('afkEmoji', null)}
                    onChange={val => updateSetting('afkEmoji', val)}
                >
                    AFK Custom Status - Emoji
                </TextInput>

                <TextInput
                    required={false}
                    note="The text in your custom status"
                    value={getSetting('afkText', null)}
                    onChange={val => updateSetting('afkText', val)}
                >
                    AFK Custom Status - Text
                </TextInput>


                <TextInput
                    required={true}
                    note="Normal Status - dnd/idle/online/invisible"
                    value={getSetting('normalStatus', 'online')}
                    onChange={val => updateSetting('normalStatus', val)}
                >
                    Normal Status
                </TextInput>
                <TextInput
                    required={false}
                    note="The emoji in your custom status"
                    value={getSetting('normalEmoji', null)}
                    onChange={val => updateSetting('normalEmoji', val)}
                >
                    Normal Custom Status - Emoji
                </TextInput>

                <TextInput
                    required={false}
                    note="The text in your custom status"
                    value={getSetting('normalText', null)}
                    onChange={val => updateSetting('normalText', val)}
                >
                    Normal Custom Status - Text
                </TextInput>
            </div>
        );
    }

};