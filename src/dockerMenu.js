'use strict';

const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Docker = Me.imports.src.docker;
const DockerSubMenuMenuItem = Me.imports.src.dockerSubMenuMenuItem;

// Docker icon on status menu
const DockerMenu = new Lang.Class({
    Name: 'DockerMenu.DockerMenu',
    Extends: PanelMenu.Button,

    // Init the docker menu
    _init: function () {
        this.parent(0.0, _("Docker containers"));

        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        const gicon = Gio.icon_new_for_string(Me.path + "/docker.svg");
        const dockerIcon = new St.Icon({ gicon: gicon, icon_size: '24' });

        hbox.add_child(this.dockerIcon);
        hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.actor.add_child(hbox);
        this.actor.connect('button_press_event', Lang.bind(this, this._refreshMenu));
        
        this._refresh();        
        this._renderMenu();       
    },
    
    _refresh: function () {
      this._indicatorHide(); 
      this._removeTimeout();
      this._timeout = Mainloop.timeout_add_seconds(2, Lang.bind(this, this._refresh));
      return true;
    },
 
    _removeTimeout: function () {
      if (this._timeout) {
        Mainloop.source_remove(this._timeout);
        this._timeout = null;
      }
    },    

    // Refresh  the menu everytime the user click on it
    // It allows to have up-to-date information on docker containers
    _refreshMenu: function () {
        if (this.menu.isOpen) {
            this.menu.removeAll();
            this._renderMenu();
        }
    },

    // Show docker menu icon only if installed and append docker containers
    _renderMenu: function () {
        if (Docker.isDockerInstalled()) {
            if (Docker.isDockerRunning()) {
                this._feedMenu();
            } else {
                let errMsg = _("Docker daemon not started");
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem(errMsg));
                log(errMsg);
            }
        } else {
            let errMsg = _("Docker binary not found in PATH ");
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(errMsg));
            log(errMsg);
        }
        this.actor.show();
    },

    // Append containers to menu
    _feedMenu: function () {
        try {
            const containers = Docker.getContainers();
            if (containers.length > 0) {
                containers.forEach((container) => {
                    const subMenu = new DockerSubMenuMenuItem.DockerSubMenu(container.name, container.status);
                    this.menu.addMenuItem(subMenu);
                });
            } else {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem("No containers detected"));
            }
        } catch (err) {
            const errMsg = "Error occurred when fetching containers";
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(errMsg));
            log(errMsg);
            log(err);
        }
    },

    // Docker hide indicator if there are no containers
   _indicatorHide() {
       let delimiter = ',';
       let [res, out, err, status] = GLib.spawn_command_line_sync("docker ps -a -q");
           let dockerContainers = String.fromCharCode.apply(String, out);
           if (dockerContainers) {
           this.actor.visible = true; 
       } else {
           this.actor.visible = false;
       }
  }    
});
