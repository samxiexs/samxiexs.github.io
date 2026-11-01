// Everything on misc.html lives here. Empty arrays show a short placeholder line.
//
// Photos are grouped into albums (newest first). Each album lives in its own folder:
//   pic/misc/<album-slug>/thumb/NN-name.jpg   ~960px, shown on the page
//   pic/misc/<album-slug>/full/NN-name.jpg    ~2000px, opened in the lightbox
//   pic/misc/<album-slug>/_originals/         camera files, gitignored (they carry GPS data)
// Photo:      { src: "thumb/…", full: "full/…", w: 960, h: 720, alt: "Describe the image", caption: "Short line" }
//
// Music link: { title: "Track / playlist", artist: "Artist", note: "Listening notes", url: "https://..." }
// Own audio:  { title: "Recording", artist: "Shen Xie", note: "...", src: "assets/audio/recording.mp3" }
// Note:       { title: "A title", date: "2026-09-15", summary: "One line", href: "notes/a-title.html" }
//             (href is optional — leave it out for a note that is just the title and summary.)
window.personalCollections = {
  albums: [
    {
      id: 'second-month-gt',
      title: 'Second month at Georgia Tech',
      dates: 'October 2026',
      note: 'Six frames from October — a little basketball, a little autumn, and one spooky evening :)',
      dir: 'pic/misc/second-mon-gt/',
      preview: [2, 1, 4, 0, 5],
      photos: [
        { src: 'thumb/01-sunset-through-the-trees.jpg', full: 'full/01-sunset-through-the-trees.jpg', w: 720, h: 960, alt: 'Pink and orange sunset clouds framed by dark trees above a neighborhood street', caption: 'Oct 5 · sunset through the trees' },
        { src: 'thumb/02-shadow-on-the-court.jpg', full: 'full/02-shadow-on-the-court.jpg', w: 540, h: 960, alt: 'The photographer’s shadow stretches across a blue outdoor basketball court beneath a clear sky', caption: 'Oct 17 · a shadow and a hoop' },
        { src: 'thumb/03-campus-and-skyline.jpg', full: 'full/03-campus-and-skyline.jpg', w: 960, h: 540, alt: 'Atlanta towers rise beyond a campus sports field under a cloudless blue sky', caption: 'Oct 21 · campus and skyline' },
        { src: 'thumb/04-court-under-the-trees.jpg', full: 'full/04-court-under-the-trees.jpg', w: 540, h: 960, alt: 'A basketball hoop on a blue court surrounded by leafy trees in afternoon sunlight', caption: 'Oct 22 · back on the court' },
        { src: 'thumb/05-autumn-leaves.jpg', full: 'full/05-autumn-leaves.jpg', w: 540, h: 960, alt: 'Sunlight filters through a canopy of green, gold, and orange autumn leaves', caption: 'Oct 30 · autumn, finally' },
        { src: 'thumb/06-halloween-after-dark.jpg', full: 'full/06-halloween-after-dark.jpg', w: 960, h: 540, alt: 'A tall Halloween figure with glowing red eyes and colorful skull lights outside a brick building at night', caption: 'October · Halloween after dark' }
      ]
    },
    {
      id: 'first-month-gt',
      title: 'First month at Georgia Tech',
      dates: 'Aug 30 – Sep 25, 2026',
      note: 'Seven frames from my first month in Atlanta — mostly sky, because the sky here keeps showing off :)',
      dir: 'pic/misc/first-mon-gt/',
      preview: [2, 0, 4, 1, 6],   // photos (by index) shown in the floating stack when the album is closed
      photos: [
        { src: 'thumb/01-field-at-sunset.jpg', full: 'full/01-field-at-sunset.jpg', w: 960, h: 720, alt: 'Sun setting behind floodlights over a fenced turf field where people are playing soccer', caption: 'Aug 30 · first evening out' },
        { src: 'thumb/02-pines-on-the-corner.jpg', full: 'full/02-pines-on-the-corner.jpg', w: 720, h: 960, alt: 'Tall pine trees lit by low sun above a stone wall at a quiet street corner', caption: 'Aug 30 · pines on the corner' },
        { src: 'thumb/03-sculpture-and-skyline.jpg', full: 'full/03-sculpture-and-skyline.jpg', w: 960, h: 720, alt: 'White twisted sculpture on a campus lawn seen from a rooftop, with the Atlanta skyline under big clouds', caption: 'Aug 31 · campus, from a rooftop' },
        { src: 'thumb/04-stinger-and-skyline.jpg', full: 'full/04-stinger-and-skyline.jpg', w: 540, h: 960, alt: 'A Stinger campus bus parked below green trees, with Atlanta towers and white clouds behind', caption: 'Aug 31 · Stinger, skyline' },
        { src: 'thumb/05-clouds-at-dusk.jpg', full: 'full/05-clouds-at-dusk.jpg', w: 720, h: 960, alt: 'A tall storm cloud lit pale against a deep blue dusk sky above brick houses and a quiet road', caption: 'Sep 6 · clouds at dusk' },
        { src: 'thumb/06-window-blinds.jpg', full: 'full/06-window-blinds.jpg', w: 720, h: 960, alt: 'Blue evening light through window blinds, trees and lit brick buildings outside', caption: 'Sep 13 · through the blinds' },
        { src: 'thumb/07-afternoon-clouds.jpg', full: 'full/07-afternoon-clouds.jpg', w: 960, h: 540, alt: 'Sun breaking through a field of puffy white clouds in a deep blue sky', caption: 'Sep 25 · afternoon clouds' }
      ]
    }
  ],
  music: [],
  notes: []
};
