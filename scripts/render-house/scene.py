"""Photoreal house for /build, modelled in code and rendered with Blender Cycles.

    python scripts/render-house/scene.py --out public/build/house [--views front,back] [--times noon]
                                         [--samples 128] [--res 1920x1080]

Needs the `bpy` module (pip install bpy). For every camera view it writes:
    <view>-<time>.webp   the photoreal render, frames in neutral white
    <view>-mask.png      R = frame coverage, G = glass coverage, B = wood-grain pattern on frames
    <view>-id.png        R = opening number (1..n), unfiltered so every pixel is exact
and one openings.json describing every opening. The browser recolours the frames from
the mask (see src/components/build/render-studio.tsx).
"""

import argparse
import json
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector, Matrix

# ───────────────────────── args ─────────────────────────

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser()
ap.add_argument("--out", default="public/build/house")
ap.add_argument("--views", default="front,back")
ap.add_argument("--times", default="morning,noon,sunset,night")
ap.add_argument("--samples", type=int, default=128)
ap.add_argument("--res", default="1920x1080")
ap.add_argument("--only-masks", action="store_true")
ap.add_argument("--blend", default="")
args = ap.parse_args(argv)
RES = tuple(int(v) for v in args.res.split("x"))
OUT = os.path.abspath(args.out)
os.makedirs(OUT, exist_ok=True)

# ───────────────────────── reset ─────────────────────────

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

FRAME_WHITE = (0.80, 0.80, 0.79, 1)  # neutral frame albedo; the browser divides it back out


# ───────────────────────── materials ─────────────────────────

def mat(name, color, rough=0.5, metal=0.0, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m


def nodes(m):
    return m.node_tree.nodes, m.node_tree.links


def add_bump(m, scale=40.0, strength=0.15, detail=8.0, kind="noise"):
    n, l = nodes(m)
    b = n["Principled BSDF"]
    tex = n.new("ShaderNodeTexNoise") if kind == "noise" else n.new("ShaderNodeTexVoronoi")
    tex.inputs["Scale"].default_value = scale
    if kind == "noise":
        tex.inputs["Detail"].default_value = detail
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    l.new(tex.outputs[0] if kind == "noise" else tex.outputs["Distance"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], b.inputs["Normal"])
    return tex


def color_variation(m, c1, c2, scale=3.0):
    n, l = nodes(m)
    b = n["Principled BSDF"]
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = c1
    ramp.color_ramp.elements[1].color = c2
    l.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], b.inputs["Base Color"])


M = {}
M["stucco"] = mat("stucco", (0.86, 0.85, 0.82, 1), 0.88)
add_bump(M["stucco"], 180, 0.08)
M["slab"] = mat("slab", (0.74, 0.73, 0.71, 1), 0.7)
add_bump(M["slab"], 60, 0.05)
M["plinth"] = mat("plinth", (0.33, 0.33, 0.32, 1), 0.8)
M["wood"] = mat("wood", (0.36, 0.2, 0.1, 1), 0.55)
M["deck"] = mat("deck", (0.42, 0.29, 0.19, 1), 0.6)
M["concrete"] = mat("concrete", (0.62, 0.61, 0.58, 1), 0.85)
add_bump(M["concrete"], 90, 0.06)
M["pavers"] = mat("pavers", (0.6, 0.58, 0.54, 1), 0.8)
n, l = nodes(M["pavers"])
_brick = n.new("ShaderNodeTexBrick")
_brick.inputs["Scale"].default_value = 3.0
_brick.inputs["Color1"].default_value = (0.62, 0.6, 0.56, 1)
_brick.inputs["Color2"].default_value = (0.55, 0.53, 0.5, 1)
_brick.inputs["Mortar"].default_value = (0.35, 0.34, 0.32, 1)
_brick.inputs["Mortar Size"].default_value = 0.01
l.new(_brick.outputs["Color"], n["Principled BSDF"].inputs["Base Color"])
_bb = n.new("ShaderNodeBump"); _bb.inputs["Strength"].default_value = 0.3
l.new(_brick.outputs["Fac"], _bb.inputs["Height"])
l.new(_bb.outputs["Normal"], n["Principled BSDF"].inputs["Normal"])
M["asphalt"] = mat("asphalt", (0.07, 0.07, 0.075, 1), 0.9)
add_bump(M["asphalt"], 600, 0.3)
M["gravel"] = mat("gravel", (0.7, 0.69, 0.66, 1), 0.95)
add_bump(M["gravel"], 300, 0.8, kind="voronoi")
M["grass"] = mat("grass", (0.12, 0.22, 0.05, 1), 0.95)
color_variation(M["grass"], (0.06, 0.13, 0.025, 1), (0.17, 0.27, 0.07, 1), 9.0)
add_bump(M["grass"], 900, 0.5, 2)
n, l = nodes(M["grass"])
_stripes = n.new("ShaderNodeTexWave")
_stripes.bands_direction = "X"
_stripes.inputs["Scale"].default_value = 0.09
_stripes.inputs["Distortion"].default_value = 0.0
_mixs = n.new("ShaderNodeMix"); _mixs.data_type = "RGBA"; _mixs.blend_type = "MULTIPLY"
_mixs.inputs["Factor"].default_value = 0.25
_ramp_in = [x for x in n if x.type == "VALTORGB"][0]
l.new(_ramp_in.outputs["Color"], _mixs.inputs["A"])
_sr = n.new("ShaderNodeValToRGB")
_sr.color_ramp.elements[0].color = (0.82, 0.86, 0.8, 1)
_sr.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
_sr.color_ramp.interpolation = "CONSTANT"
l.new(_stripes.outputs["Fac"], _sr.inputs["Fac"])
l.new(_sr.outputs["Color"], _mixs.inputs["B"])
l.new(_mixs.outputs["Result"], n["Principled BSDF"].inputs["Base Color"])
M["hedge"] = mat("hedge", (0.05, 0.13, 0.03, 1), 0.9)
color_variation(M["hedge"], (0.03, 0.09, 0.02, 1), (0.12, 0.22, 0.05, 1), 12.0)
add_bump(M["hedge"], 25, 1.0, kind="voronoi")
M["palm_trunk"] = mat("palm_trunk", (0.32, 0.27, 0.2, 1), 0.9)
add_bump(M["palm_trunk"], 30, 0.6)
M["palm_leaf"] = mat("palm_leaf", (0.08, 0.17, 0.04, 1), 0.55)
color_variation(M["palm_leaf"], (0.05, 0.12, 0.03, 1), (0.16, 0.24, 0.06, 1), 1.5)
M["tile"] = mat("tile", (0.55, 0.78, 0.85, 1), 0.3)
M["water"] = mat("water", (0.8, 0.95, 1.0, 1), 0.02, **{"Transmission Weight": 1.0, "IOR": 1.33})
add_bump(M["water"], 2.5, 0.25, 4)
M["glass"] = mat("glass", (0.92, 0.96, 0.97, 1), 0.0, **{"Transmission Weight": 1.0, "IOR": 1.5})
M["frame"] = mat("frame", FRAME_WHITE, 0.32, **{"Coat Weight": 0.15})
M["steel"] = mat("steel", (0.75, 0.75, 0.75, 1), 0.25, 1.0)
M["interior_wall"] = mat("interior_wall", (0.85, 0.83, 0.78, 1), 0.9)
M["interior_floor"] = mat("interior_floor", (0.45, 0.33, 0.22, 1), 0.45)
M["sofa"] = mat("sofa", (0.55, 0.52, 0.48, 1), 0.95)
M["cushion"] = mat("cushion", (0.9, 0.88, 0.84, 1), 0.95)
M["dark"] = mat("dark", (0.05, 0.05, 0.05, 1), 0.6)

# wood: wave grain
for key in ("wood", "deck"):
    n, l = nodes(M[key])
    w = n.new("ShaderNodeTexWave")
    w.inputs["Scale"].default_value = 1.6
    w.inputs["Distortion"].default_value = 6.0
    w.inputs["Detail"].default_value = 3.0
    ramp = n.new("ShaderNodeValToRGB")
    base = M[key].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value[:]
    ramp.color_ramp.elements[0].color = tuple(c * 0.6 for c in base[:3]) + (1,)
    ramp.color_ramp.elements[1].color = tuple(min(1, c * 1.25) for c in base[:3]) + (1,)
    l.new(w.outputs["Fac"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], n["Principled BSDF"].inputs["Base Color"])

# palm leaf: pinnate leaflets through alpha stripes across the frond
n, l = nodes(M["palm_leaf"])
tc = n.new("ShaderNodeTexCoord")
sep = n.new("ShaderNodeSeparateXYZ")
l.new(tc.outputs["UV"], sep.inputs["Vector"])
mul = n.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 150
l.new(sep.outputs["X"], mul.inputs[0])  # x runs along the frond, so stripes are leaflets
sine = n.new("ShaderNodeMath"); sine.operation = "SINE"
l.new(mul.outputs[0], sine.inputs[0])
gt = n.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.1
l.new(sine.outputs[0], gt.inputs[0])
l.new(gt.outputs[0], n["Principled BSDF"].inputs["Alpha"])

# emissive materials for night
def emit(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes
    n.remove(n["Principled BSDF"])
    e = n.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = color
    e.inputs["Strength"].default_value = strength
    m.node_tree.links.new(e.outputs[0], n["Material Output"].inputs["Surface"])
    return m


# ───────────────────────── geometry helpers ─────────────────────────

def mesh_obj(name, bm, material, bevel=0.0, smooth=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    if isinstance(material, list):
        for m in material:
            ob.data.materials.append(m)
    elif material:
        ob.data.materials.append(material)
    if bevel:
        mod = ob.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = "ANGLE"
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    return ob


def box_bm(bm, x0, y0, z0, x1, y1, z1, mat_index=0):
    v = [bm.verts.new(p) for p in [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]]
    faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    out = []
    for f in faces:
        face = bm.faces.new([v[i] for i in f])
        face.material_index = mat_index
        out.append(face)
    return out


def box(name, x0, y0, z0, x1, y1, z1, material, bevel=0.0):
    bm = bmesh.new()
    box_bm(bm, x0, y0, z0, x1, y1, z1)
    return mesh_obj(name, bm, material, bevel)


def boolean_diff(target, cutters):
    for c in cutters:
        mod = target.modifiers.new("cut", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.solver = "EXACT"
        mod.object = c
    bpy.context.view_layer.objects.active = target
    for mod in list(target.modifiers):
        if mod.type == "BOOLEAN":
            bpy.ops.object.modifier_apply(modifier=mod.name)
    for c in cutters:
        bpy.data.objects.remove(c, do_unlink=True)


# ───────────────────────── the house ─────────────────────────
# Front faces -Y. Ground floor volume A, upper volume B set back and offset.

T = 0.3  # wall thickness
VOLUMES = {
    "A": dict(x0=-7.0, x1=7.0, y0=-4.5, y1=4.5, z0=0.0, z1=3.2),
    "B": dict(x0=-3.5, x1=6.5, y0=-4.5, y1=3.0, z0=3.5, z1=6.6),
}

# opening: wall side, volume, centre along the wall (in world X or Y), sill height, width, height, kind, style
OPENINGS = [
    # front, ground floor
    dict(v="A", side="front", u=-5.0, sill=0.6, w=1.4, h=2.0, kind="window", style="Tilt & turn"),
    dict(v="A", side="front", u=-1.2, sill=0.0, w=1.3, h=2.5, kind="door", style="Single entry"),
    dict(v="A", side="front", u=4.6, sill=0.6, w=2.2, h=2.0, kind="window", style="Fixed"),
    # front, upper floor
    dict(v="B", side="front", u=-1.6, sill=0.8, w=1.4, h=1.7, kind="window", style="Tilt & turn"),
    dict(v="B", side="front", u=1.6, sill=0.8, w=1.4, h=1.7, kind="window", style="Tilt & turn"),
    dict(v="B", side="front", u=4.6, sill=0.0, w=2.4, h=2.5, kind="sliding", style="2-panel XO"),
    # back, ground floor: big sliders to the pool
    dict(v="A", side="back", u=-3.6, sill=0.0, w=4.6, h=2.6, kind="sliding", style="4-panel OXXO"),
    dict(v="A", side="back", u=2.4, sill=0.0, w=3.4, h=2.6, kind="sliding", style="Lift & slide"),
    dict(v="A", side="back", u=5.6, sill=0.6, w=1.2, h=2.0, kind="window", style="Casement"),
    # back, upper
    dict(v="B", side="back", u=-1.0, sill=0.8, w=1.6, h=1.7, kind="window", style="Tilt & turn"),
    dict(v="B", side="back", u=3.8, sill=0.0, w=2.6, h=2.5, kind="sliding", style="2-panel XO"),
    # sides
    dict(v="A", side="left", u=-1.5, sill=0.6, w=1.2, h=2.0, kind="window", style="Casement"),
    dict(v="B", side="right", u=-1.0, sill=0.8, w=1.2, h=1.7, kind="window", style="Tilt & turn"),
    dict(v="A", side="right", u=1.5, sill=0.6, w=1.2, h=2.0, kind="window", style="Fixed"),
]


def wall_frame(vol, side):
    """origin on the outer face, local x along the wall (right as seen from outside), local y inward."""
    V = VOLUMES[vol]
    if side == "front":
        return Vector((0, V["y0"], V["z0"])), Matrix.Rotation(0, 4, "Z")
    if side == "back":
        return Vector((0, V["y1"], V["z0"])), Matrix.Rotation(math.pi, 4, "Z")
    if side == "left":
        return Vector((V["x0"], 0, V["z0"])), Matrix.Rotation(-math.pi / 2, 4, "Z")
    return Vector((V["x1"], 0, V["z0"])), Matrix.Rotation(math.pi / 2, 4, "Z")


def opening_matrix(o):
    origin, rot = wall_frame(o["v"], o["side"])
    # u is a world coordinate along the wall; local x direction may be reversed
    along = rot @ Vector((1, 0, 0))
    p = origin.copy()
    if o["side"] in ("front", "back"):
        p.x = o["u"]
    else:
        p.y = o["u"]
    p.z += o["sill"]
    return Matrix.Translation(p) @ rot, along


def build_volume(name, V):
    bm = bmesh.new()
    box_bm(bm, V["x0"], V["y0"], V["z0"], V["x1"], V["y1"], V["z1"])
    shell = mesh_obj(name, bm, M["stucco"])
    inner = box(name + "_in", V["x0"] + T, V["y0"] + T, V["z0"] - 0.01, V["x1"] - T, V["y1"] - T, V["z1"] - 0.25, None)
    boolean_diff(shell, [inner])
    return shell


shells = {k: build_volume("house_" + k, V) for k, V in VOLUMES.items()}

# cut the openings
for k, shell in shells.items():
    cutters = []
    for i, o in enumerate(OPENINGS):
        if o["v"] != k:
            continue
        mw, _ = opening_matrix(o)
        c = box(f"cut{i}", -o["w"] / 2, -0.4, 0.0, o["w"] / 2, T + 0.4, o["h"], None)
        c.matrix_world = mw
        bpy.context.view_layer.update()
        cutters.append(c)
    boolean_diff(shell, cutters)
    shell.modifiers.new("bevel", "BEVEL").width = 0.01

# slabs: ground floor roof with a deep front canopy, upper roof with thin overhangs
box("slab_A", -7.3, -5.6, 3.2, 7.3, 4.9, 3.5, M["slab"], 0.01)
box("slab_B", -3.9, -5.1, 6.6, 6.9, 3.5, 6.9, M["slab"], 0.01)
box("parapet_A", -7.3, -5.6, 3.5, 7.3, -5.45, 3.75, M["slab"], 0.01)
box("plinth", -7.05, -4.55, -0.15, 7.05, 4.55, 0.05, M["plinth"])

# wood slat feature wall beside the entrance (front of A, between door and big window)
for i in range(16):
    x = 0.2 + i * 0.16
    box(f"slat{i}", x, -4.62, 0.05, x + 0.07, -4.5, 3.18, M["wood"], 0.004)

# interior: floors, back walls in the rooms, a sofa and lights (so the glass shows depth)
box("floor_A", -6.7, -4.2, 0.0, 6.7, 4.2, 0.05, M["interior_floor"])
box("floor_B", -3.2, -4.2, 3.5, 6.2, 2.7, 3.55, M["interior_floor"])
box("partition_A", -6.7, 0.2, 0.05, 6.7, 0.35, 3.0, M["interior_wall"])
box("ceiling_A", -6.7, -4.2, 2.95, 6.7, 4.2, 3.0, M["interior_wall"])
box("ceiling_B", -3.2, -4.2, 6.3, 6.2, 2.7, 6.35, M["interior_wall"])
box("sofa_base", -5.6, -1.6, 0.05, -2.4, -0.7, 0.45, M["sofa"], 0.05)
box("sofa_back", -5.6, -0.75, 0.05, -2.4, -0.45, 0.85, M["sofa"], 0.05)
box("table", 2.0, 1.2, 0.05, 4.4, 2.2, 0.78, M["wood"], 0.01)
box("kitchen", -6.4, 3.5, 0.05, -1.0, 4.15, 0.92, M["cushion"], 0.01)

# ───────────────────────── windows and doors ─────────────────────────

def ring(bm, x0, z0, x1, z1, t, y0, y1, mi):
    box_bm(bm, x0, y0, z1 - t, x1, y1, z1, mi)
    box_bm(bm, x0, y0, z0, x1, y1, z0 + t, mi)
    box_bm(bm, x0, y0, z0 + t, x0 + t, y1, z1 - t, mi)
    box_bm(bm, x1 - t, y0, z0 + t, x1, y1, z1 - t, mi)


def build_opening(i, o):
    """One object per opening: material 0 = frame, 1 = glass, 2 = steel."""
    bm = bmesh.new()
    w, h = o["w"], o["h"]
    F, Y0, Y1 = 0.075, 0.08, 0.165  # outer frame bar and its depth in the wall
    x0, x1 = -w / 2, w / 2
    ring(bm, x0, 0, x1, h, F, Y0, Y1, 0)
    # aluminium sill outside
    if o["sill"] > 0:
        box_bm(bm, x0 - 0.04, Y0 - 0.12, -0.04, x1 + 0.04, Y0 + 0.01, 0.0, 0)

    def glass(gx0, gz0, gx1, gz1, y):
        box_bm(bm, gx0, y, gz0, gx1, y + 0.026, gz1, 1)

    ix0, ix1, iz0, iz1 = x0 + F, x1 - F, F, h - F
    if o["kind"] == "window":
        if o["style"] == "Fixed":
            glass(ix0, iz0, ix1, iz1, 0.11)
            # glazing beads
            ring(bm, ix0, iz0, ix1, iz1, 0.02, 0.095, 0.11, 0)
        else:
            S = 0.068
            ring(bm, ix0 + 0.005, iz0 + 0.005, ix1 - 0.005, iz1 - 0.005, S, 0.07, 0.14, 0)
            glass(ix0 + S, iz0 + S, ix1 - S, iz1 - S, 0.095)
    elif o["kind"] == "door":
        box_bm(bm, ix0 + 0.005, 0.095, iz0 - F + 0.01, ix1 - 0.005, 0.15, iz1 - 0.005, 0)
        glass(ix0 + 0.18, 0.4, ix0 + 0.42, iz1 - 0.3, 0.09)
        # long pull handle
        box_bm(bm, ix1 - 0.16, 0.0, 0.7, ix1 - 0.13, 0.03, 1.9, 2)
        box_bm(bm, ix1 - 0.16, 0.03, 0.75, ix1 - 0.13, 0.095, 0.78, 2)
        box_bm(bm, ix1 - 0.16, 0.03, 1.82, ix1 - 0.13, 0.095, 1.85, 2)
    else:
        n = 4 if o["style"] == "4-panel OXXO" else 2
        pw = (ix1 - ix0) / n
        S = 0.08 if o["style"] == "Lift & slide" else 0.07
        for k in range(n):
            px0 = ix0 + k * pw - (0.02 if k else 0)
            px1 = ix0 + (k + 1) * pw + (0.02 if k < n - 1 else 0)
            front = (k in (1, 2)) if n == 4 else k == 0
            y = 0.065 if front else 0.115
            ring(bm, px0, iz0 - F + 0.02, px1, iz1, S, y, y + 0.05, 0)
            glass(px0 + S, iz0 - F + 0.02 + S, px1 - S, iz1 - S, y + 0.012)
        # threshold
        box_bm(bm, x0, Y0 - 0.06, -0.02, x1, Y1, 0.02, 0)

    ob = mesh_obj(f"opening_{i + 1:02d}", bm, [M["frame"], M["glass"], M["steel"]], bevel=0.004)
    ob.matrix_world, _ = opening_matrix(o)
    ob["opening"] = i + 1
    return ob


OPENING_OBJS = [build_opening(i, o) for i, o in enumerate(OPENINGS)]

# ───────────────────────── site ─────────────────────────

ground = box("ground", -80, -80, -0.12, 80, 80, -0.02, M["grass"])
box("drive", -2.4, -12.5, -0.02, 0.4, -5.6, 0.0, M["pavers"], 0.01)
box("path", -2.4, -5.6, -0.02, 0.4, -4.5, 0.03, M["pavers"], 0.01)
box("sidewalk", -80, -14.5, -0.02, 80, -12.5, 0.06, M["concrete"], 0.01)
box("street", -80, -24, -0.1, 80, -14.5, -0.03, M["asphalt"])
box("curb", -80, -14.62, -0.1, 80, -14.5, 0.08, M["concrete"], 0.01)
box("gravel_front", -7.3, -5.0, -0.02, -2.4, -4.5, 0.02, M["gravel"])
box("gravel_front_r", 0.4, -5.0, -0.02, 7.3, -4.5, 0.02, M["gravel"])
# pool terrace and pool at the back
deck = box("deck", -8.0, 4.5, -0.02, 8.0, 13.5, 0.04, M["deck"], 0.005)
pool_cut = box("pool_cut", -5.0, 7.0, -1.5, 5.0, 11.0, 0.2, None)
ground_cut = box("ground_cut", -5.05, 6.95, -1.5, 5.05, 11.05, 0.2, None)
boolean_diff(deck, [pool_cut])
boolean_diff(ground, [ground_cut])
pool = box("pool_shell", -5.05, 6.95, -1.4, 5.05, 11.05, -0.02, M["tile"])
pool_in = box("pool_in", -5.0, 7.0, -1.35, 5.0, 11.0, 0.5, None)
boolean_diff(pool, [pool_in])
water = box("water", -5.0, 7.0, -1.3, 5.0, 11.0, -0.08, M["water"])
# loungers
for i, x in enumerate((6.0, 7.0)):
    box(f"lounger{i}", x - 0.35, 7.5, 0.04, x + 0.35, 9.4, 0.36, M["cushion"], 0.04)
# hedges along the front and sides
box("hedge_front_l", -12, -10.2, -0.02, -3.2, -9.4, 0.9, M["hedge"], 0.08)
box("hedge_front_r", 1.6, -10.2, -0.02, 12, -9.4, 0.9, M["hedge"], 0.08)
box("hedge_side_l", -12.5, -8.6, -0.02, -11.5, 15, 1.6, M["hedge"], 0.25)
box("hedge_side_r", 11.5, -8.6, -0.02, 12.5, 15, 1.6, M["hedge"], 0.25)
box("hedge_back", -12.5, 14, -0.02, 12.5, 15, 1.8, M["hedge"], 0.25)
box("planter", -6.8, -5.4, -0.02, -3.2, -4.7, 0.5, M["hedge"], 0.15)


def palm(name, x, y, height, lean=(0.0, 0.0), fronds=20):
    # trunk: tapered, gently curved
    bm = bmesh.new()
    segs = 14
    rings = []
    for s in range(segs + 1):
        t = s / segs
        r = 0.2 * (1 - 0.45 * t)
        cx = x + lean[0] * t * t * height
        cy = y + lean[1] * t * t * height
        z = t * height
        ring_v = [bm.verts.new((cx + r * math.cos(a), cy + r * math.sin(a), z)) for a in [k * 2 * math.pi / 12 for k in range(12)]]
        rings.append(ring_v)
    for s in range(segs):
        for k in range(12):
            a, b = rings[s][k], rings[s][(k + 1) % 12]
            c, d = rings[s + 1][(k + 1) % 12], rings[s + 1][k]
            bm.faces.new([a, b, c, d])
    top = Vector((x + lean[0] * height, y + lean[1] * height, height))
    mesh_obj(name + "_trunk", bm, M["palm_trunk"], smooth=True)
    # fronds: arching strips, UV x runs across the leaflets
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new()
    for f in range(fronds):
        ang = f * 2 * math.pi / fronds + (f % 2) * 0.2
        length = 2.6 + 0.4 * ((f * 7) % 3)
        droop = 0.5 + 0.35 * ((f * 5) % 3)
        steps = 14
        prev = None
        d = Vector((math.cos(ang), math.sin(ang), 0))
        side = Vector((-d.y, d.x, 0))
        rise = 0.9 if f % 3 == 0 else 0.5  # some fronds stand up, others hang
        for s in range(steps + 1):
            t = s / steps
            width = 0.42 * math.sin(math.pi * min(1, t * 1.05)) + 0.03
            p = top + d * (length * t) + Vector((0, 0, rise * t - droop * t * t * 2.4))
            fold = Vector((0, 0, -0.35 * width))  # leaflets hang down either side of the rib
            a = bm.verts.new(p - side * width + fold)
            m = bm.verts.new(p)
            b = bm.verts.new(p + side * width + fold)
            if prev:
                f1 = bm.faces.new([prev[0], prev[1], m, a])
                f2 = bm.faces.new([prev[1], prev[2], b, m])
                for face, (v0, v1) in ((f1, (0, 0.5)), (f2, (0.5, 1))):
                    for loop, (u, v) in zip(face.loops, [(prev[3], v0), (prev[3], v1), (t, v1), (t, v0)]):
                        loop[uv].uv = (u * 1.0 + v * 0.02, v)
            prev = (a, m, b, t)
    ob = mesh_obj(name + "_fronds", bm, M["palm_leaf"], smooth=True)
    ob.modifiers.new("thick", "SOLIDIFY").thickness = 0.01


import random
random.seed(7)
bm_trees = bmesh.new()
for k in range(140):
    a = random.uniform(0, 2 * math.pi)
    r = random.uniform(48, 85)
    cx, cy = math.cos(a) * r, math.sin(a) * r + 6
    if cy < -14 and abs(cx) < 18:
        continue  # keep the street view open in front of the camera
    for j in range(random.randint(2, 4)):
        rad = random.uniform(2.0, 4.2)
        bmesh.ops.create_icosphere(bm_trees, subdivisions=2, radius=rad,
                                   matrix=Matrix.Translation((cx + random.uniform(-2, 2), cy + random.uniform(-2, 2), rad * random.uniform(0.9, 1.6))))
M["trees"] = mat("trees", (0.04, 0.09, 0.03, 1), 0.95)
color_variation(M["trees"], (0.025, 0.06, 0.02, 1), (0.09, 0.15, 0.05, 1), 0.08)
add_bump(M["trees"], 6, 0.9, kind="voronoi")
trees = mesh_obj("tree_line", bm_trees, M["trees"], smooth=True)
disp = trees.modifiers.new("disp", "DISPLACE")
tex = bpy.data.textures.new("tree_noise", "CLOUDS")
tex.noise_scale = 1.2
disp.texture = tex
disp.strength = 2.2

palm("palm1", -10.5, -1.0, 7.5, (0.05, -0.03))
palm("palm2", -10.0, 3.5, 6.2, (-0.06, 0.02))
palm("palm3", 9.8, -6.8, 8.2, (0.04, -0.04))
palm("palm4", 10.8, 6.0, 7.0, (-0.03, 0.03))
palm("palm5", -10.0, 12.0, 6.6, (0.05, 0.02))

# ───────────────────────── lights and sky ─────────────────────────

world = bpy.data.worlds.new("world")
scene.world = world
world.use_nodes = True
wn, wl = world.node_tree.nodes, world.node_tree.links
bg = wn["Background"]
sky = wn.new("ShaderNodeTexSky")
wl.new(sky.outputs["Color"], bg.inputs["Color"])

sun = bpy.data.lights.new("sun", "SUN")
sun_ob = bpy.data.objects.new("sun", sun)
col.objects.link(sun_ob)
sun.angle = math.radians(0.6)

# night: warm interior lights, path and pool lights
night_lights = []


def area(name, loc, size, color, energy, rot=(0, 0, 0)):
    li = bpy.data.lights.new(name, "AREA")
    li.size = size
    li.color = color
    li.energy = energy
    ob = bpy.data.objects.new(name, li)
    ob.location = loc
    ob.rotation_euler = rot
    col.objects.link(ob)
    night_lights.append(li)
    return li


WARM = (1.0, 0.72, 0.45)
for x in (-5, -2, 1, 4):
    area(f"in_A{x}", (x, -2.0, 2.9), 1.2, WARM, 0.0)
    area(f"in_A{x}b", (x, 2.5, 2.9), 1.2, WARM, 0.0)
for x in (-2, 1.5, 4.5):
    area(f"in_B{x}", (x, -1.0, 6.25), 1.2, WARM, 0.0)
pool_light = area("pool_light", (0, 9, -1.2), 6.0, (0.55, 0.85, 1.0), 0.0)
for x in (-6.5, 6.5):
    area(f"wash{x}", (x, -5.2, 0.15), 0.3, WARM, 0.0, (math.radians(-80), 0, 0))

TIMES = {
    #           sun elevation, azimuth (deg), sun strength, sky strength, night lights
    # az: 0 = sun behind the camera's facade side, negative = from the left, positive = from the right
    "morning": dict(el=20, az=-40, sun=3.8, sky=0.18, lights=0.0),
    "noon": dict(el=50, az=-30, sun=4.0, sky=0.25, lights=0.0),
    "sunset": dict(el=5, az=58, sun=2.4, sky=0.2, lights=10.0),
    "night": dict(el=-8, az=300, sun=0.0, sky=0.25, lights=110.0),
}


def set_sky_type():
    items = [e.identifier for e in sky.bl_rna.properties["sky_type"].enum_items]
    for want in ("MULTIPLE_SCATTERING", "NISHITA", "SINGLE_SCATTERING", "HOSEK_WILKIE"):
        if want in items:
            sky.sky_type = want
            return want
    return items[0]


SKY_TYPE = set_sky_type()


VIEW_FACING = {"front": 0.0, "back": math.pi, "aerial": 0.0}
current_view = ["front"]


def set_time(name):
    t = TIMES[name]
    el = math.radians(t["el"])
    az = math.radians(t["az"]) + VIEW_FACING[current_view[0]]
    for attr, val in (("sun_elevation", max(el, math.radians(-4))),):
        if hasattr(sky, attr):
            setattr(sky, attr, val)
    if hasattr(sky, "sun_intensity"):
        sky.sun_intensity = 0.0 if name == "night" else 1.0
    if hasattr(sky, "sun_disc"):
        sky.sun_disc = False  # the sun lamp gives crisp shadows; the disc would double it
    bg.inputs["Strength"].default_value = t["sky"]
    # sun position: az 0 puts it out in front of the facade (-Y); positive swings it toward +X
    pos = Vector((math.cos(el) * math.sin(az), -math.cos(el) * math.cos(az), math.sin(max(el, 0.02))))
    sun_ob.rotation_euler = (-pos).to_track_quat("-Z", "Y").to_euler()
    if hasattr(sky, "sun_rotation"):
        sky.sun_rotation = math.atan2(pos.y, pos.x)
    sun.energy = t["sun"]
    sun.color = (1.0, 0.82, 0.62) if name in ("morning", "sunset") else (1.0, 0.97, 0.92)
    if name == "night":
        # moonlight
        sun.energy = 0.35
        sun.color = (0.55, 0.65, 1.0)
        sun_ob.rotation_euler = (math.radians(50), 0, math.radians(200))
        bg.inputs["Strength"].default_value = 0.0
    for li in night_lights:
        li.energy = t["lights"] * (2.5 if li.name == "pool_light" else 1.0) * (0.6 if li.name.startswith("wash") else 1.0)
    if name == "night":
        # deep blue night sky
        wl.new(wn.new("ShaderNodeRGB").outputs[0], bg.inputs["Color"])
        rgb = [n for n in wn if n.type == "RGB"][0]
        rgb.outputs[0].default_value = (0.02, 0.035, 0.085, 1)
        bg.inputs["Strength"].default_value = 1.0
    else:
        for n in [n for n in wn if n.type == "RGB"]:
            wn.remove(n)
        wl.new(sky.outputs["Color"], bg.inputs["Color"])


# ───────────────────────── cameras ─────────────────────────

VIEWS = {
    "front": dict(loc=(-9.0, -19.5, 1.7), look=(0.6, -2.0, 3.0), lens=32),
    "back": dict(loc=(9.2, 13.2, 1.65), look=(-1.5, 3.5, 2.6), lens=21),
    "aerial": dict(loc=(-24, -26, 17), look=(0.5, 1.0, 1.5), lens=34),
}
cam = bpy.data.cameras.new("cam")
cam_ob = bpy.data.objects.new("cam", cam)
col.objects.link(cam_ob)
scene.camera = cam_ob


def set_view(name):
    current_view[0] = name
    v = VIEWS[name]
    cam.lens = v["lens"]
    cam.sensor_width = 36
    cam_ob.location = v["loc"]
    d = Vector(v["look"]) - Vector(v["loc"])
    cam_ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    # two-point perspective: keep verticals vertical with a lens shift instead of tilting
    pitch = math.atan2(d.z, Vector((d.x, d.y)).length)
    cam_ob.rotation_euler = Vector((d.x, d.y, 0)).to_track_quat("-Z", "Y").to_euler()
    cam.shift_y = math.tan(pitch) * cam.lens / cam.sensor_width * (RES[0] / max(RES)) * 1.0


# ───────────────────────── render settings ─────────────────────────

scene.render.engine = "CYCLES"
cy = scene.cycles
cy.device = "CPU"
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.02
cy.max_bounces = 8
cy.glossy_bounces = 4
cy.transmission_bounces = 8
cy.transparent_max_bounces = 16
cy.caustics_reflective = False
cy.caustics_refractive = False
cy.blur_glossy = 1.0
scene.render.resolution_x, scene.render.resolution_y = RES
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    scene.view_settings.view_transform = "Filmic"


def beauty(view, time):
    set_view(view)
    set_time(time)
    cy.samples = args.samples
    cy.use_denoising = True
    cy.filter_width = 1.5
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    path = os.path.join(OUT, f"{view}-{time}.png")
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return path


# ───────────────────────── masks ─────────────────────────

def flat(name, rgb):
    return emit(name, (*rgb, 1), 1.0)


def grain_material():
    """Frame coverage in R and a wood-grain value in B, so woodgrain foils can be faked."""
    m = bpy.data.materials.new("mask_frame")
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    n.remove(n["Principled BSDF"])
    tc = n.new("ShaderNodeTexCoord")
    wave = n.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "Z"
    wave.inputs["Scale"].default_value = 18
    wave.inputs["Distortion"].default_value = 9
    wave.inputs["Detail"].default_value = 4
    l.new(tc.outputs["Object"], wave.inputs["Vector"])
    comb = n.new("ShaderNodeCombineColor")
    comb.inputs["Red"].default_value = 1.0
    comb.inputs["Green"].default_value = 0.0
    l.new(wave.outputs["Fac"], comb.inputs["Blue"])
    e = n.new("ShaderNodeEmission")
    l.new(comb.outputs[0], e.inputs["Color"])
    l.new(e.outputs[0], n["Material Output"].inputs["Surface"])
    return m


def with_override(assign, fn):
    """Temporarily swap every object's materials, run fn, then restore."""
    saved = {}
    for ob in scene.objects:
        if ob.type != "MESH":
            continue
        saved[ob.name] = [s.material for s in ob.material_slots]
        mats = assign(ob)
        for k, s in enumerate(ob.material_slots):
            s.material = mats[min(k, len(mats) - 1)]
    lights = {li.name: li.energy for li in bpy.data.lights}
    for li in bpy.data.lights:
        li.energy = 0
    world_strength = bg.inputs["Strength"].default_value
    bg.inputs["Strength"].default_value = 0
    try:
        fn()
    finally:
        for ob in scene.objects:
            if ob.name in saved:
                for k, s in enumerate(ob.material_slots):
                    s.material = saved[ob.name][k]
        for li in bpy.data.lights:
            li.energy = lights[li.name]
        bg.inputs["Strength"].default_value = world_strength


def exr_render(path, samples, filter_width):
    cy.samples = samples
    cy.use_denoising = False
    cy.use_adaptive_sampling = False
    cy.filter_width = filter_width
    cy.max_bounces = 0
    scene.render.image_settings.file_format = "OPEN_EXR"
    scene.render.image_settings.color_depth = "32"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    cy.max_bounces = 8
    cy.use_adaptive_sampling = True


def masks(view):
    set_view(view)
    black = flat("mask_black", (0, 0, 0))
    glass = flat("mask_glass", (0, 1, 0))
    frame = grain_material()
    ids = {i: flat(f"id_{i}", ((i + 1) / 255.0, 0, 0)) for i in range(len(OPENING_OBJS))}

    def mask_assign(ob):
        if "opening" in ob:
            return [frame, glass, black]
        return [black]

    def id_assign(ob):
        if "opening" in ob:
            return [ids[ob["opening"] - 1]]
        return [black]

    vt = scene.view_settings.view_transform
    scene.view_settings.view_transform = "Standard"
    mpath = os.path.join(OUT, f"{view}-mask.exr")
    ipath = os.path.join(OUT, f"{view}-id.exr")
    with_override(mask_assign, lambda: exr_render(mpath, 16, 1.5))
    with_override(id_assign, lambda: exr_render(ipath, 1, 0.01))
    scene.view_settings.view_transform = vt
    return mpath, ipath


# ───────────────────────── run ─────────────────────────

if args.blend:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))

meta = {
    "size": list(RES),
    "sky": SKY_TYPE,
    "openings": [{"n": i + 1, "kind": o["kind"], "style": o["style"], "side": o["side"], "w": o["w"], "h": o["h"]} for i, o in enumerate(OPENINGS)],
}
with open(os.path.join(OUT, "openings.json"), "w") as f:
    json.dump(meta, f, indent=1)

for view in args.views.split(","):
    masks(view)
    if not args.only_masks:
        for time in args.times.split(","):
            beauty(view, time)
print("DONE", OUT)
