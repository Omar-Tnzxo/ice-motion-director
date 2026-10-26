#!/usr/bin/env python3
# From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo).
# Changes: the status "technical green, creative rejected" replaces a dash-joined spelling (no dash characters
# allowed in this repo); usage notes added; UTF-8 output on both console streams and JSON read with or without
# a UTF-8 byte order mark (Windows editors add one); an honest referencesWaiver {reason, researchNote} when dated
# research found no watchable reference; a literalMechanism field that admits a generic verb when the object really
# is that mechanism; NOTE lines on PASS for both. Standard library only; Python 3.9+ on Windows, macOS and Linux.
# Usage: python validate_motion_contract.py <contract.json> [--project-root <project folder>]
#   With --project-root every declared evidence path must exist. Exit 1 lists every failure; exit 0 prints PASS.
"""Strict validation for a commercial motion contract; ranges are [start,end)."""

from __future__ import annotations
import argparse, json, sys
from pathlib import Path
from urllib.parse import urlparse

ALLOWED_STATUS = {"technical green", "technical green, creative rejected", "creative candidate", "reviewer approved"}
CAMERA_REASONS = {"none", "reading-order", "detail-inspection", "scale-reveal", "spatial-continuity", "decisive-action"}
CLOSURE_TYPES = {"brand-resolve", "cta-resolve", "result-resolve", "open-ended"}
BOUNDARY_TYPES = {"transformation", "motivated-hard-cut", "resolution"}
DEPTH_MODES = {"flat", "functional-2.5d", "functional-3d"}
READING_METHODS = {"native-reader-timed", "recorded-reviewer-timed", "rendered-density-model"}
INHERITANCE_CHANNELS = {"exact-transform", "exact-center", "contour", "contained-content", "motion-vector", "mask", "material-state", "sound-bridge", "semantic-result"}
ARTIFACT_SUFFIXES = {".json", ".md", ".csv", ".png", ".jpg", ".jpeg", ".webp", ".exr", ".mp4", ".mov", ".wav"}
BANNED_EVIDENCE = {"none", "n/a", "na", "todo", "tbd", "placeholder", "it is on beat", "on beat", "strongest beat", "translatez only", "generic 54-frame arabic rule"}
BANNED_COMPOSITIONS = ("website", "hero-section", "heading-and-cards", "dashboard-grid", "static-slide", "feature-wall")
GENERIC_VERBS = {"appear", "bounce", "enter", "exit", "fade", "float", "glow", "grow", "loop", "move", "pop", "pulse", "reveal", "scale", "slide", "spring", "zoom"}

def fail(errors):
    for error in errors: print(f"FAIL: {error}")
    raise SystemExit(1)

def obj(value, where, errors):
    if not isinstance(value, dict): errors.append(f"{where} must be an object"); return {}
    return value

def array(value, where, errors):
    if not isinstance(value, list): errors.append(f"{where} must be an array"); return []
    return value

def need(parent, key, where, errors, kind=None):
    if key not in parent or parent[key] in (None, "", [], {}): errors.append(f"{where} lacks {key}"); return None
    value = parent[key]
    if kind and (not isinstance(value, kind) or (kind is int and isinstance(value, bool))): errors.append(f"{where}.{key} has wrong type")
    return value

def pair(value, where, errors):
    if not isinstance(value, list) or len(value) != 2 or not all(isinstance(v, int) and not isinstance(v, bool) for v in value) or value[1] <= value[0]:
        errors.append(f"{where} must be increasing [start,end) integers"); return None
    return value[0], value[1]

def get_transform(value, where, errors):
    value = obj(value, where, errors)
    center = need(value, "center", where, errors, list)
    scale = need(value, "scale", where, errors, (int, float))
    rotation = need(value, "rotation", where, errors, (int, float))
    if isinstance(center, list) and (len(center) != 2 or not all(isinstance(v, (int, float)) for v in center)): errors.append(f"{where}.center must be [x,y]")
    return {"center": center, "scale": scale, "rotation": rotation}

def artifact_path(value, where, errors):
    if not isinstance(value,str) or not value.strip(): errors.append(f"{where} must be a non-empty artifact path"); return
    normalized=value.strip().casefold()
    if normalized in BANNED_EVIDENCE or any(token in normalized for token in ("placeholder","example.com","reference-a")): errors.append(f"{where} contains placeholder or non-evidence text")
    if Path(value).suffix.casefold() not in ARTIFACT_SUFFIXES: errors.append(f"{where} must point to an evidence artifact")

NOTES = []

def literal_mechanism(item, where, errors):
    """A generic verb is accepted when the object literally is that mechanism (a door that slides, a lift that
    rises): the contract names it in literalMechanism (at least 20 characters). Returns True when accepted."""
    text = item.get("literalMechanism") if isinstance(item, dict) else None
    if text is None: return False
    if not isinstance(text, str) or len(text.strip()) < 20 or text.strip().casefold() in BANNED_EVIDENCE:
        errors.append(f"{where}.literalMechanism is too vague"); return False
    NOTES.append(f"{where}: generic verb accepted as a literal mechanism ({text.strip()})")
    return True

def transforms_match(a, b):
    try:
        return abs(a["center"][0]-b["center"][0]) <= 1 and abs(a["center"][1]-b["center"][1]) <= 1 and abs(a["scale"]-b["scale"]) <= .01 and abs(a["rotation"]-b["rotation"]) <= .5
    except (KeyError, TypeError): return False

def validate_journey(data, scene_ids, errors):
    journey=obj(need(data,"journey","contract",errors),"journey",errors)
    root=need(journey,"protagonistSemanticId","journey",errors,str)
    need(journey,"openingState","journey",errors,str); need(journey,"closingState","journey",errors,str)
    closure=need(journey,"closureType","journey",errors,str)
    if closure not in CLOSURE_TYPES: errors.append(f"journey.closureType must be one of {sorted(CLOSURE_TYPES)}")
    evidence=obj(need(journey,"closureEvidence","journey",errors),"journey.closureEvidence",errors)
    artifact_path(need(evidence,"artifact","journey.closureEvidence",errors,str),"journey.closureEvidence.artifact",errors)
    for key in ("openingSemanticId","closingSemanticId","relationship"): need(evidence,key,"journey.closureEvidence",errors,str)
    channels=array(need(evidence,"inheritedChannels","journey.closureEvidence",errors),"journey.closureEvidence.inheritedChannels",errors)
    if not channels or any(channel not in INHERITANCE_CHANNELS for channel in channels): errors.append("journey.closureEvidence.inheritedChannels contains unsupported or empty channels")
    if closure != "open-ended" and len(str(evidence.get("relationship","")).strip()) < 30: errors.append("journey.closureEvidence.relationship is too vague")
    chain=array(need(journey,"stateChain","journey",errors),"journey.stateChain",errors)
    if len(chain) < 2: errors.append("journey.stateChain needs at least opening and closing states")
    previous="origin"; seen_scenes=[]
    for i,item in enumerate(chain):
        item=obj(item,f"journey.stateChain[{i}]",errors)
        for key in ("sceneId","semanticId","rootSemanticId","role","state","inheritsFrom","handoffMethod"): need(item,key,f"journey.stateChain[{i}]",errors,str)
        artifact_path(need(item,"visibleProof",f"journey.stateChain[{i}]",errors,str),f"journey.stateChain[{i}].visibleProof",errors)
        if item.get("rootSemanticId") != root: errors.append(f"journey.stateChain[{i}] changes root protagonist identity")
        if item.get("inheritsFrom") != previous: errors.append(f"journey.stateChain[{i}] must inherit from {previous!r}")
        if item.get("sceneId") not in scene_ids: errors.append(f"journey.stateChain[{i}] references unknown scene {item.get('sceneId')!r}")
        previous=item.get("semanticId"); seen_scenes.append(item.get("sceneId"))
    if chain:
        first=chain[0] if isinstance(chain[0],dict) else {}; last=chain[-1] if isinstance(chain[-1],dict) else {}
        if evidence.get("openingSemanticId") != first.get("semanticId"): errors.append("closure openingSemanticId must equal the first journey state")
        if evidence.get("closingSemanticId") != last.get("semanticId"): errors.append("closure closingSemanticId must equal the last journey state")
    for sid in scene_ids:
        if sid not in seen_scenes: errors.append(f"journey.stateChain does not cover scene {sid}")

def validate_music(music, duration, errors):
    sha=str(music.get("sha256", ""))
    if len(sha) != 64 or any(ch not in "0123456789abcdefABCDEF" for ch in sha): errors.append("music.sha256 must be a 64-character hexadecimal digest")
    zones=array(need(music,"energyZones","music",errors),"music.energyZones",errors); cursor=0
    for i,zone in enumerate(zones):
        zone=obj(zone,f"music.energyZones[{i}]",errors)
        start=need(zone,"startFrame",f"music.energyZones[{i}]",errors,int); end=need(zone,"endFrame",f"music.energyZones[{i}]",errors,int)
        for key in ("energy","role","storyPermission"): need(zone,key,f"music.energyZones[{i}]",errors,str)
        artifact_path(need(zone,"evidence",f"music.energyZones[{i}]",errors,str),f"music.energyZones[{i}].evidence",errors)
        derived=need(zone,"derivedFromSha256",f"music.energyZones[{i}]",errors,str)
        if derived != sha: errors.append(f"music.energyZones[{i}] is not bound to the analyzed music SHA-256")
        if not isinstance(start,int) or isinstance(start,bool) or not isinstance(end,int) or isinstance(end,bool) or start != cursor or end <= start or (isinstance(duration,int) and end > duration): errors.append(f"music.energyZones[{i}] breaks contiguous coverage at {cursor}")
        else: cursor=end
    if isinstance(duration,int) and cursor != duration: errors.append(f"music.energyZones end at {cursor}, expected {duration}")

def validate_hard_cuts(data, scenes, errors):
    if "hardCuts" not in data:
        errors.append("contract lacks hardCuts")
    cuts=array(data.get("hardCuts",[]),"hardCuts",errors)
    declared={}
    for i,cut in enumerate(cuts):
        cut=obj(cut,f"hardCuts[{i}]",errors); frame=need(cut,"frame",f"hardCuts[{i}]",errors,int)
        for key in ("fromScene","toScene","narrativeReason","continuityChannel","whyTransformationIsWeaker"): need(cut,key,f"hardCuts[{i}]",errors,str)
        artifact_path(need(cut,"cueEvidence",f"hardCuts[{i}]",errors,str),f"hardCuts[{i}].cueEvidence",errors)
        if len(str(cut.get("narrativeReason","")).strip()) < 20: errors.append(f"hardCuts[{i}].narrativeReason is too vague")
        if cut.get("continuityChannel") not in INHERITANCE_CHANNELS: errors.append(f"hardCuts[{i}].continuityChannel is unsupported")
        if len(str(cut.get("whyTransformationIsWeaker","")).strip()) < 20: errors.append(f"hardCuts[{i}].whyTransformationIsWeaker is too vague")
        measured=[cue.get("frame") for cue in data.get("music",{}).get("cues",[]) if isinstance(cue,dict) and isinstance(cue.get("frame"),int)]
        if isinstance(frame,int) and not any(abs(frame-cue_frame) <= 2 for cue_frame in measured): errors.append(f"hardCuts[{i}] is not within two frames of a measured music cue")
        if isinstance(frame,int): declared[(cut.get("fromScene"),cut.get("toScene"),frame)]=cut
    ordered=sorted(scenes,key=lambda x:x.get("startFrame",-1) if isinstance(x,dict) else -1)
    for previous,current in zip(ordered,ordered[1:]):
        boundary=obj(previous.get("transition"),f"scene {previous.get('id')}.transition",errors).get("boundaryType")
        key=(previous.get("id"),current.get("id"),current.get("startFrame"))
        if boundary == "motivated-hard-cut" and key not in declared: errors.append(f"hard cut {key[0]}→{key[1]} lacks a matching hardCuts record")
        if boundary != "motivated-hard-cut" and key in declared: errors.append(f"hardCuts declares {key[0]}→{key[1]} but transition is not motivated-hard-cut")

def validate_scene(scene, fps, no_vo, max_groups, errors):
    sid, where = str(scene.get("id", "<?>")), f"scene {scene.get('id', '<?>')}"
    start, end = need(scene,"startFrame",where,errors,int), need(scene,"endFrame",where,errors,int)
    if not isinstance(start,int) or isinstance(start,bool) or not isinstance(end,int) or isinstance(end,bool) or start < 0 or end <= start: errors.append(f"{where} has invalid [start,end) range"); return
    need(scene,"claim",where,errors,str)
    composition = str(need(scene,"compositionModel",where,errors,str) or "").casefold()
    if any(term in composition for term in BANNED_COMPOSITIONS): errors.append(f"{where} uses prohibited composition model {composition}")

    entry = obj(need(scene,"entry",where,errors),f"{where}.entry",errors)
    need(entry,"semanticId",f"{where}.entry",errors,str); get_transform(entry.get("transform"),f"{where}.entry.transform",errors)
    motion = obj(need(scene,"primaryMotion",where,errors),f"{where}.primaryMotion",errors)
    for key in ("verb","cause","stateA","stateB","causesNext"): need(motion,key,f"{where}.primaryMotion",errors,str)
    if str(motion.get("verb","")).casefold() in GENERIC_VERBS and not literal_mechanism(motion, f"{where}.primaryMotion", errors): errors.append(f"{where} uses generic primary verb {motion.get('verb')} (allowed only with a literalMechanism of at least 20 characters naming the real mechanism)")
    if motion.get("stateA") == motion.get("stateB"): errors.append(f"{where} primary motion does not change state")

    ownership = array(need(scene,"focalOwnership",where,errors),f"{where}.focalOwnership",errors); cursor = start
    for i,item in enumerate(sorted(ownership,key=lambda x:x.get("startFrame",-1) if isinstance(x,dict) else -1)):
        item=obj(item,f"{where}.focalOwnership[{i}]",errors); s=need(item,"startFrame",f"{where}.focalOwnership[{i}]",errors,int); e=need(item,"endFrame",f"{where}.focalOwnership[{i}]",errors,int); need(item,"owner",f"{where}.focalOwnership[{i}]",errors,str)
        if not isinstance(s,int) or isinstance(s,bool) or not isinstance(e,int) or isinstance(e,bool) or s != cursor or e <= s or e > end: errors.append(f"{where}.focalOwnership[{i}] breaks contiguous coverage at {cursor}")
        else: cursor=e
    if cursor != end: errors.append(f"{where} focal ownership ends at {cursor}, expected {end}")

    disclosure=array(need(scene,"progressiveDisclosure",where,errors),f"{where}.progressiveDisclosure",errors); cursor=start
    for i,window in enumerate(disclosure):
        window=obj(window,f"{where}.progressiveDisclosure[{i}]",errors); s=need(window,"startFrame",f"{where}.progressiveDisclosure[{i}]",errors,int); e=need(window,"endFrame",f"{where}.progressiveDisclosure[{i}]",errors,int); need(window,"focalOwner",f"{where}.progressiveDisclosure[{i}]",errors,str)
        groups=array(need(window,"visibleSemanticGroups",f"{where}.progressiveDisclosure[{i}]",errors),f"{where}.progressiveDisclosure[{i}].visibleSemanticGroups",errors)
        if len(groups)>max_groups: errors.append(f"{where}.progressiveDisclosure[{i}] exposes {len(groups)} groups; max {max_groups}")
        if not all(isinstance(g,str) and g for g in groups): errors.append(f"{where}.progressiveDisclosure[{i}] groups must be strings")
        if not isinstance(s,int) or isinstance(s,bool) or not isinstance(e,int) or isinstance(e,bool) or s != cursor or e <= s or e > end: errors.append(f"{where}.progressiveDisclosure[{i}] breaks contiguous coverage at {cursor}")
        else: cursor=e
    if cursor != end: errors.append(f"{where} progressive disclosure ends at {cursor}, expected {end}")

    units=array(scene.get("textUnits",[]),f"{where}.textUnits",errors)
    if no_vo and not units: errors.append(f"{where} is no-voice-over but has no text focus units")
    for i,unit in enumerate(units):
        unit=obj(unit,f"{where}.textUnits[{i}]",errors); text=need(unit,"text",f"{where}.textUnits[{i}]",errors,str)
        frames=[need(unit,k,f"{where}.textUnits[{i}]",errors,int) for k in ("enterFrame","apexFrame","dwellEndFrame","exitFrame")]
        for key in ("proofOwner","nextTarget"): need(unit,key,f"{where}.textUnits[{i}]",errors,str)
        bbox=need(unit,"bbox",f"{where}.textUnits[{i}]",errors,list)
        for key in ("locale","eventVerb","attachment","attachmentTargetSemanticId","stateA","stateB"): need(unit,key,f"{where}.textUnits[{i}]",errors,str)
        artifact_path(need(unit,"renderedProof",f"{where}.textUnits[{i}]",errors,str),f"{where}.textUnits[{i}].renderedProof",errors)
        if str(unit.get("eventVerb","")).casefold() in GENERIC_VERBS and not literal_mechanism(unit, f"{where}.textUnits[{i}]", errors): errors.append(f"{where}.textUnits[{i}] uses generic text event verb (allowed only with a literalMechanism of at least 20 characters)")
        if len(str(unit.get("attachment","")).strip()) < 20 or "heading" in str(unit.get("attachment","")).casefold(): errors.append(f"{where}.textUnits[{i}] attachment is vague or describes a heading")
        if unit.get("stateA") == unit.get("stateB"): errors.append(f"{where}.textUnits[{i}] does not change state")
        reading=obj(need(unit,"readingEvidence",f"{where}.textUnits[{i}]",errors),f"{where}.textUnits[{i}].readingEvidence",errors)
        for key,kind in (("method",str),("measuredReadFrames",int),("settleFrames",int),("lineCount",int)): need(reading,key,f"{where}.textUnits[{i}].readingEvidence",errors,kind)
        if reading.get("method") not in READING_METHODS: errors.append(f"{where}.textUnits[{i}] uses unsupported reading measurement method")
        measured=reading.get("measuredReadFrames"); settle=reading.get("settleFrames")
        if all(isinstance(v,int) and not isinstance(v,bool) for v in (measured,settle,frames[1],frames[2])) and frames[2]-frames[1] < measured+settle: errors.append(f"{where}.textUnits[{i}] dwell is shorter than measured reading plus settle")
        if isinstance(bbox,list) and (len(bbox)!=4 or not all(isinstance(v,(int,float)) for v in bbox)): errors.append(f"{where}.textUnits[{i}].bbox must be [x,y,w,h]")
        if all(isinstance(v,int) and not isinstance(v,bool) for v in frames):
            if frames != sorted(frames) or frames[0] < start or frames[-1] > end: errors.append(f"{where}.textUnits[{i}] lifecycle is invalid")
            minimum=max(round(.8*fps),round(max(1,len(str(text).split()))/3*fps))
            if frames[2]-frames[1] < minimum: errors.append(f"{where}.textUnits[{i}] dwell is below {minimum}f")

    phases=obj(need(scene,"phases",where,errors),f"{where}.phases",errors); cursor=start
    for key in ("anticipation","action","dwell","exit"):
        current=pair(phases.get(key),f"{where}.phases.{key}",errors)
        if current:
            if current[0] != cursor or current[1] > end: errors.append(f"{where}.phases.{key} breaks coverage at {cursor}")
            cursor=current[1]
    if cursor != end: errors.append(f"{where} phases end at {cursor}, expected {end}")

    transition=obj(need(scene,"transition",where,errors),f"{where}.transition",errors)
    for key in ("owner","destinationScene","destinationAnchor","method","semanticId"): need(transition,key,f"{where}.transition",errors,str)
    if str(transition.get("method","")).casefold() in {"fade","visibility-toggle","opacity-overlap"}: errors.append(f"{where} uses generic transition method")
    boundary=need(transition,"boundaryType",f"{where}.transition",errors,str); need(transition,"continuityChannel",f"{where}.transition",errors,str)
    if boundary not in BOUNDARY_TYPES: errors.append(f"{where}.transition boundaryType must be one of {sorted(BOUNDARY_TYPES)}")
    get_transform(transition.get("endTransform"),f"{where}.transition.endTransform",errors)

    camera=obj(need(scene,"camera",where,errors),f"{where}.camera",errors); mode=need(camera,"mode",f"{where}.camera",errors,str); reason=need(camera,"reason",f"{where}.camera",errors,str); need(camera,"target",f"{where}.camera",errors,str)
    if reason not in CAMERA_REASONS or (mode=="move" and reason=="none"): errors.append(f"{where} camera lacks an allowed semantic reason")
    depth=obj(need(scene,"depth",where,errors),f"{where}.depth",errors); depth_mode=need(depth,"mode",f"{where}.depth",errors,str); need(depth,"semanticPurpose",f"{where}.depth",errors,str)
    if depth_mode not in DEPTH_MODES: errors.append(f"{where}.depth.mode must be one of {sorted(DEPTH_MODES)}")
    if depth_mode in {"functional-2.5d","functional-3d"}:
        for key in ("cameraPointOfInterest","perspective","lightDirection","shadowBehavior","nextOwner"): need(depth,key,f"{where}.depth",errors,str)
        artifact_path(need(depth,"parallaxEvidence",f"{where}.depth",errors,str),f"{where}.depth.parallaxEvidence",errors)
        if len(str(depth.get("semanticPurpose","")).strip()) < 25: errors.append(f"{where}.depth.semanticPurpose is too vague")
        if "translatez" in str(depth.get("perspective","")).casefold(): errors.append(f"{where}.depth perspective cannot be translateZ-only")
        if str(depth.get("shadowBehavior","")).strip().casefold() in BANNED_EVIDENCE: errors.append(f"{where}.depth shadowBehavior lacks evidence")
        layers=array(need(depth,"layers",f"{where}.depth",errors),f"{where}.depth.layers",errors); roles=set()
        for i,layer in enumerate(layers):
            layer=obj(layer,f"{where}.depth.layers[{i}]",errors); need(layer,"name",f"{where}.depth.layers[{i}]",errors,str); role=need(layer,"role",f"{where}.depth.layers[{i}]",errors,str); need(layer,"z",f"{where}.depth.layers[{i}]",errors,(int,float)); roles.add(role)
        if not {"foreground","midground","background"}.issubset(roles): errors.append(f"{where}.depth needs foreground, midground, and background layer roles")
        z_values={layer.get("z") for layer in layers if isinstance(layer,dict) and isinstance(layer.get("z"),(int,float))}
        if len(z_values) < 3: errors.append(f"{where}.depth needs at least three distinct z positions")
        occlusion=array(need(depth,"occlusionOrder",f"{where}.depth",errors),f"{where}.depth.occlusionOrder",errors)
        if len(occlusion) != len(layers): errors.append(f"{where}.depth occlusion order must cover every layer")
        layer_names={layer.get("name") for layer in layers if isinstance(layer,dict)}
        if set(occlusion) != layer_names: errors.append(f"{where}.depth occlusion order must name every declared layer exactly once")
        recombine=need(depth,"recombineFrame",f"{where}.depth",errors,int); get_transform(depth.get("recombineTransform"),f"{where}.depth.recombineTransform",errors)
        if not isinstance(recombine,int) or isinstance(recombine,bool) or not start <= recombine <= end: errors.append(f"{where}.depth recombineFrame outside scene")
        if not transforms_match(get_transform(depth.get("recombineTransform"),f"{where}.depth.recombineTransform",errors),get_transform(transition.get("endTransform"),f"{where}.transition.endTransform",errors)): errors.append(f"{where}.depth recombination does not match the outgoing transition transform")
    if "soundCues" not in scene: errors.append(f"{where} lacks soundCues")
    cues=array(scene.get("soundCues",[]),f"{where}.soundCues",errors)
    if not cues:
        intent=obj(scene.get("soundIntent"),f"{where}.soundIntent",errors)
        if intent.get("mode") != "intentional-silence" or not isinstance(intent.get("reason"),str) or not intent.get("reason"):
            errors.append(f"{where} has no SFX and must document intentional-silence with a reason")
    for i,cue in enumerate(cues):
        cue=obj(cue,f"{where}.soundCues[{i}]",errors)
        for key,kind in (("source",str),("provenance",str),("license",str),("visibleCause",str),("contactFrame",int),("tailEndFrame",int),("role",str),("processing",str),("mixPriority",str)): need(cue,key,f"{where}.soundCues[{i}]",errors,kind)
        contact,tail=cue.get("contactFrame"),cue.get("tailEndFrame")
        if not isinstance(contact,int) or isinstance(contact,bool) or not start <= contact < end: errors.append(f"{where}.soundCues[{i}] contact outside scene")
        if not isinstance(tail,int) or isinstance(tail,bool) or not isinstance(contact,int) or tail < contact: errors.append(f"{where}.soundCues[{i}] tail precedes contact")

def main():
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    parser=argparse.ArgumentParser(); parser.add_argument("contract",type=Path); parser.add_argument("--project-root",type=Path); args=parser.parse_args()
    try: data=json.loads(args.contract.read_text(encoding="utf-8-sig"))
    except (OSError,json.JSONDecodeError) as exc: fail([f"cannot read contract: {exc}"])
    if not isinstance(data,dict): fail(["contract root must be an object"])
    errors=[]; need(data,"project","contract",errors,str); fps=need(data,"fps","contract",errors,int); duration=need(data,"durationFrames","contract",errors,int); no_vo=need(data,"voiceover","contract",errors,bool); max_groups=need(data,"maxVisibleSemanticGroups","contract",errors,int); status=need(data,"approvalStatus","contract",errors,str)
    if not isinstance(fps,int) or isinstance(fps,bool) or fps<=0: errors.append("fps must be positive integer"); fps=60
    if not isinstance(duration,int) or isinstance(duration,bool) or duration<=0: errors.append("durationFrames must be positive integer")
    if not isinstance(max_groups,int) or isinstance(max_groups,bool) or not 1<=max_groups<=4: errors.append("maxVisibleSemanticGroups must be 1..4"); max_groups=3
    if status not in ALLOWED_STATUS: errors.append(f"invalid approvalStatus {status!r}")

    if "references" not in data: errors.append("contract lacks references (use [] plus referencesWaiver when research found none)")
    refs=array(data.get("references",[]),"references",errors); roles=set()
    waiver=data.get("referencesWaiver")
    if len(refs)<3:
        if isinstance(waiver,dict):
            if len(str(waiver.get("reason","")).strip()) < 20: errors.append("referencesWaiver.reason is too vague (say what was searched and why no watchable reference exists)")
            artifact_path(waiver.get("researchNote"),"referencesWaiver.researchNote",errors)
            NOTES.append(f"references: {len(refs)} of 3, waived: {str(waiver.get('reason','')).strip()} (research note {waiver.get('researchNote')})")
        else: errors.append("contract needs at least three role-specific references, or a referencesWaiver {reason, researchNote} when the dated research found none")
    for i,ref in enumerate(refs):
        ref=obj(ref,f"reference[{i}]",errors)
        for key in ("source","role","lesson","doNotCopy","decompositionArtifact"): need(ref,key,f"reference[{i}]",errors,str)
        roles.add(ref.get("role")); source=str(ref.get("source",""))
        if source.startswith("http") and not urlparse(source).netloc: errors.append(f"reference[{i}] has invalid URL")
    if len(roles)!=len(refs): errors.append("reference roles must be unique")
    music=obj(need(data,"music","contract",errors),"music",errors)
    for key,kind in (("file",str),("analysisArtifact",str),("sha256",str),("phrases",list),("rests",list),("cues",list)): need(music,key,"music",errors,kind)

    scenes=array(need(data,"scenes","contract",errors),"scenes",errors)
    scene_ids={s.get("id") for s in scenes if isinstance(s,dict)}
    validate_journey(data,scene_ids,errors); validate_music(music,duration,errors); validate_hard_cuts(data,scenes,errors)
    journey_ids={item.get("semanticId") for item in data.get("journey",{}).get("stateChain",[]) if isinstance(item,dict)}
    for scene in scenes:
        if not isinstance(scene,dict): continue
        for i,unit in enumerate(scene.get("textUnits",[])):
            if isinstance(unit,dict) and unit.get("attachmentTargetSemanticId") not in journey_ids:
                errors.append(f"scene {scene.get('id')}.textUnits[{i}] attachment target is outside the protagonist state chain")
    for scene in scenes: validate_scene(obj(scene,"scene",errors),fps,bool(no_vo),max_groups,errors)
    ordered=sorted(scenes,key=lambda x:x.get("startFrame",-1) if isinstance(x,dict) else -1)
    if ordered:
        if ordered[0].get("startFrame")!=0: errors.append("first scene must start at frame 0")
        ids={s.get("id") for s in ordered}
        for previous,current in zip(ordered,ordered[1:]):
            if current.get("startFrame")!=previous.get("endFrame"): errors.append(f"scene {previous.get('id')}→{current.get('id')} is not contiguous [start,end)")
            transition=obj(previous.get("transition"),f"scene {previous.get('id')}.transition",errors); entry=obj(current.get("entry"),f"scene {current.get('id')}.entry",errors)
            if transition.get("destinationScene")!=current.get("id"): errors.append(f"scene {previous.get('id')} transition targets wrong scene")
            if transition.get("semanticId")!=entry.get("semanticId"): errors.append(f"scene {previous.get('id')}→{current.get('id')} semantic lineage mismatch")
            if not transforms_match(get_transform(transition.get("endTransform"),"transition.endTransform",errors),get_transform(entry.get("transform"),"entry.transform",errors)): errors.append(f"scene {previous.get('id')}→{current.get('id')} transform continuity fails")
        if ordered[-1].get("endFrame")!=duration: errors.append("last scene endFrame must equal durationFrames")
        durations=[s.get("endFrame",0)-s.get("startFrame",0) for s in ordered]
        if len(durations)>=3 and len(set(durations))==1 and not data.get("uniformTimingJustification"): errors.append("uniform timing requires justification")
        for scene in ordered[:-1]:
            if obj(scene.get("transition"),"transition",errors).get("destinationScene") not in ids: errors.append("transition destination does not exist")

    if status=="reviewer approved":
        artifact=data.get("reviewerApprovalArtifact")
        if not isinstance(artifact,str) or not artifact: errors.append("reviewer approved requires reviewerApprovalArtifact path")
        elif args.project_root:
            try:
                approval=json.loads((args.project_root/artifact).read_text(encoding="utf-8-sig"))
                if approval.get("actorRole") not in {"user","reviewer"} or not approval.get("candidateHash") or not approval.get("approvedAt"): errors.append("approval artifact lacks reviewer-owned fields")
            except (OSError,json.JSONDecodeError): errors.append("approval artifact is missing or invalid")
    if args.project_root:
        journey=data.get("journey",{}) if isinstance(data.get("journey"),dict) else {}
        closure=journey.get("closureEvidence",{}) if isinstance(journey.get("closureEvidence"),dict) else {}
        paths=(
            [music.get("file"),music.get("analysisArtifact"),closure.get("artifact")]
            +[r.get("decompositionArtifact") for r in refs if isinstance(r,dict)]
            +[waiver.get("researchNote") if len(refs)<3 and isinstance(waiver,dict) else None]
            +[z.get("evidence") for z in music.get("energyZones",[]) if isinstance(z,dict)]
            +[c.get("cueEvidence") for c in data.get("hardCuts",[]) if isinstance(c,dict)]
            +[item.get("visibleProof") for item in journey.get("stateChain",[]) if isinstance(item,dict)]
            +[u.get("renderedProof") for s in scenes if isinstance(s,dict) for u in s.get("textUnits",[]) if isinstance(u,dict)]
            +[s.get("depth",{}).get("parallaxEvidence") for s in scenes if isinstance(s,dict) and isinstance(s.get("depth"),dict) and s.get("depth",{}).get("mode") in {"functional-2.5d","functional-3d"}]
            +[c.get("source") for s in scenes if isinstance(s,dict) for c in s.get("soundCues",[]) if isinstance(c,dict)]
        )
        for relative in paths:
            if isinstance(relative,str) and not (args.project_root/relative).is_file(): errors.append(f"declared evidence file missing: {relative}")
    if errors: fail(errors)
    for note in NOTES: print(f"NOTE: {note}")
    print(f"PASS: {len(scenes)} scenes satisfy strict causal, temporal, disclosure, lineage, camera, and sound contracts")

if __name__=="__main__": main()
