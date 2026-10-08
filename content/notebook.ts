export type NotebookPost = {
  slug: string;
  number: string;
  title: string;
  /** The final words of the title, set in italics on the article cover. */
  titleEmphasis: string;
  summary: string;
  topic: string;
  date: string;
  minutes: number;
  diagram: "waves" | "mark";
  plateCaption: string;
  opening: string;
  sections: { title: string; paragraphs: string[]; marginNote: string }[];
  closing: string;
};

/** Clearly identified sample writing, based on the actual site's geometry. */
export const notebook: NotebookPost[] = [
  {
    // Retain the original URL even though the current model has six components.
    slug: "three-waves-one-sea",
    number: "001",
    title: "The sea is a sum of small things",
    titleEmphasis: "small things",
    summary:
      "Six waves, a moving surface, and the simple relationships behind an intricate impression.",
    topic: "Waves & motion",
    date: "2026-10-04",
    minutes: 4,
    diagram: "waves",
    plateCaption: "The surface of the Living Atlas, sampled at time zero and resolved into ink.",
    opening:
      "A sea can look unpredictable without being complicated at every level. Sometimes the interesting part is how a few simple things refuse to agree.",
    sections: [
      {
        title: "One wave is a beginning.",
        paragraphs: [
          "Take a smooth wave and send it across a flat plane. Its amplitude tells us how far it rises. Its wavelength tells us the distance between crests. Its direction tells us where it travels. One wave gives us a rhythm, but it gives away the pattern almost at once.",
          "The sea in the Living Atlas uses six such waves. They have different wavelengths, different directions, and different starting phases. At any point on the surface, their heights add together. What looks intricate is a conversation between simple parts.",
        ],
        marginNote: "Six components / Four parameters each / One sum",
      },
      {
        title: "The slope is part of the story.",
        paragraphs: [
          "A surface is more than a collection of heights. It also has a direction at every point. The derivatives of the wave equation tell us how quickly height changes as we move across it. Together, those slopes give us a surface normal.",
          "The same relationship appears twice in the scene: in the light reflected by the water, and in the attitude of the small ship. The ship samples the geometric field beneath it. Fine shading ripples add texture to the light, but they do not shake the hull. This is a visual model, with deliberate simplifications rather than a full fluid simulation.",
        ],
        marginNote: "Height + two derivatives / One surface normal",
      },
      {
        title: "A change of view, not a change of sea.",
        paragraphs: [
          "As you scroll, the camera rises and the shaded surface becomes a drawing. The grid and contours are evaluated on the same moving geometry. There is no separate animation trying to keep up with the first one.",
          "An edition fixes the six wave coefficients with a repeatable seed. The printed plate samples them at time zero. It is the same mathematical surface held still and projected onto paper. The title, the navigation, and this text remain ordinary readable HTML around it.",
        ],
        marginNote: "Edition 70806d5e / Authored study / Frozen at t = 0",
      },
    ],
    closing: "The drawing does not explain away the sea. It gives you another way to see it.",
  },
  {
    slug: "an-integral-under-sail",
    number: "002",
    title: "An integral under sail",
    titleEmphasis: "under sail",
    summary: "The little drawing where a mathematical spine becomes a ship's mast.",
    topic: "Geometry & craft",
    date: "2026-10-04",
    minutes: 4,
    diagram: "mark",
    plateCaption:
      "An integral mast, a sail and a hull. Three original outlines, seen as one vessel.",
    opening:
      "An integral already has a sense of movement: a long spine and two turning ends. In the studio mark, that spine becomes a mast, a sail takes its windward edge, and a hull brings the drawing back to the water.",
    sections: [
      {
        title: "Three pieces, one relationship",
        paragraphs: [
          "The mark is built from three filled outlines: mast, sail, and hull. The integral spine has exact half-turn symmetry. The boat around it is intentionally asymmetric, so the whole mark does not inherit that symmetry.",
          "The sail and stern follow an offset of the spine. The channel beside the mast is a geometric relationship, not a gap guessed independently for each piece. The engraved plate places the three original outlines against a set of construction guides.",
        ],
        marginNote: "A half-turn in the spine / A different relationship in the whole vessel",
      },
      {
        title: "Fair curves carry the load",
        paragraphs: [
          "A small drawing can hide a surprising amount of engineering. Tangent continuity keeps the curve from kinking. Real fillets soften junctions. The sail foot and deck share a curved offset so they feel like parts of the same structure.",
          "The illustration reuses the generated mark’s outlines. Its guide rails and annotations help us read the pieces as a construction, while the original geometry preserves the relationship that makes them one vessel.",
        ],
        marginNote: "Three filled outlines / The space between matters",
      },
      {
        title: "The smallest version is a different test",
        paragraphs: [
          "At a large size, tiny channels and rounded junctions are easy to admire. At favicon size, they must survive a small grid of pixels. The existing geometry checks and small-size proofs are part of the design, because a mark needs to work where it is actually used.",
          "There is still room to refine optical centring and dedicated small-size versions. A mathematical relationship can be exact while its visual balance still needs judgment.",
        ],
        marginNote: "Generated geometry / Inspected at small scale",
      },
    ],
    closing:
      "Sea, ship, and mathematics meet here in a single drawing. The construction is part of what the drawing means.",
  },
];

export const findPost = (slug: string) => notebook.find((post) => post.slug === slug);
