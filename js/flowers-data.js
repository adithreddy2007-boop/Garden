// Garden — flower catalog
// "bloom" = close-up head shot, "stem" = full illustrated plant
const FLOWER_CATALOG = [
  ["african_daisy", "African Daisy"],
  ["allium", "Allium"],
  ["anemone", "Anemone"],
  ["angelonia", "Angelonia"],
  ["anise_hyssop", "Anise Hyssop"],
  ["apple_blossom", "Apple Blossom"],
  ["apricot_blossom", "Apricot Blossom"],
  ["armeria", "Armeria"],
  ["aster", "Aster"],
  ["azalea", "Azalea"],
  ["banksia", "Banksia"],
  ["bat_flower", "Bat Flower"],
  ["bear_s_breeches", "Bear's Breeches"],
  ["bee_balm", "Bee Balm"],
  ["begonia", "Begonia"],
  ["bells_of_ireland", "Bells of Ireland"],
  ["bergenia", "Bergenia"],
  ["black_eyed_susan", "Black-Eyed Susan"],
  ["blanket_flower", "Blanket Flower"],
  ["blue_aster", "Blue Aster"],
  ["blue_flax", "Blue Flax"],
  ["blue_lace_flower", "Blue Lace Flower"],
  ["blue_star", "Blue Star"],
  ["blue_sweet_violet", "Blue Sweet Violet"],
  ["bougainvillea", "Bougainvillea"],
  ["bouvardia", "Bouvardia"],
  ["brugmansia", "Brugmansia"],
  ["bugloss", "Bugloss"],
  ["buttercup", "Buttercup"],
  ["orange_azalea", "Orange Azalea"],
  ["orange_bougainvillea", "Orange Bougainvillea"],
  ["purple_azalea", "Purple Azalea"],
  ["purple_bougainvillea", "Purple Bougainvillea"],
  ["red_anemone", "Red Anemone"],
  ["red_aster", "Red Aster"],
  ["red_begonia", "Red Begonia"],
  ["red_bougainvillea", "Red Bougainvillea"],
  ["white_allium", "White Allium"],
  ["white_anemone", "White Anemone"],
  ["white_azalea", "White Azalea"],
  ["yellow_azalea", "Yellow Azalea"],
  ["yellow_begonia", "Yellow Begonia"],
  ["yellow_bougainvillea", "Yellow Bougainvillea"]
].map(([id, label]) => ({
  id,
  label,
  bloom: `assets/flowers/heads/heads-sm_${id}.webp`,
  stem: `assets/flowers/illustrated/illustrated-md_${id}.webp`
}));

const BOUQUET_WRAP = {
  front: "assets/bouquet/bouquet_1_front.webp",
  back: "assets/bouquet/bouquet_1_back.webp"
};
