# Environment Pack — BG-APT-17F-RAIN / COM00-S04

> Lifecycle: **EXPERIMENTAL — NOT A PRODUCTION SOURCE OF TRUTH**
>
> Historical pilot material. Do not execute as a production task.

```yaml
pack_id: env-bg-apt-17f-rain-com00-s04-v001
pack_type: environment
environment_id: BG-APT-17F-RAIN
scope: COM00-S04 only

location:
  type: 17th-floor corridor in a contemporary Taipei high-rise apartment
  socioeconomic_read: believable upper-middle residential, not luxury penthouse
  persistent_elements:
    - warm-gray walls
    - dark residential apartment doors
    - understated wood/stone details
    - elevator/corridor depth
    - 1702 and 1703 are adjacent/nearby in a stable geography
    - no hotel-like styling

time_weather:
  time: Week 1, approximately 21:10
  weather: sustained rain outside
  interior: dry
  ambience:
    - warm residential practical light
    - cool rainy-blue city/window spill
    - subtle restrained wet-shoe reflection cues only

scene_state:
  - the problem box has already been moved clear of the fire-door line
  - Xu Tang is on her normal homeward path near 1702
  - she does not approach or enter 1703
  - enough architecture must remain visible to understand the two-door neighbor geography
  - door numbers must not become giant readable typography or a compositional crutch

reference:
  role: geometry_and_environment_continuity_only
  file: bg-apt-17f-rain-v1.webp
  drive_file_id: 1QeH12Eg8EcoQv0J2NM8R_Sc7UIJlOMun
  legacy_dimensions: 1080x1920
  rule: >
    Fetch this image only as architectural/environment continuity reference.
    Its old portrait crop, sprite lanes, and 9:16 composition are explicitly superseded.
    Recompose the narrative CG as a new 16:9 landscape frame.

composition:
  master_aspect: "16:9"
  primary_subject_zone: central to center-right
  preserve:
    - Xu Tang face/upper body
    - directional cue toward 1702
    - enough 1702/1703 geography to read neighbor relationship
  dialogue_safe_zone: lower third
  crop_tolerance: moderate responsive crop while retaining face and 1702 cue

forbidden:
  - indoor rain or flooding
  - horror lighting
  - luxury penthouse exaggeration
  - hotel corridor look
  - readable brands/logos/signage
  - giant door-number typography
  - extra residents or movers
  - copying the legacy 9:16 framing

compiled_from:
  - source: docs/art/recipes/backgrounds/opening_batch_a_backgrounds.md
    git_blob_sha: 9a48b9dff74831746c2039ebb35d2620349db1e8
    usage: environment facts and accepted Drive reference only; legacy rendering instructions discarded
  - source: docs/narrative/scenes/vertical-slice/COM-00.md
    git_blob_sha: 6564f63ca55996b6ed157076fd8ab51cb9a7b55f
    usage: locked geography/state facts compiled by the preceding Shot Planner pilot
```
