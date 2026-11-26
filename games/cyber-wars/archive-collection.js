/* Cyber Wars 0.66 — three creator-authorized readings from the Core library.
 * Exact selected texts, not the complete library or private design bible.
 * Source: ArchitectIndustries/Cyber-Wars, commit c3f8c5055a7f0087c382b226c6d58905ad3f03e3,
 * LIBRARY_COLLECTION.md, blob 36da1e827fb48c6cd66e880c3695533914285bac.
 * Creator-owned Cyber Wars writing; existing project rights are retained.
 */
(function(root){
'use strict';
const readings=[
  {
    "id": "lake",
    "title": "The Lake Beneath the Library",
    "category": "Wilderness / Folktale",
    "author": "Ilex",
    "origin": "viridia",
    "color": "#8dbb91",
    "x": -34,
    "z": -10.25,
    "paragraphs": [
      "Every dry season the lake withdrew from the archive's roots and revealed a staircase no one had built. Children said it led to the first seed. Surveyors said it was an old landing pier. The librarian said both stories deserved a shelf, but only one deserved a measurement.",
      "One night a girl descended with a lantern. She found not treasure but labels: names of vanished animals, each engraved on a thin plate. The lake had covered a memorial.",
      "When the rains returned, the people did not drain the water to keep the staircase visible. They copied the names into books and planted a new marsh around it. Remembering a loss did not require repeating it."
    ]
  },
  {
    "id": "beetle",
    "title": "The Beetle That Kept Time",
    "category": "Insects / Naturalist fiction",
    "author": "The Viridian field circle",
    "origin": "viridia",
    "color": "#b9b880",
    "x": -31.5,
    "z": -10.25,
    "paragraphs": [
      "At dusk, the glasswing beetles lit the path to the archive. Their pulses were never precisely synchronized. The old surveyors tried to correct the rhythm with a transmitter; the colony abandoned the path for an entire season.",
      "The naturalists discovered that different intervals belonged to different messages. What looked like a broken clock was a conversation. They removed the transmitter and planted the flowers the colony needed.",
      "This is a field story about an invented species of Cyber Wars. Its lesson is not that measurement is wrong. It is that observing a system should come before deciding which part of it needs correction."
    ]
  },
  {
    "id": "roof",
    "title": "The Hundred-Credit Roof",
    "category": "In-world economics",
    "author": "The Commons Exchange",
    "origin": "Shared archive",
    "color": "#cda878",
    "x": -26.5,
    "z": -10.25,
    "paragraphs": [
      "A new traveler begins with twenty-one credits. An ordinary mission pays ten. Eight completed missions yield eighty, leaving one hundred and one before penalties or spending. A registered home costs one hundred.",
      "A ship costs exactly one thousand credits and requires a pilot license. Complete all ten ranks of the Pilot skill to earn the license; it is not bought separately. No reserve or down payment is required. A licensed traveler with exactly one thousand credits can buy the ship and retain a zero-credit balance. From twenty-one credits, ninety-eight ordinary missions yield one thousand and one before spending or penalties.",
      "Do not confuse a ledger with a promise of wealth. This is an explanation of a fictional game economy, not real-world investment advice. Speculation can move numbers around without feeding a settlement. The stronghold counts useful delivered goods, not the excitement of their price."
    ]
  }
];
for(const book of readings){Object.freeze(book.paragraphs);Object.freeze(book);}
const api=Object.freeze({readings:Object.freeze(readings),sourceCommit:'c3f8c5055a7f0087c382b226c6d58905ad3f03e3'});
root.CWArchiveCollection=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
