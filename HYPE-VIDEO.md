# Hype video plan

A 40-second animated video for a full class or the end-of-year presentation. Zachary approved the outline on 11/12.

It's a page of its own, `hype.html`.

## Watching it on the site

On the main page, a "Watch a video" button sits under the intro on the "How this works" screen, followed by "or read how it works below.", and another sits beside the "How this works" button while reading a lease. Zachary chose the place and the words on 11/12, then changed the words to these. The button plays the video in a pop-up over the page, so an uploaded lease is still there when the pop-up closes.

Opened on its own, the video's start screen has a "Try it yourself" link back to the tool, which keeps link settings such as `?t=`.

## How to play it

1. Open `hype.html` from the GitHub Pages site. It can't load its words when opened straight from the Finder.
2. Press **F** for full screen, then **Space** (or click) to play.
3. When it ends, it holds on the last frame. Press **R** to replay.

## How to get a video file

1. Open QuickTime Player, then choose File → New Screen Recording.
2. Record the full screen, play the video, and stop the recording when it ends.
3. Add music in iMovie if you like. The logo appears at about 15 seconds, which is a good spot for a beat.

## Scenes

| Time | Scene |
|---|---|
| 0–4 s | One line fades in on cream. |
| 4–9 s | Pages of fake fine print scroll by faster and faster. A signature draws itself on a line. |
| 9–15 s | The fine print stops and fades. The two questions get the highlighter sweep: gold for the first, brick for the second. |
| 15–19 s | The logo types itself out, and the highlighter sweeps behind the "&" last, as on the opening screen. |
| 19–31 s | The three versions, about 4 seconds each: the sliding version pill, each version's description line, and cards easing in. |
| 31–37 s | The design question appears a few words at a time. "Negotiable" and "consequential" get the highlighter. |
| 37–40 s | Logo and credit, held on screen. |

## Where the words come from

- `hype-video.json` holds the video's own lines. Claude drafted them, so they're named in its `unverified` list until Zachary checks them.
- The logo, the version names, the description lines, the tier names and the labels come from `content.json` and `content-round-two.json`, the same words the main page uses.
- The clause names on the cards come from `library/clause-types.json`. `hype-video.json` lists which ones to use, by their id. Only approved rows are shown.
- The fine print is gray bars, not real lease text, because the GBREB form is copyrighted.

## Reduced motion

If the device asks for reduced motion, scenes swap with a gentle fade and nothing moves.
