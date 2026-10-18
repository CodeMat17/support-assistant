// The help-centre content for Kijani Trails, a fictional tour operator in Nairobi.
// It is the only thing the assistant is allowed to answer from. Every company,
// price and policy here is made up.

export type Passage = {
  /** Stable id, sent to the model as the search result `source` and returned in citations. */
  id: string;
  heading: string;
  text: string;
};

export type KnowledgeDoc = {
  id: string;
  title: string;
  passages: Passage[];
};

export const BUSINESS = "Kijani Trails";

export const knowledge: KnowledgeDoc[] = [
  {
    id: "booking",
    title: "Booking & payments",
    passages: [
      {
        id: "booking-deposit",
        heading: "Deposit and balance",
        text: "A 30% deposit confirms your booking. The remaining balance is due 45 days before departure. If you book within 45 days of departure, the full amount is due at booking.",
      },
      {
        id: "booking-methods",
        heading: "Payment methods",
        text: "We accept Visa and Mastercard in USD, KES, GBP and EUR, and bank transfer in USD or KES. Guests paying in Kenyan shillings can also pay by M-Pesa to our Paybill number, which is shown on your invoice. We do not add a card fee.",
      },
      {
        id: "booking-confirmation",
        heading: "Confirmation",
        text: "Once your deposit is received, we email a confirmation with your booking reference (for example KT-2291) and a pre-departure checklist within one working day.",
      },
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations & changes",
    passages: [
      {
        id: "cancel-by-guest",
        heading: "If you cancel",
        text: "Cancellations made 60 or more days before departure are refunded in full, minus a USD 150 admin fee per booking. Cancellations made 30 to 59 days before departure receive a refund of 50% of the total tour price. Cancellations made less than 30 days before departure are not refunded.",
      },
      {
        id: "cancel-date-change",
        heading: "Changing your dates",
        text: "You can move your tour to new dates once, free of charge, if you ask at least 45 days before departure. Later date changes cost USD 100 per booking and depend on availability. Date changes are handled by our reservations team, who need your booking reference.",
      },
      {
        id: "cancel-by-us",
        heading: "If we cancel",
        text: "If we cancel a tour for safety reasons, such as flooding or park closures, you can choose a full refund or free rebooking on any available date within 12 months.",
      },
      {
        id: "cancel-refund-timing",
        heading: "Refund timing",
        text: "Refunds are paid to the original payment method within 10 working days of the cancellation being confirmed.",
      },
    ],
  },
  {
    id: "tours",
    title: "Tours & prices",
    passages: [
      {
        id: "tours-price-list",
        heading: "Price list (per adult, sharing a room)",
        text: "Maasai Mara Classic, 3 days: USD 1,250. Amboseli & Tsavo, 5 days: USD 2,180. Samburu & Lake Nakuru, 6 days: USD 2,640. Nairobi city day tour: USD 95. Zanzibar beach extension, 4 nights: USD 890.",
      },
      {
        id: "tours-children",
        heading: "Children",
        text: "Children aged 3 to 11 pay 60% of the adult price on all multi-day safaris. Children under 3 travel free when sharing a room with their parents. Guests aged 12 and over pay the adult price. The minimum age for walking safaris is 12.",
      },
      {
        id: "tours-single",
        heading: "Solo travellers",
        text: "Solo travellers who want a room of their own pay a single supplement of USD 320 on any multi-day tour.",
      },
      {
        id: "tours-groups",
        heading: "Groups and private vehicles",
        text: "Shared safaris have a maximum of 6 guests per vehicle, so everyone gets a window seat. A private vehicle costs an extra USD 180 per day. Groups of 10 or more booking together receive a 10% discount on the tour price.",
      },
    ],
  },
  {
    id: "included",
    title: "What's included",
    passages: [
      {
        id: "included-yes",
        heading: "Included on every safari",
        text: "Park entry fees, game drives in a 4x4 Land Cruiser with a pop-up roof, an English-speaking guide, accommodation, all meals on safari days, bottled drinking water in the vehicle, and airport transfers in Nairobi.",
      },
      {
        id: "included-no",
        heading: "Not included",
        text: "International flights, visas, travel insurance, tips for guides and camp staff, alcoholic drinks, and optional activities.",
      },
      {
        id: "included-optional",
        heading: "Optional activities",
        text: "Hot air balloon safari over the Maasai Mara: USD 480 per person, including a bush breakfast. Maasai village visit: USD 30 per person. Both can be added when you book or with your guide on the day, subject to availability.",
      },
    ],
  },
  {
    id: "travel",
    title: "Travel requirements",
    passages: [
      {
        id: "travel-eta",
        heading: "Entry to Kenya",
        text: "Most visitors need a Kenya Electronic Travel Authorisation (eTA), applied for online. Apply at least 2 weeks before you travel. Your passport must be valid for at least 6 months after your arrival date.",
      },
      {
        id: "travel-health",
        heading: "Health",
        text: "A yellow fever vaccination certificate is required if you arrive from, or have transited through, a country with a risk of yellow fever. For other vaccinations and malaria tablets, please speak to a travel clinic before your trip.",
      },
      {
        id: "travel-insurance",
        heading: "Travel insurance",
        text: "Travel insurance that covers medical evacuation is required for all guests. Please send us your policy number before departure.",
      },
    ],
  },
  {
    id: "packing",
    title: "Packing & luggage",
    passages: [
      {
        id: "packing-weight",
        heading: "Luggage on safari flights",
        text: "Light aircraft flights to the Maasai Mara allow 15 kg per person, including hand luggage, in soft-sided bags only. We can store extra luggage free of charge at our Nairobi office.",
      },
      {
        id: "packing-what",
        heading: "What to pack",
        text: "Pack neutral-coloured clothing, a warm layer for early morning game drives, a sun hat, sunscreen and binoculars. Avoid camouflage prints, which are not allowed in Kenya.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact & support",
    passages: [
      {
        id: "contact-hours",
        heading: "Support hours",
        text: "Our support team is available Monday to Saturday, 8am to 6pm East Africa Time, by email, phone and WhatsApp.",
      },
      {
        id: "contact-emergency",
        heading: "On tour",
        text: "Guests currently on tour can reach our emergency line 24 hours a day. The number is printed on your pre-departure checklist.",
      },
    ],
  },
];

export const passages: (Passage & { docId: string; docTitle: string })[] = knowledge.flatMap((doc) =>
  doc.passages.map((p) => ({ ...p, docId: doc.id, docTitle: doc.title })),
);

export function getPassage(id: string) {
  return passages.find((p) => p.id === id);
}

/** A passage split into sentences. Each sentence is sent as its own text block, so citations point at exact sentences. */
export function sentences(text: string) {
  return text.split(/(?<=\.)\s+(?=[A-Z])/);
}
