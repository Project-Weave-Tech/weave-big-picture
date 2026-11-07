# Weave big picture

One place to collect the communities, projects, people and ideas around Project Weave.

This is a collection, not a map yet. Entries don't have to be linked or sorted. Use cases can be drawn from it later, once enough is here.

Interop between the implementations has its own place: the [DTG Interop Board](https://project-weave-tech.github.io/dtg-interop/).

## What goes in

| Folder | One entry is |
|---|---|
| [`projects/`](projects/) | A project: something being built (`kind: software`), a community (`kind: community`) or an idea (`kind: idea`). |
| [`people/`](people/) | A person: what they work on, what you can talk to them about, and the projects they contribute to (`projects: [slug, …]`). |

Places and events come later.

## How to add something

- **Without git:** open an issue and pick the form for the kind of entry: [new issue](https://github.com/Project-Weave-Tech/weave-big-picture/issues/new/choose). Someone turns it into a file.
- **With git:** copy `_template.md` in the folder, name it `<short-name>.md` (that name is the entry's id), fill it in, open a pull request. `npm run build` checks the entries and writes `dist/data.json`.

Short is fine. A name and two sentences are a complete entry.

## Tags

Every entry can carry a few tags in its front matter: `tags: [local-first, groups, commons]`. Tags are free: lowercase, words joined with `-`. Before inventing one, look whether a tag that others already use fits. Tags are how the picture gets read later, so a shared word is worth more than a precise one.

## One rule

People add themselves, or agree before someone else adds them. The same goes for a community that does not already present itself in public. Nobody should find themselves in this picture without having been asked.

## Licence

[CC BY 4.0](LICENSE).
