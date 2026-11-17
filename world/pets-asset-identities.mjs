export const PETS_ASSET_IDENTITIES = {
  "pipi": {
    "originalPng": "assets/pets/pipi-original-v2.png",
    "originalSha256": "6fff745acc4f50a7bb434a3ca348d2c2f63bc7f8670794fc53fd7464a5f3e603",
    "runtime": "assets/pets/pipi-wave-v3.lossless.webp",
    "runtimeSha256": "e64cc13614048016ae1f5a43a447db2b7bb33065fd8f142551195d5494cadc9c",
    "width": 1536,
    "height": 2288,
    "rgbaSha256": "586408e550ce9c267becbbdae90e1a9e073dbe6e9e8079a581c0dd9448030d0d",
    "retainedRuntime": "assets/pets/pipi-original-v2.lossless.webp",
    "retainedRuntimeSha256": "507600d100a92fd36610a8e75c00ba763d1bcb3a4d3a6a83365531f84b4cd428"
  },
  "tangyuan": {
    "originalPng": "assets/pets/tangyuan-original-v2.png",
    "originalSha256": "dee5545c7693afe9de8fd4ec21a27facc2fc9872fb805adf88d816808fa646fa",
    "runtime": "assets/pets/tangyuan-wave-v3.lossless.webp",
    "runtimeSha256": "6f5e697f7367a04b20c87696d78ae6dc6ddf79b846f55eaa74412bafefa64f48",
    "width": 1536,
    "height": 2288,
    "rgbaSha256": "cdd99a6bf8958da9b4ad20e45d56db808fa4aa37e76fb37b3fffc5ded1833d15",
    "retainedRuntime": "assets/pets/tangyuan-original-v2.lossless.webp",
    "retainedRuntimeSha256": "7634634b3f97a3b3c0c86a3619fd0d2813ae0bf8caf69cc30fd52f82bda28a35"
  }
};
for (const identity of Object.values(PETS_ASSET_IDENTITIES)) Object.freeze(identity);
Object.freeze(PETS_ASSET_IDENTITIES);
