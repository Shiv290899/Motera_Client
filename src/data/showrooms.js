export const SHOWROOMS = [
  {
    id: "muddayanapalya",
    name: "Motera Mobility Hub - Muddayanapalya",
    phone: "08073283502",
    address: "Muddayanapalya, Byregowda Layout, Annapurneshwari Nagar, Bengaluru, Karnataka 560091",
    mapUrl: "https://maps.google.com/?q=Muddayanapalya,+Byregowda+Layout,+Annapurneshwari+Nagar,+Bengaluru,+Karnataka+560091",
    isPrimary: true,
  },
  {
    id: "kachohalli",
    name: "Motera Mobility Hub - Kachohalli",
    phone: null,
    address: "Besides Satish Bar, Kachohalli Main Rd, Kachohalli, Bengaluru, Karnataka 562162",
    mapUrl: "https://maps.google.com/?q=Besides+Satish+Bar,+Kachohalli+Main+Rd,+Kachohalli,+Bengaluru,+Karnataka+562162",
  },
  {
    id: "bel-layout",
    name: "Motera Mobility Hub - BEL Layout",
    phone: null,
    address: "XFJJ+HFM, Bel Layout II Phase, BEL Layout, Phase 2, Byadarahalli, Bengaluru, Karnataka 560091",
    mapUrl: "https://maps.google.com/?q=XFJJ+HFM,+Bel+Layout+II+Phase,+BEL+Layout,+Phase+2,+Byadarahalli,+Bengaluru,+Karnataka+560091",
  },
  {
    id: "muddinapalya",
    name: "Motera Experience Center - Muddinapalya Road",
    phone: "9731366921",
    address: "XF9W+WQR, Muddinapalya Rd, MPM Layout, ITI Employees Layout, Annapurneshwari Nagar, Bengaluru, Karnataka 560091",
    mapUrl: "https://maps.google.com/?q=XF9W+WQR,+Muddinapalya+Rd,+MPM+Layout,+ITI+Employees+Layout,+Annapurneshwari+Nagar,+Bengaluru,+Karnataka+560091",
  },
  {
    id: "channenahalli",
    name: "Motera Service Studio - Channenahalli",
    phone: "9731366921",
    address: "34/1 Opp Saritha Bar, Magadi Main Road, Thavarekere Post, Channenahalli, Karnataka 560060",
    mapUrl: "https://maps.google.com/?q=34/1+Opp+Saritha+Bar,+Magadi+Main+Road,+Thavarekere+Post,+Channenahalli,+Karnataka+560060",
  },
  {
    id: "srigandha-nagar",
    name: "Motera Ride Studio - Srigandha Nagar",
    phone: null,
    address: "2G23+XPP, 1st Stage, Srigandha Nagar, Hegganahalli, Bengaluru, Karnataka 560091",
    mapUrl: "https://maps.google.com/?q=2G23+XPP,+1st+Stage,+Srigandha+Nagar,+Hegganahalli,+Bengaluru,+Karnataka+560091",
  },
  {
    id: "kadabagere-cross",
    name: "Motera Ride Studio - Kadabagere Cross",
    phone: null,
    address: "XFQ2+R27, Magadi Main Rd, Kadabagere Cross, Bengaluru, Karnataka 560091",
    mapUrl: "https://maps.google.com/?q=XFQ2+R27,+Magadi+Main+Rd,+Kadabagere+Cross,+Bengaluru,+Karnataka+560091",
  },
];

export const findShowroomById = (id) =>
  SHOWROOMS.find((item) => item.id === id);

export const PRIMARY_SHOWROOM =
  SHOWROOMS.find((item) => item.isPrimary) || SHOWROOMS[0];
