{
  description = "Brave Android TV development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs =
    { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      tools = with pkgs; [
        nodejs_24
        (pnpm.override { nodejs-slim = nodejs_24; })
        python3
        git
        curl
        cacert
        gnumake
        ninja
        pkg-config
        gperf
        bison
        flex
        nasm
        patch
        unzip
        zip
        xz
        which
        file
        time
        android-tools
        jdk21_headless
        mypy
      ];
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = tools;
        # Chromium selects its own compiler, SDK and sysroot through DEPS.
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
          pkgs.stdenv.cc.cc.lib
          pkgs.zlib
        ];
      };

      checks.${system} = {
        toolchain =
          pkgs.runCommand "brave-tv-toolchain"
            {
              nativeBuildInputs = tools;
            }
            ''
              node -e 'if (Number(process.versions.node.split(".")[0]) < 24) process.exit(1)'
              pnpm --version
              python3 -c 'import sys; assert sys.version_info >= (3, 11)'
              git --version
              javac -version
              adb version
              touch "$out"
            '';

        source-tools =
          pkgs.runCommand "brave-tv-source-tools"
            {
              nativeBuildInputs = [
                pkgs.python3
                pkgs.git
                pkgs.mypy
                pkgs.jdk21_headless
              ];
            }
            ''
                cp -r ${./tools} tools
                cp -r ${./tests} tests
              cp -r ${./patches} patches
                python3 -m unittest discover -s tests -v
                mypy --strict tools tests
                touch "$out"
            '';
      };

      formatter.${system} = pkgs.nixfmt;
    };
}
