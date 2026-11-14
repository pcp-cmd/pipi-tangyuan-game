export const PETS_ASSET_IDENTITIES = {
  "pipi": {
    "originalPng": "assets/pets/pipi-original-v2.png",
    "originalSha256": "6fff745acc4f50a7bb434a3ca348d2c2f63bc7f8670794fc53fd7464a5f3e603",
    "runtime": "assets/pets/pipi-original-v2.lossless.webp",
    "runtimeSha256": "507600d100a92fd36610a8e75c00ba763d1bcb3a4d3a6a83365531f84b4cd428",
    "width": 1536,
    "height": 2288,
    "rgbaSha256": "8acacba6ae807fb6e3150b36fd2c6529c7e340a725462481848d935bda4452d3"
  },
  "tangyuan": {
    "originalPng": "assets/pets/tangyuan-original-v2.png",
    "originalSha256": "dee5545c7693afe9de8fd4ec21a27facc2fc9872fb805adf88d816808fa646fa",
    "runtime": "assets/pets/tangyuan-original-v2.lossless.webp",
    "runtimeSha256": "7634634b3f97a3b3c0c86a3619fd0d2813ae0bf8caf69cc30fd52f82bda28a35",
    "width": 1536,
    "height": 2288,
    "rgbaSha256": "13f04f366ce462bd2095a1829a20e09fbd734159735aed8b9380178f3a9acc83"
  }
};
for (const identity of Object.values(PETS_ASSET_IDENTITIES)) Object.freeze(identity);
Object.freeze(PETS_ASSET_IDENTITIES);
