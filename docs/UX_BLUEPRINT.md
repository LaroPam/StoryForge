# UX Blueprint

## UX principle

The product must feel like a premium cinematic interactive book, not a chatbot.

The main experience is a scene reader:

- image
- chapter and scene title
- story text
- choices
- custom action
- world/character panel

## Main screens

1. Landing page
2. Story creation wizard
3. Story preview
4. Adventure scene player
5. Story library
6. Story details
7. Settings
8. Pricing placeholder

## Landing page

### Goal

Make the user understand the product in 5 seconds:

> Write one idea and enter a living illustrated adventure with choices, consequences, memory, and endings.

### Sections

1. Hero
   - cinematic dark background
   - strong headline
   - emotional subtitle
   - primary CTA: `Start adventure`
   - secondary CTA: `View demo`
   - premium mockup of the story player

2. How it works
   - enter an idea
   - choose style
   - create hero
   - play story

3. Genre showcase
   - dark fantasy
   - mystic detective
   - space odyssey
   - horror
   - romance
   - cyberpunk

4. Features
   - AI-generated scenes
   - choices and consequences
   - persistent world memory
   - inventory and quests
   - NPC relationships
   - multiple endings

5. Scene gallery teaser
   - premium placeholder scene cards

6. Final CTA
   - invite user to create first story

## Story creation wizard

### Goal

Make story creation feel magical and personal, not like filling out a boring form.

### Steps

1. Story idea
   - user enters a premise, dream, thought, phrase, or story beginning
   - prompt chips with examples

2. Genre
   - dark fantasy
   - mystic detective
   - space odyssey
   - horror
   - romance
   - cyberpunk
   - post-apocalyptic
   - urban fantasy

3. Tone
   - cinematic
   - dark
   - cozy
   - epic
   - mysterious
   - brutal
   - fairy-tale
   - anime-inspired

4. Visual style
   - cinematic realism
   - premium fantasy illustration
   - dark gothic
   - anime fantasy
   - watercolor dream
   - retro sci-fi

5. Character
   - generate character
   - manual character

Manual fields:

- name
- role
- strength
- weakness
- secret
- goal
- starting item

6. Story settings
   - short adventure
   - medium story
   - long campaign
   - easy / normal / dangerous / hardcore

7. Preview
   - generated/mock title
   - synopsis
   - protagonist
   - genre
   - tone
   - visual style
   - difficulty
   - start button

## Story preview

Show:

- cinematic cover placeholder
- story title
- synopsis
- protagonist
- genre
- tone
- visual style
- difficulty
- expected length
- CTA: `Start story`

This screen should make the user feel: `This story was created for me.`

## Adventure scene player

### Desktop layout

- top header
- central scene area
- right world panel

Central area:

- generated image area or premium placeholder
- chapter title
- scene title
- story text
- choices
- custom action input

Right panel:

- character
- health
- will
- danger
- inventory
- relationships
- quests
- discovered facts

### Mobile layout

- single column
- world info in bottom drawer/sheet
- choices optimized for touch
- custom action easy to open/use

## Scene image behavior

MVP:

- use premium placeholders
- generate image prompts internally as strings
- do not call real image generation yet

Later:

- generate cover
- generate key scenes
- generate premium per-scene illustrations
- preserve visual consistency through `VisualBible`

## Loading states

When generating next scene:

- keep current scene visible
- disable choices
- show atmospheric loading state
- do not use boring spinner only
- use text such as `The next page is forming...`

## Design tokens direction

Base direction:

- dark background
- soft gradients
- warm accent highlights
- large typography
- readable text blocks
- subtle borders
- glass-like panels only where helpful
- cinematic image cards

Avoid visual noise.
