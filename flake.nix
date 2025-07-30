{
  description = "Ledger Frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.default = pkgs.stdenv.mkDerivation {
          name = "ledger-frontend";
          
          # Include all files, even those in .gitignore
          src = pkgs.lib.cleanSourceWith {
            src = ./.;
            filter = path: type: 
              let
                baseName = baseNameOf path;
              in
                # Include everything except .git directory
                baseName != ".git";
          };

          nativeBuildInputs = [
            pkgs.bun
            pkgs.nodejs
          ];

          buildPhase = ''
            echo "Checking for node_modules..."
            ls -la
            
            if [ -d "node_modules" ]; then
              echo "Using existing node_modules directory"
            else
              echo "ERROR: node_modules directory not found!"
              echo "Available files:"
              ls -la
              exit 1
            fi
          '';

          installPhase = ''
            mkdir -p $out/bin
            mkdir -p $out/share/ledger-frontend
            
            # Copy all files including node_modules
            cp -r . $out/share/ledger-frontend/
            
            # Create wrapper script with correct path
            cat > $out/bin/ledger-frontend << EOF
#!/bin/sh
cd $out/share/ledger-frontend
exec ${pkgs.bun}/bin/bun run index.ts "\$@"
EOF
            chmod +x $out/bin/ledger-frontend
            
            # Debug output
            echo "Files copied to $out/share/ledger-frontend:"
            ls -la $out/share/ledger-frontend/
            echo "Checking for index.ts:"
            ls -la $out/share/ledger-frontend/index.ts || echo "index.ts not found!"
          '';
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.bun
            pkgs.nodejs
          ];
        };
      }) // {
        # NixOS module for your configuration.nix
        nixosModules.ledger-frontend = { config, pkgs, ... }: {
          imports = [ ./ledger-frontend-service.nix ];
          nixpkgs.overlays = [
            (final: prev: {
              ledger-frontend = self.packages.${final.system}.default;
            })
          ];
        };
      };
}
