module.exports = {
  dependencies: {
    // Exclude react-native-worklets from native Android/iOS autolinking.
    // react-native-reanimated 3.17+ already bundles worklets C++ code internally.
    // Having worklets autolinked causes "redefinition of NativeWorkletsModuleSpecJSI".
    // The Babel plugin (required by react-native-css-interop/NativeWind) still works
    // because it reads from the JS package, not native code.
    'react-native-worklets': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
