# The hero video archive

Every project hero on this site is a YouTube embed. This records the archived source of each one:
what was captured, from whom, and how to prove the copy is intact.

Captured 2026-08-31, closing [#272](https://github.com/ali-wallick/portfolio/issues/272).

## The files are not in this repo, and the location is not written down here

Cold storage on Ali's own machine. Nothing is committed and nothing is served, so this publishes
no video and raises no licensing question today — see
[#159](https://github.com/ali-wallick/portfolio/issues/159) on why re-hosting Marvel's trailer and
re-hosting a 2011 capstone demo are different acts. This only preserves the _option_ to act after a
video disappears.

**Where the files live is deliberately absent.** A repo that may go public
([#109](https://github.com/ali-wallick/portfolio/issues/109),
[#48](https://github.com/ali-wallick/portfolio/issues/48)) is the wrong place to record the location
of someone's personal storage. Ask Ali. What is here is everything you need to _verify_ an archive
you have been pointed at, which is the part a checkout can usefully hold.

## Why this exists at all

`yt-dlp` cannot fetch a video that has already been made private. That is not hypothetical here:
three videos embedded in the old blog posts (`7JIMwZnURI4`, `I4FHmsjQyGI`, `MAN8Luc5emM`) are gone
for good, and `docs/PRESERVATION.md` records them as unrecoverable. The archive is insurance against
the same thing happening to a video the current site depends on.

The metadata matters as much as the video. Uploader, channel and upload date are what tell a future
session **whose** video it was, which is the fact that decides whether re-hosting it is defensible,
and it becomes unrecoverable at exactly the same moment the video does.

## What is archived

| Project          | ID            | Uploader             | Uploaded   | Length | Quality | Size   |
| ---------------- | ------------- | -------------------- | ---------- | ------ | ------- | ------ |
| Marvel Snap      | `61zjv1HcJDI` | Marvel Entertainment | 2022-05-19 | 6:59   | 1080p   | 128 MB |
| Vegas Blvd Slots | `8gtbz_T4-yY` | MobilityWare         | 2018-01-10 | 0:15   | 1080p   | 9 MB   |
| Firefall         | `2cxeAhxSoyo` | Firefall             | 2014-07-30 | 2:08   | 1080p   | 67 MB  |
| It Will Kill You | `Erk81CCfc5A` | darkbasic123         | 2010-12-16 | 1:24   | 720p    | 17 MB  |
| Mini Mages       | `qVdAuJmO3oo` | wcanderson1          | 2011-04-24 | 4:03   | 1080p   | 54 MB  |
| Secret Garden    | `OHjZMJ68UjI` | AEL @ GT             | 2011-05-13 | 2:03   | 480p    | 13 MB  |

**Six videos, 287 MB.** Best available video and audio, merged to mp4 with
`yt-dlp 2026.08.19`. The 720p and 480p entries are not downgrades — that is the best those
2010–2011 uploads ever had.

Each video carries four sidecars: `.info.json` (the full YouTube metadata, including channel
URL), `.description`, a thumbnail, and English subtitles where YouTube had them.

## Verifying a copy

From inside the archive folder:

```bash
shasum -a 256 -c SHA256SUMS
```

That checks every file including the sidecars. To check only the videos, against a repo
checkout rather than the folder's own manifest:

- **Marvel Snap** `61zjv1HcJDI` — `c5873282927d4d945096478afff8b3ec937f2b0e6af39603086c4dfc7221dcba`
- **Vegas Blvd Slots** `8gtbz_T4-yY` — `19f7bec6d31b1c722ad7163b04b79888f30a08656bdbcb7ee5e6f9ecd9afb89d`
- **Firefall** `2cxeAhxSoyo` — `03cd3720ff93a8460bd0bb2374eeef232653bf9c5ef840315b1eb06b419689ec`
- **It Will Kill You** `Erk81CCfc5A` — `ede9801638bd5582ecb3edc8a967a40ddb15624c7daca3c514cea1946ca4578f`
- **Mini Mages** `qVdAuJmO3oo` — `e067c9ff032fd86342e160cf506b4b2568a5abcff0c9bacca5c5daa281e12769`
- **Secret Garden** `OHjZMJ68UjI` — `f048681d9d3a722ce6e51010656e0686528870e8cd1e8725cdbd628764f78152`

## Re-running it, or extending it

A **local** session can do this; a Claude Code web session cannot, because its egress proxy blocks
`youtube.com` (`CONNECT tunnel failed, response 403`). `yt-dlp` needs `ffmpeg` on PATH to merge the
separate video and audio streams YouTube serves.

```bash
yt-dlp \
  -f "bv*+ba/b" --merge-output-format mp4 \
  --write-info-json --write-description --write-thumbnail \
  --write-auto-subs --sub-langs "en,en-orig" --convert-subs srt \
  --no-playlist --embed-metadata --windows-filenames \
  --ignore-errors --sleep-requests 2 \
  -o "%(id)s - %(title).100s.%(ext)s" \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

**Two things in that command are there because they had to be.**

`--sub-langs "en,en-orig"` is narrow on purpose. The obvious `"en.*"` also matches YouTube's
auto-_translated_ tracks (`en-fr`, `en-de`, and so on), and the burst of requests earns an
`HTTP 429`. That error aborts the whole item, **including the video download**, so two of the six
came back as subtitles and no video. Nothing failed loudly; the run reported errors about subtitles
while quietly skipping the artifact the exercise was for.

`--ignore-errors` is the belt to that braces: a subtitle failure should never cost the video again.

**Check sizes, not exit codes.** The silent half-failure above was caught by re-probing every file
for duration and stream presence afterward, not by anything the download reported. Verify with
`ffprobe` against the durations in the table above.

## What is not archived, and why

**The four Marvel Snap `press` videos.** `ntORfECH56s` (Second Dinner, "Welcome Ali!"),
`MHqai3bwCoE` (the Hellfire Gala developer update), `Rw1FWK1yhDk` and `ALvP-EyOkBo`. Ali's call —
they are 1.9 GB between them, and `Rw1FWK1yhDk` alone is a 69-minute community show at 1.1 GB that
CLAUDE.md already tiers as entertainment rather than source material about the work. `MHqai3bwCoE`
is the one with a real argument for capture: CLAUDE.md calls it the best single source for the
Marvel Snap page's systems section. Worth revisiting deliberately rather than by accident.

**The three dead blog embeds.** `7JIMwZnURI4`, `I4FHmsjQyGI`, `MAN8Luc5emM` — already 403, and no
copy exists anywhere. See `docs/PRESERVATION.md`.

## Appendix: `SHA256SUMS`

The manifest as it stands in the archive folder, covering every file rather than just the videos.

```
31cf4fcb1f3d6761e3a689dba3ab786cb4c71171f9cbc03d628c668892f968fa  2cxeAhxSoyo - [Firefall] Gameplay Trailer - 2014 Official Launch.description
f36ba3cfc0daaf8cdc800ba23cf1a57cd119bcaf7e00645c7ab50c0ac4ea0ab8  2cxeAhxSoyo - [Firefall] Gameplay Trailer - 2014 Official Launch.en-orig.srt
f36ba3cfc0daaf8cdc800ba23cf1a57cd119bcaf7e00645c7ab50c0ac4ea0ab8  2cxeAhxSoyo - [Firefall] Gameplay Trailer - 2014 Official Launch.en.srt
79c394bf49c5c2ce5f6ed1dde1f1bdc4163b97ba48e2e75debea8f35a27dc96f  2cxeAhxSoyo - [Firefall] Gameplay Trailer - 2014 Official Launch.info.json
03cd3720ff93a8460bd0bb2374eeef232653bf9c5ef840315b1eb06b419689ec  2cxeAhxSoyo - [Firefall] Gameplay Trailer - 2014 Official Launch.mp4
734cc6b38fa5dc105d1ce282a30e44815d2f6831a99998350c90ef4295b4f270  2cxeAhxSoyo - [Firefall] Gameplay Trailer - 2014 Official Launch.webp
70fe7d5360e4320f4bc7393e9ebf1945a339939ac7ff166b34472f801ba40a95  61zjv1HcJDI - MARVEL SNAP ｜ Official Announcement & Gameplay First Look.description
a0b60db07c51db6eb2854bf49c4bec77951c21909104fd837e3910ef036c60fa  61zjv1HcJDI - MARVEL SNAP ｜ Official Announcement & Gameplay First Look.en-orig.srt
a0b60db07c51db6eb2854bf49c4bec77951c21909104fd837e3910ef036c60fa  61zjv1HcJDI - MARVEL SNAP ｜ Official Announcement & Gameplay First Look.en.srt
a1ebdf68b0bb2e0821dcfce7077eabc5d26ae3812543d5201b82c647d593f07b  61zjv1HcJDI - MARVEL SNAP ｜ Official Announcement & Gameplay First Look.info.json
c5873282927d4d945096478afff8b3ec937f2b0e6af39603086c4dfc7221dcba  61zjv1HcJDI - MARVEL SNAP ｜ Official Announcement & Gameplay First Look.mp4
e1ec269b1fa91d6c251dd5bf15c892dd294064e460b813e95e7de69fd9d877e9  61zjv1HcJDI - MARVEL SNAP ｜ Official Announcement & Gameplay First Look.webp
61986248a5a78d9f8e32fcb8dc1aa7de1464c56b722a5bbfb5119d857eaee00b  8gtbz_T4-yY - Vegas Blvd Slots： The HOTTEST New Slots Game!.description
69ca91b12cc1dbc1c27ca42ba2cb7b29cf07e9879b760f2a81170aa52c2d4543  8gtbz_T4-yY - Vegas Blvd Slots： The HOTTEST New Slots Game!.info.json
19f7bec6d31b1c722ad7163b04b79888f30a08656bdbcb7ee5e6f9ecd9afb89d  8gtbz_T4-yY - Vegas Blvd Slots： The HOTTEST New Slots Game!.mp4
5a42cb067db1724f29330433b36ee5d5603c336bc51e53b5b341c835bc00a562  8gtbz_T4-yY - Vegas Blvd Slots： The HOTTEST New Slots Game!.webp
f8e7508703f7f9f969f6b12c3c56489a72c6f11de383ed4c2ee1183babbec67b  Erk81CCfc5A - It Will Kill You [Teaser Trailer].description
e54aebe918470cd280cb2e888c6a361b80d911ab79d1f4965962167c4f0378e3  Erk81CCfc5A - It Will Kill You [Teaser Trailer].en-orig.srt
2ed17c92d4065e2807add12b76325aca78d00bfcfa9e0b276922a0771f33cc79  Erk81CCfc5A - It Will Kill You [Teaser Trailer].info.json
2f518df978ed485d5b7887212b5f480a4d0c3eefe6825d0285004897debfc61a  Erk81CCfc5A - It Will Kill You [Teaser Trailer].jpg
ede9801638bd5582ecb3edc8a967a40ddb15624c7daca3c514cea1946ca4578f  Erk81CCfc5A - It Will Kill You [Teaser Trailer].mp4
f365912a95f303af94080262bacd0c0669de76fbb68d6c7202b5eae098648eb3  OHjZMJ68UjI - Secret Garden.description
fe06dfeb97d14615721a8aa2803424cb8542f142591c949ed835f8e9037f197d  OHjZMJ68UjI - Secret Garden.en-orig.srt
fe06dfeb97d14615721a8aa2803424cb8542f142591c949ed835f8e9037f197d  OHjZMJ68UjI - Secret Garden.en.srt
78a7b690020d52d87b41876a036f77204f933f7a91f3650e88f33fd2a911bdb0  OHjZMJ68UjI - Secret Garden.info.json
0b3f569b4bf427c6ed940db8abc23822ce8cd5db2e4f03bd412aa2c1c8ad7d66  OHjZMJ68UjI - Secret Garden.jpg
f048681d9d3a722ce6e51010656e0686528870e8cd1e8725cdbd628764f78152  OHjZMJ68UjI - Secret Garden.mp4
ef699448009a46157f95167254bb5f3e4d9d8f7d24151406a4b3799b0bb7b32d  qVdAuJmO3oo - Mini Mages Demo Video.description
e6805b2f62a8be018b4f9f58b3e35a0d5550c6ceb540df1723e693f964dd004f  qVdAuJmO3oo - Mini Mages Demo Video.info.json
f11ed6419da60ae8555f93f22d7602518ec70f927245f296294b1104d2185887  qVdAuJmO3oo - Mini Mages Demo Video.jpg
e067c9ff032fd86342e160cf506b4b2568a5abcff0c9bacca5c5daa281e12769  qVdAuJmO3oo - Mini Mages Demo Video.mp4
```
