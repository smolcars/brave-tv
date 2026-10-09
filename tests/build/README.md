# Android tooltip link regression

The pinned upstream factory returned a desktop implementation pointer on Android,
where that implementation is excluded from the build. The optimized ARM object
emitted a reference to its missing controller destructor, failing the final link.

After building the factory object in the existing Nix environment, run:

```sh
python3 tests/build/check_android_tooltips.py \
  "$HOME/.cache/brave-tv/workspace/src" \
  "$HOME/.cache/brave-tv/workspace/src/out/android_Static_arm/obj/brave/browser/brave_ads/impl/ads_service_factory.o"
```

This inspects the actual compiled Android object, not source text. It fails on
the original optimized object and must pass after the factory returns the shared
interface. Tool failures also fail the check. Run the complete APK build afterward
to verify the real linker and packaging; this check alone does not establish them.
The object check is manual because the repository's lightweight Nix checks do not
download or compile Chromium.

## Native TV home factory

Run `nix develop --command python3 tests/build/check_tv_home_adapter.py "$HOME/.cache/brave-tv/workspace/src"`. It compiles the actual adapter with the pinned ASM jars, rewrites a representative factory, and uses JVM verification and assertions to check normal/private TV and non-TV return paths. This catches stack/frame errors; Android compilation and rendered native-page behavior still require the APK/device checks.
