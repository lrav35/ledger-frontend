{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.ledger-frontend;
in
{

  options.services.ledger-frontend = {
    enable = mkEnableOption "Ledger Frontend service";

    port = mkOption {
      type = types.port;
      default = 3000;
      description = "Port on which the ledger frontend will listen";
    };

    user = mkOption {
      type = types.str;
      default = "ledger-frontend";
      description = "User account under which ledger-frontend runs";
    };

    group = mkOption {
      type = types.str;
      default = "ledger-frontend";
      description = "Group under which ledger-frontend runs";
    };

    dataDir = mkOption {
      type = types.path;
      default = "/var/lib/ledger-frontend";
      description = "Directory where ledger-frontend stores its data";
    };

    executableName = mkOption {
      type = types.str;
      default = "ledger-frontend";
      description = "Name of the executable to run";
    };

    apiBaseUrl = mkOption {
      type = types.str;
      default = "http://localhost:8080";
      description = "Base URL for the backend API";
    };

    waitForVPN = mkOption {
      type = types.bool;
      default = false;
      description = "Whether to wait for VPN connection before starting";
    };

    vpnInterface = mkOption {
      type = types.str;
      default = "wg0";
      description = "VPN interface to restrict service to";
    };

    restrictToVPN = mkOption {
      type = types.bool;
      default = false;
      description = "Whether to restrict firewall access to VPN interface only";
    };
  };

  config = mkIf cfg.enable {
    # Create user and group
    users.users.${cfg.user} = {
      isSystemUser = true;
      group = cfg.group;
      home = cfg.dataDir;
      createHome = true;
    };

    users.groups.${cfg.group} = {};

    systemd.tmpfiles.rules = [
      "d ${cfg.dataDir} 0755 ${cfg.user} ${cfg.group} -"
    ];

    systemd.services.ledger-frontend = {
      description = "Ledger Frontend Service";
      after = [ "network.target" ] ++ optional cfg.waitForVPN "wg-quick-${cfg.vpnInterface}.service";
      wantedBy = [ "multi-user.target" ];

      serviceConfig = {
        Type = "simple";
        User = cfg.user;
        Group = cfg.group;
        ExecStart = "${pkgs.ledger-frontend}/bin/${cfg.executableName}";
        WorkingDirectory = cfg.dataDir;
        Restart = "always";
        RestartSec = "10s";
        
        NoNewPrivileges = true;
        PrivateTmp = true;
        # ProtectSystem = "strict";
        # ProtectHome = true;
        # ReadWritePaths = [ cfg.dataDir ];
      };

      environment = {
        PORT = toString cfg.port;
        API_BASE_URL = cfg.apiBaseUrl;
      };
    };

    # Firewall configuration - frontend should be publicly accessible
    networking.firewall = mkMerge [
      (mkIf (!cfg.restrictToVPN) {
        allowedTCPPorts = [ cfg.port ];
      })
      (mkIf cfg.restrictToVPN {
        interfaces.${cfg.vpnInterface}.allowedTCPPorts = [ cfg.port ];
      })
    ];
  };
}