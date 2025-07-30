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
          src = ./.;

          nativeBuildInputs = [
            pkgs.bun
            pkgs.nodejs
          ];

          dontConfigure = true;

          buildPhase = ''
            echo "Using existing node_modules, skipping dependency installation"
            # Verify node_modules exists
            if [ ! -d "node_modules" ]; then
              echo "Error: node_modules directory not found"
              exit 1
            fi
            echo "node_modules found, proceeding with build"
          '';

          installPhase = ''
            mkdir -p $out/bin
            mkdir -p $out/share/ledger-frontend
            
            # Copy all files including node_modules
            cp -r . $out/share/ledger-frontend/
            
            # Create wrapper script
            cat > $out/bin/ledger-frontend << 'EOF'
#!/bin/sh
cd $out/share/ledger-frontend
exec ${pkgs.bun}/bin/bun run index.ts "$@"
EOF
            chmod +x $out/bin/ledger-frontend
          '';
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.bun
            pkgs.nodejs
          ];
        };
      }) // {
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
