'use strict';

const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Docker = Me.imports.src.docker;

// Docker actions for each container
class DockerMenuItem extends PopupMenu.PopupMenuItem {

    constructor (containerName, dockerCommand) {
        super(Docker.dockerCommandsToLabels[dockerCommand]);

        this.containerName = containerName;
        this.dockerCommand = dockerCommand;

        this.connect('activate', Lang.bind(this, this._dockerAction));
    }

    _dockerAction() {
        Docker.runCommand(this.dockerCommand, this.containerName, (status, command, err) => {
            if (status === 0) {
                log("`" + command + "` terminated successfully");
            } else {
                let errMsg = _("Error occurred when running `" + command + "`");
                Main.notify(errMsg);
                log(errMsg);
                log(err);
            }
        });
    }
};
