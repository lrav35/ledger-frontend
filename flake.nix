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

          buildInputs = [
            pkgs.bun
            pkgs.nodejs
          ];

          buildPhase = ''
            export HOME=$TMPDIR
            bun install --frozen-lockfile
          '';

          installPhase = ''
            mkdir -p $out/bin
            mkdir -p $out/share/ledger-frontend
            cp -r . $out/share/ledger-frontend/
            
            # Create wrapper script
            cat > $out/bin/ledger-frontend << 'EOF'
#!/bin/sh
cd $out/share/ledger-frontend
exec ${pkgs.bun}/bin/bun run index.ts
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