from dg import Diagram
from registry import figure


@figure
def fig_8_3():
    d = Diagram("fig-8-3", 864, 440, "BFFs per experience",
                "The fan app calls its own Fan BFF, owned by the fan-web team, which fans out to Catalog, "
                "Inventory and Orders; the organizer web app calls the Organizer BFF, which uses Catalog and "
                "Analytics; Inventory's seat events reach the fan app through a realtime SSE edge.")
    PX, PW = 24, 136
    BX, BW = 336, 176
    SX, SW = 680, 160
    # connectors
    d.path([(760, 112), (760, 56), (BX + BW, 56)], dashed=True, label="SEAT EVENTS", at=1)
    d.path([(BX, 56), (92, 56), (92, 180)], dashed=True, label="SSE · SEAT UPDATES", at=0)
    d.path([(PX + PW, 208), (BX, 208)], label="REQUESTS")
    d.path([(PX + PW, 352), (BX, 352)], label="REQUESTS")
    d.path([(BX + BW, 192), (596, 192), (596, 136), (SX, 136)])
    d.path([(BX + BW, 208), (SX, 208)])
    d.path([(BX + BW, 224), (596, 224), (596, 272), (SX, 272)])
    d.path([(BX + BW, 336), (620, 336), (620, 288), (SX, 288)])
    d.path([(BX + BW, 360), (SX, 360)])
    # nodes
    d.node(PX, 180, PW, 56, "Fan app", None, "input")
    d.node(PX, 324, PW, 56, "Organizer web", None, "input")
    d.node(BX, 32, BW, 48, "Real-time edge (SSE)")
    d.node(BX, 180, BW, 56, "Fan BFF", "owned by fan-web team", "focal")
    d.node(BX, 324, BW, 56, "Organizer BFF", None, "focal")
    d.node(SX, 112, SW, 48, "Inventory")
    d.node(SX, 184, SW, 48, "Orders")
    d.node(SX, 256, SW, 48, "Catalog")
    d.node(SX, 336, SW, 48, "Analytics")
    d.legend([("input", "Experience"), ("focal", "BFF · frontend-owned"), ("backend", "Service"),
              ("arrow:muted", "Call"), ("arrow:muted:dashed", "Pushed event")])
    return d
