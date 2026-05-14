export const WHATSAPP_NUMBER = "56978838174";
export const WHATSAPP_HUMAN = "+56 9 7883 8174";
export const INSTAGRAM_URL = "https://www.instagram.com/trabalenguaescolares/";
export const INSTAGRAM_HANDLE = "@trabalenguaescolares";
export const ADDRESS = "Calle 36 Ote. 1994, Talca";
export const MAPS_SHARE_URL = "https://maps.app.goo.gl/mCNddT5bCWgy664z9";
export const MAPS_EMBED_URL =
  "https://www.google.com/maps?q=-35.4253351,-71.6132162&z=17&hl=es&output=embed";
export const HOURS = [
  { day: "Lunes a viernes", time: "10:00 — 18:00 hrs" },
  { day: "Sábado", time: "10:00 — 14:00 hrs" },
  { day: "Domingo", time: "Cerrado" },
];
export const DELIVERY_FEE = 4990;
export const DELIVERY_CITY = "Talca";

export const waLink = (message = "") => {
  const msg = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}${msg}`;
};
