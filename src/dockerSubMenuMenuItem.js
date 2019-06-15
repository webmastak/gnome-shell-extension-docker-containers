'use strict';

const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const DockerMenuItem = Me.imports.src.dockerMenuItem;

/**
 * Create a St.Icon
 * @param {String} name The name of the icon 
 * @param {String} styleClass The style of the icon
 * @return {Object} an St.Icon instance
 */
const createIcon = (name, styleClass) => new St.Icon({ icon_name: name, style_class: styleClass, icon_size: '14' });

/**
 * Get the status of a container from the status message obtained with the docker command
 * @param {String} statusMessage The status message
 * @return {String} The status in ['running', 'paused', 'stopped'] 
 */
const getStatus = (statusMessage) => {
    let status = 'stopped';
    if (statusMessage.indexOf("Up") > -1)
        status = 'running';

    if (statusMessage.indexOf("Paused") > -1)
        status = 'paused';

    return status;
}

// Menu entry representing a docker container
class DockerSubMenu extends PopupMenu.PopupSubMenuMenuItem {

    constructor (containerName, containerStatusMessage) {
        super(containerName);

        switch (getStatus(containerStatusMessage)) {
            case "stopped":
                this.actor.insert_child_at_index(createIcon('process-stop-symbolic', 'status-stopped'), 1);
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "start"));
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "rm"));
                break;
            case "running":
                this.actor.insert_child_at_index(createIcon('system-run-symbolic', 'status-running'), 1);
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "pause"));
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "stop"));
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "restart"));
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "exec"));
                break;
            case "paused":
                this.actor.insert_child_at_index(createIcon('media-playback-pause-symbolic', 'status-paused'), 1);
                this.menu.addMenuItem(new DockerMenuItem.DockerMenuItem(containerName, "unpause"));
                break;
            default:
                this.actor.insert_child_at_index(createIcon('action-unavailable-symbolic', 'status-undefined'), 1);
                break;
        }
    }
};
